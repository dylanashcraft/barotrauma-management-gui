import React from "react";
import NavBar from "./NavBar";

interface Player {
    steamid: string;
    name: string;
}

const Player: React.FC = () => {

    const [playerList, setPlayerList] = React.useState<Array<Player>>([]);

    React.useEffect(() => {
        fetch("/api/players")
        .then((response) => response.json())
        .then((data) => setPlayerList(data));
    }, []);

  return (
    <div className="card">
    <NavBar />
    <ul>
        {playerList.map((player) => (
            <li key={player.steamid}> {player.name} </li>
        ))}
    </ul>
    </div>
  );
};

export default Player;