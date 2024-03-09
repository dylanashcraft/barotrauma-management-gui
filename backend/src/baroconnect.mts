import * as nodepty from "node-pty";
//import steamconnector from "./steamconnect.mjs"
import {Player} from "./main.mjs";
import fs from "fs-extra";

export default class BaroConnect{
  #server;
  #playerlist: Map<Player["accountname"], Player>;
  #playerhistory: Map<Player["accountname"], Player>;
  #dirty = true;
  static #singleton = false;
  constructor(guard = true){
    if(guard === true){throw "Do not construct directly, use the static create method"};
    if(BaroConnect.#singleton === true){throw "Do not create multiple instances of BaroConnect"};
    BaroConnect.#singleton = true;
    this.#server = this.#initTerminal();
    this.#server.write("\n");
    this.#playerlist = this.#initPlayerList();
    this.#playerhistory = new Map();
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
  static create(){
    return new BaroConnect(false);
  }
  //WIP
  #onJoin(){
    this.#server.onData((data)=>{
      if(data.includes("has joined the server.")){
        let player = data.match(/\] *(.*) has joined the server/)?.[1];
        if(this.#playerhistory.has(`${player}`)){
          this.#playerhistory.delete(`${player}`);
        }
        this.#dirty = true;
      }
    });
  }
  //WIP
  #onLeave(){
    this.#server.onData((data)=>{
      if(data.includes("has left the server.")){
        this.#dirty = true;
      }
    });
  }
  //WIP
  #onNameChange(){
    this.#server.onData((data)=>{
      if(data.includes("has left the server.")){
        this.#dirty = true;
      }
    });
  }
  runCommand(command: string){
    this.#server.write(`${command}\n`);
  }
  say(message: string){
    this.runCommand(`say ${message}`)
  }
  orangeboyify(player: string){
    this.runCommand(`spawn Orangeboy inside`); // Spawn orange inside living environment
    this.runCommand(`setclientcharacter ${player}`); // Set player to newly spawned orange
    this.runCommand(`say 'A ${player} has been sprinkled with fairy dust.'`);
  }
  kick(player: string){
    this.runCommand(`kick ${player}`);
  }
  kickID(player: string){
    this.runCommand(`kickid ${player}`);
  }
  ban(player: string){
    this.runCommand(`ban ${player}`);
  }
  banID(player: string){
    this.runCommand(`banid ${player}`);
  }
  banEndpoint(player: string){
    this.runCommand(`banendpoint ${player}`);
  }
  banIP(player: string){
    this.runCommand(`banip ${player}`);
  }
  get PlayerList(){
    if(this.#dirty){
      this.#clientList();
    }
    return this.#playerlist;
  }
  get PlayerHistory(){
    return this.#playerhistory;
  }
  #clientList(): Array<[Player["playername"], Player]>{
    let responseList: Array<[Player["playername"], Player]> | unknown[] = [];
    let listener = this.#server.onData((data)=>{
      const regex = /(?<=[0-9]: ).*?(?=, ping)/g;
      let list = [...data.matchAll(regex)];
      for(const player of list){
        if(player[0] !== null){
          let matcharray = player[0].match(/(.*) playing (.*), (.*), Some<AccountId>\((.*)_(.*)\)/);
          if(!matcharray){
            this.#logErr(`matcharray is ${matcharray}, input was: ${player[0]}.`)
          }else if(matcharray?.length === 6){
            responseList.push([matcharray[2] as string, {playername: matcharray[2], accountname: matcharray[1], playerid: matcharray[5], type: matcharray[4] === "STEAM" ? "steam" : "other", ip: matcharray[3]} as Player])
          }else if(matcharray.length !== 6){
            this.#logErr(`matcharray is of incorrect size, size: ${matcharray.length}, matcharray: ${matcharray}, input was: ${player[0]}.`)
          }else{
            this.#logErr(`matcharray is invalid, matcharray: ${matcharray}, input was: ${player[0]}.`)
          }
        }
      }
      //fs.appendFileSync("test.json", JSON.stringify(data.matchAll(regex)));
    });
    this.runCommand(`clientlist`);
    listener.dispose();
    this.#dirty = false;
    return responseList as Array<[Player["playername"], Player]>;
  }
  #logErr(error: string){
    fs.appendFileSync("backend.error.log", error);
  }
}
//work on state management for #playerlist && #playerhistory
//finish #onJoin(), #onLeave(), && #onNameChange()
//possibly ad event handler for above