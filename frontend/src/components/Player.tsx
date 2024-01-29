import React from "react";
import useWebSocket from "react-use-websocket";
import NavBar from "./NavBar";

interface Player {
    steamid: string;
    name: string;
}


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
            const data: Player = JSON.parse(lastMessage.data);
            setPlayerList([data]);
            console.log(data);
        }
    }, [lastMessage]);

        const handleButtonOrange = (player: string) => {
            const buttonCommand = "orange";
            sendJsonMessage({ player, buttonCommand }, true);
        };

  return (
    <div className="card">
    <NavBar />
    <ul>
        {playerList.map((player) => (
            <li key={player.steamid}> 
                {player.name}
                <button onClick={() => handleButtonOrange(player.name)}>Orange</button>
            </li>
        ))}
    </ul>
    </div>
  );
};

export default Player;