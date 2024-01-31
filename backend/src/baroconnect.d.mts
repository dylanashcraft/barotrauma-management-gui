import { Player } from "./main.js";
export default class BaroConnect {
    #private;
    constructor(guard?: boolean);
    static create(): BaroConnect;
    get playerlist(): Map<string, Player>;
    runCommand(command: string): void;
    kick(player: string): void;
    kickID(player: string): void;
    ban(player: string): void;
    banID(player: string): void;
    banEndpoint(player: string): void;
    banIP(player: string): void;
    clientList(): [[Player["name"], Player]];
}
