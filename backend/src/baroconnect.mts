import * as nodepty from "node-pty";
//import steamconnector from "./steamconnect.mjs"
import {Player} from "./main.mjs";

export default class BaroConnect{
  #server;
  #playerlist: Map<Player["name"], Player>;
  static #singleton = false;
  constructor(guard = true){
    if(guard === true){throw "Do not construct directly, use the static create method"};
    if(BaroConnect.#singleton === true){throw "Do not create multiple instances of BaroConnect"};
    BaroConnect.#singleton = true;
    this.#server = nodepty.spawn("../btserver", "c", {});
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
  clientList():[[Player["name"], Player]]{
    let listener = this.#server.onData((data)=>{
      process.stdout.write(data);
    });
    this.runCommand(`clientlist`);
    listener.dispose();
    return [["test", {name: "test", steamid:0}]]; //temporary filler data
  }
}
/*commands to implement:
  clientlist: needs custom event logic
*/