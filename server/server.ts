const express = require('express');
const http = require('http');

const rxjs = require('rxjs');

const app = express();
const server = new http.Server(app);

let sockets = [];

let testData = [];

app.get('/api/test', (req, res) => {
  rxjs.interval(1000).subscribe(() => {
    testData = [...testData, {user: '123', voted: 2}];
    io.emit('data', testData);
  });
  res.json(testData);
});

server.listen(3000, () => {
  console.log('Listening on 3000');
});

const io = require('socket.io').listen(server);

io.on('connection', (socket) => {
  console.log(socket);
  sockets = [...sockets, socket];
});


