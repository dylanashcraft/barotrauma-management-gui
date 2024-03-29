import React from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import NavBar from "./NavBar";

import {Player} from "../../../shared/interfaces.mjs";


const Player: React.FC = () => {
    const wsURL = "ws://localhost:3000";
    const {
        sendJsonMessage,
        lastMessage,
    } = useWebSocket(wsURL, {
        onOpen: () => console.log("opened"),
        shouldReconnect: () => true,
    });

    const [playerList, setPlayerList] = React.useState<Array<Player>>([]);
    React.useEffect(() => {
        if (lastMessage) {
            const [PlayerList, PlayerHistory] = [JSON.parse(lastMessage.data)[0], JSON.parse(lastMessage.data)[1]];
            setPlayerList(data);
            console.log(data);
        }
    }, [lastMessage]);

    const handleButtonCommand = (player: string, buttonCommand: string) => {
        if (ReadyState.OPEN === 1) {
            console.log(`Using:${buttonCommand} with ${player}`);
            return sendJsonMessage({
                topic: buttonCommand,
                payload: player
            });
        } else console.log("ERR: WS NOT READY");

    };

    return (
        <div className="card">
            <NavBar />
            <ul>
                {playerList.map((player) => (
                    <li key={player.playerid}>
                        User:{player.playername + `[${player.accountname}]`} Steam ID:{player.playerid}
                        <button onClick={() => handleButtonCommand(player.playername, "orange")}>Orange</button>
                        <button onClick={() => handleButtonCommand(player.playername, "ban")}>Ban</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Player;