"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const port = 3000;
const wss = new ws_1.WebSocketServer({ port: port });
let frontendRequest = [];
let playerList = [];
playerList.push({ steamid: '4484', name: 'Frank' }, { steamid: '8372', name: 'Tom_Ran' });
wss.on('connection', (ws) => {
    ws.on('error', console.error);
    console.log("client connected");
    ws.send(JSON.stringify(playerList));
});
wss.on('close', (ws) => {
    console.log("client disconnected");
});
//# sourceMappingURL=main.js.map