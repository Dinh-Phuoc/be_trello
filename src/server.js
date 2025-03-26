import express from 'express';

const app = express()
const port = 5000
const hostname = 'localhost'

app.get('/', (req, res) =>{
    res.send('hello world');
})

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})