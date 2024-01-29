import * as nodepty from "node-pty";

const playerlist = new Map
const server = nodepty.spawn("../btserver", ["c"], {});
server.onData((data)=>{
  
})