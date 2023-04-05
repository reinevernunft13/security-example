const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const helmet = require('helmet');

//require('dotenv').config();

const PORT = 3000;

const app = express();

app.get('/secret', (req, res) => {
    return res.send('Your personal secret value is 12');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app).listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});