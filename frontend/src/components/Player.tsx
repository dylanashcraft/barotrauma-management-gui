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
            const data: Player[] = JSON.parse(lastMessage.data);
            setPlayerList(data);
            console.log(data);
        }
    }, [lastMessage]);

    const handleButtonOrange = (player: string) => {
        if (ReadyState.OPEN === 1) console.log("WS Open");
        else console.log("ERR: WS NOT READY");
        const buttonCommand = "orange";
        console.log(`Using:${buttonCommand} with ${player}`);
        sendJsonMessage({ 
            topic: buttonCommand,
            payload: player 
        });
    };

  return (
    <div className="card">
    <NavBar />
    <ul>
        {playerList.map((player) => (
            <li key={player.playerid}> 
                User:{player.playername} Steam ID:{player.playerid}
                <button onClick={() => handleButtonOrange(player.playername)}>Orange</button>
            </li>
        ))}
    </ul>
    </div>
  );
};

export default Player;