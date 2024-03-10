import * as nodepty from "node-pty";
//import steamconnector from "./steamconnect.mjs"
import {Player} from "../../shared/interfaces.mjs";
import fs from "fs-extra";

export default class BaroConnect{
  #server;
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
        }
        this.#dirty = true;
      }else if(data.includes("previously used the name")){
        const [,name, oldname] = data.match(/\]\n *(.*) previously used the name "(.*)"/) as RegExpMatchArray;
        if(name && this.#playerlist.has(name)){
          let entry = this.#playerlist.get(name) as Player;
          entry.aliases?.push(oldname as string) ?? Object.defineProperty(entry, "aliases", [oldname]); //I THINK this works.
          this.#playerlist.set(name, entry);
        }
        this.#dirty = true;
      }
    });
  }
  #onLeave(){
    this.#server.onData((data)=>{
      if(data.includes("has left the server.")){
        const player = data.match(/\] *(.*) has left the server/)?.[1];
        if(player && this.#playerlist.has(player)){
          this.#playerhistory.set(player, this.#playerlist.get(player) as Player);
        }else{
          this.#logErr(`Player ${player} has left but never joined.`)
        }
        this.#dirty = true;
      }
    });
  }
  #onNameChange(){
    this.#server.onData((data)=>{
      
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
      this.#clientList();
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
            }else{
              responseList.push([name, {playername: name, accountname: matcharray[1], playerid: matcharray[5], type: matcharray[4] === "STEAM" ? "steam" : "other", ip: matcharray[3]} as Player])
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
}
//work on state management for #playerlist && #playerhistory
//finish #onJoin(), #onLeave(), && #onNameChange()
//possibly ad event handler for above