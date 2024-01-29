import * as express from 'express';

const app = express();
const port = 3000;

export interface Player {
    steamid: string;
    name: string;
}

let frontendRequest: {name: string, command: string}[] = [];

let playerList: Player[] = []; // Players that have joined since start.
playerList.push({ steamid: '4484', name: 'Frank' }, { steamid: '8372', name: 'Tom_Ran' });

app.use((req: any, res: any, next: any)=>{
    res.header("Access-Control-Allow-Origin", "*");
    return next();
});

app.get('/api/players', (req: any, res: any) => {
    res.send(playerList);
    console.log(`Request '${req.body}' on '${req.url}'`);
});

app.post('/api/players', (req: any, res: any) => {
    frontendRequest.push(req.body); // FIXME: may need to parse as JSON / ensure data is returned for name and command. Consider returning array of names and commands. #TODO: Use class method to init console command.
    res.status(200).send('OK');
    console.log(`Got '${req.body}' on '${req.url}'`);
});

app.listen(port, () => {
    console.log(`Backend is on ${port}`);
});
