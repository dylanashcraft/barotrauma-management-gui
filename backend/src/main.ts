const express = require('express');

const app = express();
const port = 3000;

app.get('/api/players', (req: any, res: any) => {
    res.send(['test1', 'test2']);
    console.log(`Request '${req.body}' on '${req.url}'`);
});

app.listen(port, () => {
    console.log(`Backend is on ${port}`);
})