import WebSocket, { RawData, WebSocketServer } from "ws";
import BaroConnect from "./baroconnect.mjs";
const port = 3000;
const wss = new WebSocketServer({ port: port });
import { Player } from "../../shared/interfaces.mjs";

//let frontendRequest: {name: string, command: string}[] = [];


const baroconnect = BaroConnect.create();
baroconnect.Players //get Players method
console.log("client connected");
wss.on('connection', (ws: WebSocket) => {
    ws.on('error', console.error);
    console.log("client connected");

    ws.on('message', function message(message: RawData) {
        console.log("message?")
        try {
            const { topic, payload } = JSON.parse(message.toString());
            switch (topic) { // Event is message is `topic` (-> command) with `payload` (-> param e.g. user).
                case "orange":
                    console.log(`orange button:${payload}`);
                    break;
                case "ban":
                    console.log(`ban button:${payload}`);
                    break;
                case "kick":
                    console.log(`kick button:${payload}`);
                    break;
                case "customcommand":
                    console.log(`custom command to run:${payload}`);
                    break;
                default:
                    console.log(`Unknown topic: ${topic} with payload:${payload}`);
            }
        } catch (e) { console.error(e); }

        // TODO: pass data to BaroConnect method to send user and command to server.
    })
    ws.send(JSON.stringify([Array.from(baroconnect.Players.PlayerList), Array.from(baroconnect.Players.PlayerHistory)]));
});


wss.on('close', (ws: WebSocket) => {
    console.log("client disconnected");
});
