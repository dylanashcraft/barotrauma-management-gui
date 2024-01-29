import express from 'express';

const app = express();
const port = 3000;

interface Player {
    steamid: string;
    name: string;
}

const testData: Player[] = [{ steamid: '4484', name: 'Frank' }, { steamid: '8372', name: 'Tom_Ran' }];

app.use(function(req: any, res: any, next: any) {
    res.header("Access-Control-Allow-Origin", "*");
    return next();
});

app.get('/api/players', (req: any, res: any) => {
    res.send(testData);
    console.log(`Request '${req.body}' on '${req.url}'`);
});

app.listen(port, () => {
    console.log(`Backend is on ${port}`);
});
