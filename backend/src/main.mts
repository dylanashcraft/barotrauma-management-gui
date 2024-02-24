import WebSocket, { RawData, WebSocketServer } from "ws";
import BaroConnect from "./baroconnect.mjs";
const port = 3000;
const wss = new WebSocketServer({ port: port });


export interface Player {
    steamid: string|number;
    name: string;
}


//let frontendRequest: {name: string, command: string}[] = [];

let playerList: Player[] = []; // Players that have joined since start.
playerList.push({ steamid: '4484', name: 'Frank' }, { steamid: '8372', name: 'Tom_Ran' });

console.log("client connected");
wss.on('connection', (ws: WebSocket) => {
        ws.on('error', console.error);
        console.log("client connected");
        
        ws.on('message', function message(message: RawData){
            console.log("message?")
            try {
                const { topic, payload } = JSON.parse(message.toString());
                switch (topic) { // Event is message is `topic` (-> command) with `payload` (-> param e.g. user).
                    case "orange":
                        console.log(`orange button:${payload}`);
                        break;
                    default:
                        console.log(`Unknown topic: ${topic} with payload:${payload}`);
                }
            } catch (e) { console.error(e); }
            
            // TODO: pass data to BaroConnect method to send user and command to server.
        })
       ws.send(JSON.stringify(playerList));
});


wss.on('close', (ws: WebSocket) => {
    console.log("client disconnected");
});
