import * as nodepty from "node-pty";
//import steamconnector from "./steamconnect.mjs"
import {Player} from "../../shared/interfaces.mjs";
import fs from "fs-extra";
import EventEmitter from "events";

export default class BaroConnect{
  #server;
  #EventHandler;
  #playerlist: Map<Player["accountname"], Player>;
  #playerhistory: Map<Player["accountname"], Player>;
  #dirty = true;
  static #guard = true;
  static #singleton = false;
  constructor(){
    if(BaroConnect.#guard === true){throw "Do not construct directly, use the static create method"};
    if(BaroConnect.#singleton === true){throw "Do not create multiple instances of BaroConnect"};
    BaroConnect.#singleton = true;
    this.#server = this.#initTerminal();
    this.#server.write("\n");
    this.#playerlist = this.#initPlayerList();
    this.#playerhistory = new Map();
    this.#initEvents();
    BaroConnect.#guard = true;
    this.#EventHandler = new EventEmitter();
  }
  #initTerminal(){
    const term = nodepty.spawn("bash", [], {});
    //term.onData((data)=>{process.stdout.write(`RAW:${data}`)});
    term.write("cd ~/\n");
    term.write("./btserver c\n");
    return term;
  }
  #initPlayerList(){
    const list = new Map(this.#clientList());
    return list;
  }
  #initEvents(){
    this.#onJoin();
    this.#onLeave();
    this.#onNameChange();
  }
  static create(){
    this.#guard = false
    return new BaroConnect();
  }
  #onJoin(){
    this.#server.onData((data)=>{
      if(data.includes("has joined the server.")){
        const player = data.match(/\] *(.*) has joined the server/)?.[1];
        if(player && this.#playerhistory.has(player)){
          this.#playerlist.set(player, this.#playerhistory.get(player) as Player);
          this.#EventHandler.emit("change");
        }else{
          this.#dirty = true;
          this.#EventHandler.emit("rebuild");
        }
      }
    });
  }
  #onLeave(){
    this.#server.onData((data)=>{
      if(data.includes("has left the server.")){
        const player = data.match(/\] *(.*) has left the server/)?.[1];
        if(player && this.#playerlist.has(player)){
          this.#playerhistory.set(player, this.#playerlist.get(player) as Player);
          this.#playerlist.delete(player);
          this.#EventHandler.emit("change");
        }else{
          this.#logErr(`Player ${player} has left but never joined.`);
          this.#dirty = true;
          this.#EventHandler.emit("rebuild");
        }
      }
    });
  }
  #onNameChange(){
    this.#server.onData((data)=>{
      if(data.includes("has changed their name to")){
        const [,oldname, newname] = data.match(/Player (.*) has changed their name to (.*)./) as RegExpMatchArray;
        if(oldname && newname && this.#playerlist.has(oldname)){
          let entry = this.#playerlist.get(oldname) as Player;
          entry.aliases?.add(oldname) ?? Object.defineProperty(entry, "aliases", new Set([oldname])); //I THINK this works.
          this.#playerlist.set(newname, entry);
          this.#playerlist.delete(oldname);
          this.#EventHandler.emit("change");
        }
      }else if(data.includes("previously used the name")){
        const [,name, oldname] = data.match(/\]\n *(.*) previously used the name "(.*)"/) as RegExpMatchArray;
        if(name && oldname && this.#playerlist.has(name)){
          let entry = this.#playerlist.get(name) as Player;
          entry.aliases?.add(oldname) ?? Object.defineProperty(entry, "aliases", new Set([oldname])); //I THINK this works.
          this.#playerlist.set(name, entry);
          this.#EventHandler.emit("change");
        }
      }
    });
  }
  #runCommand(command: string){
    this.#server.write(`${command}\n`);
  }
  say(message: string){
    this.#runCommand(`say ${message}`)
  }
  orangeboyify(player: string){
    this.#runCommand(`spawn Orangeboy inside`); // Spawn orange inside living environment
    this.#runCommand(`setclientcharacter ${player}`); // Set player to newly spawned orange
    this.#runCommand(`say 'A ${player} has been sprinkled with fairy dust.'`);
  }
  kick(player: string){
    this.#runCommand(`kick ${player}`);
  }
  kickID(player: string){
    this.#runCommand(`kickid ${player}`);
  }
  ban(player: string){
    this.#runCommand(`ban ${player}`);
  }
  banID(player: string){
    this.#runCommand(`banid ${player}`);
  }
  banEndpoint(player: string){
    this.#runCommand(`banendpoint ${player}`);
  }
  banIP(player: string){
    this.#runCommand(`banip ${player}`);
  }
  get Players(){
    if(this.#dirty){
      this.#clientList().forEach(([name, data])=>{this.#playerlist.set(name, data)});
    }
    return {PlayerList: this.#playerlist, PlayerHistory: this.#playerhistory};
  }
  #clientList(): Array<[Player["playername"], Player]>{
    let responseList: Array<[Player["playername"], Player]> | unknown[] = [];
    const listener = this.#server.onData((data)=>{
      const regex = /(?<=[0-9]: ).*?(?=, ping)/g;
      const list = [...data.matchAll(regex)];
      for(const player of list){
        if(player[0] !== null){
          const matcharray = player[0].match(/(.*) playing (.*), (.*), Some<AccountId>\((.*)_(.*)\)/);
          if(!matcharray){
            this.#logErr(`matcharray is ${matcharray}, input was: ${player[0]}.`)
          }else if(matcharray.length !== 6){
            this.#logErr(`matcharray is of incorrect size, size: ${matcharray.length}, matcharray: ${matcharray}, input was: ${player[0]}.`)
          }else if(matcharray?.length === 6 && (matcharray.length > matcharray.filter(() => true).length)){
            const name = matcharray[2] as string;
            if(this.#playerhistory.has(name)){
              responseList.push([name, this.#playerhistory.get(name) as Player]);
            }else if(this.#playerlist.has(name)){
              responseList.push([name, this.#playerlist.get(name) as Player])
            }else{
              responseList.push([name, {playername: name, accountname: matcharray[1], playerid: matcharray[5], type: matcharray[4] === "STEAM" ? "steam" : "other"} as Player])
            }
          }else{
            this.#logErr(`matcharray is invalid, matcharray: ${matcharray}, input was: ${player[0]}.`)
          }
        }
      }
      //fs.appendFileSync("test.json", JSON.stringify(data.matchAll(regex)));
    });
    this.#runCommand(`clientlist`);
    listener.dispose();
    this.#dirty = false;
    return responseList as Array<[Player["playername"], Player]>;
  }
  #logErr(error: string){
    fs.appendFileSync("logs/backend.log", error);
  }
  on(type: "change"|"rebuild" , func: Function){
    switch(type){
      case "change":
        this.#EventHandler.on("change", func());
      break;
      case "rebuild":
        this.#EventHandler.on("change", func());
      break;
      default:
        this.#logErr("Invalid event type");
      break;
    }
  }
}