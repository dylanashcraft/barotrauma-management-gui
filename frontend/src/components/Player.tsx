import React from "react";
import NavBar from "./NavBar";

interface Player {
    steamid: string;
    name: string;
}

const Player: React.FC = () => {

    const [playerList, setPlayerList] = React.useState<Array<Player>>([]);

    React.useEffect(() => {
        fetch("http://localhost:3000/api/players")
        .then((response) => response.json())
        .then((data) => { 
            setPlayerList(data);
            console.log(data);
        });
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