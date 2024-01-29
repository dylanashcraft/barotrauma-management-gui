import * as nodepty from "node-pty";
//import steamconnector from "./steamconnect.mjs"
import {Player} from "./main.js";

export class PlayerlistView{
  #server;
  #playerlist: Map<string, Player>;
  constructor(guard = true){
    if(guard === true){throw "Do not construct directly, use the static create method"}
    this.#server = nodepty.spawn("../btserver", ["c"], {});
    this.#server.write("\n");
    this.#playerlist = new Map();
  }
  #initPlayerList(){
    this.#server.write
  }
  static create(){
    return new PlayerlistView(false);
  }
  #onJoin(){
    this.#server.onData((data)=>{
      if(data.includes("has joined the server.")){

      }
    });
  }
  runCommand(command: string){
    this.#server.write(`${command}\n`);
  }
  kickPlayer(player: string){
    this.runCommand(`kick ${player}`);
  }
}
/*commands to implement:
  kick
  kickid
  ban
  banid
  clientlist
  banendpoint/banip
*/