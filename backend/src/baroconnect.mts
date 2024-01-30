import * as nodepty from "node-pty";
//import steamconnector from "./steamconnect.mjs"
import {Player} from "./main.js";

export class BaroConnect{
  #server;
  #playerlist: Map<Player["name"], Player>;
  static #singelton = false;
  constructor(guard = true){
    if(guard === true){throw "Do not construct directly, use the static create method"};
    if(BaroConnect.#singelton === true){throw "Do not create multiple instances of BaroConnect"};
    BaroConnect.#singelton = true;
    this.#server = nodepty.spawn("../btserver", ["c"], {});
    this.#server.write("\n");
    this.#playerlist = this.#initPlayerList();
  }
  #initPlayerList(){
    const list = new Map(this.clientList());
    return list;
  }
  static create(){
    return new BaroConnect(false);
  }
  #onJoin(){
    this.#server.onData((data)=>{
      if(data.includes("has joined the server.")){

      }
    });
  }
  #onLeave(){
    this.#server.onData((data)=>{
      if(data.includes("has left the server.")){

      }
    });
  }
  get playerlist(){
    return this.#playerlist;
  }
  runCommand(command: string){
    this.#server.write(`${command}\n`);
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
  clientList(){
    let listener = this.#server.onData((data)=>{
      //get raw return data and format into custom data structure, then return it.
    });
    this.runCommand(`clientlist`);
    listener.dispose();
  }
}
/*commands to implement:
  clientlist: needs custom event logic
*/