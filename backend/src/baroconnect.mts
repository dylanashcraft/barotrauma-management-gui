import * as nodepty from "node-pty";
//import steamconnector from "./steamconnect.mjs"
import {Player} from "./main.mjs";
import fs from "fs-extra";

export default class BaroConnect{
  #server;
  #playerlist: Map<Player["name"], Player>;
  static #singleton = false;
  constructor(guard = true){
    if(guard === true){throw "Do not construct directly, use the static create method"};
    if(BaroConnect.#singleton === true){throw "Do not create multiple instances of BaroConnect"};
    BaroConnect.#singleton = true;
    this.#server = this.#initTerminal();
    this.#server.write("\n");
    this.#playerlist = this.#initPlayerList();
  }
  #initTerminal(){
    const term = nodepty.spawn("bash", [], {});
    //term.onData((data)=>{process.stdout.write(`RAW:${data}`)});
    term.write("cd ~/\n");
    term.write("./btserver c\n");
    return term;
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
    const responseList:string[] = [];
    let listener = this.#server.onData((data)=>{
      responseList.push(JSON.stringify(data));
      if(responseList.length >= 100){
        fs.writeFileSync("test.json", JSON.stringify(responseList));
        listener.dispose();
      }
      
    });
    this.runCommand(`clientlist`);
    ///(?<=[0-9]:).*?(?=ping)/g
    return [["test", {name: "test", steamid:0}]]; //temporary filler data
  }
}
/*commands to implement:
  clientlist: needs custom event logic
*/