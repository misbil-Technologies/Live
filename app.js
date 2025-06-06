const express = require('express');
const http = require('http');
const cors = require('cors');

const port = 3000;

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/', express.static(__dirname));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/interview', function (req, res) {
  res.sendFile(__dirname + '/interview.html');
});

app.get('/results', function (req, res) {
  res.sendFile(__dirname + '/results.html');
});

const server = http.createServer(app);

server.listen(port, () =>
  console.log(
    `AI Interview Assistant started on port localhost:${port}\nhttp://localhost:${port}\nhttp://localhost:${port}/interview\nhttp://localhost:${port}/results`
  )
);