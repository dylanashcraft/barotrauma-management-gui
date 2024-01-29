import * as nodepty from "node-pty";
//import steamconnector from "./steamconnect.mjs"
import {Player} from "./main.js";

export class PlayerlistView{
  #server
  #playerlist: Map<string, Player>
  constructor(guard = true){
    if(guard === true){throw "Do not construct directly, use the static create method"}
    this.#server = nodepty.spawn("../btserver", ["c"], {});
    this.#playerlist = new Map();
  }
  #initPlayerList(){
    this.#server.write
  }
  static create(){
    return new PlayerlistView(false);
  }
  onJoin(callFunc:Function){
    this.#server.onData((data)=>{
      if(data.includes("has joined the server.")){

      }
    })
  }
}