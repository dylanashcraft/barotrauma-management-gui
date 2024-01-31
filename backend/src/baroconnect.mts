import * as nodepty from "node-pty";
//import steamconnector from "./steamconnect.mjs"
import {Player} from "./main.js";

import * as fs from "fs-extra";
function remoteconnect(){
  const PW: string = (fs.readJSONSync("secrets.json")).sshPW;
  const Terminal = nodepty.spawn("tmux", "new ssh btserver@140.82.22.198 -p 9090", {});
  Terminal.onData((data)=>{
    process.stdout.write(data);
  });
  Terminal.write("yes\n");
  Terminal.write(`${PW}\n`);
  Terminal.write("../btserver c\n");
  return Terminal;
}
export default class BaroConnect{
  #server;
  #playerlist: Map<Player["name"], Player>;
  static #singelton = false;
  constructor(guard = true){
    if(guard === true){throw "Do not construct directly, use the static create method"};
    if(BaroConnect.#singelton === true){throw "Do not create multiple instances of BaroConnect"};
    BaroConnect.#singelton = true;
    //this.#server = nodepty.spawn("../btserver", "c", {});
    //this.#server.write("\n");
    this.#server = remoteconnect();
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