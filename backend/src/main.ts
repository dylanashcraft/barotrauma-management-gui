import WebSocket, { WebSocketServer } from 'ws';

const port = 3000;
const wss = new WebSocketServer({ port: port });

export interface Player {
    steamid: string;
    name: string;
}

let frontendRequest: {name: string, command: string}[] = [];

let playerList: Player[] = []; // Players that have joined since start.
playerList.push({ steamid: '4484', name: 'Frank' }, { steamid: '8372', name: 'Tom_Ran' });

wss.on('connection', (ws: WebSocket) => {
    ws.on('error', console.error);
    console.log("client connected");
    
   ws.send(JSON.stringify(playerList));
});

wss.on('close', (ws: WebSocket) => {
    console.log("client disconnected");
});
