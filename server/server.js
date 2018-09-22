const express = require('express');
const http = require('http');

const rxjs = require('rxjs');
const operators = require('rxjs/operators');

const app = express();
const server = new http.Server(app);

let sockets = [];
const subject = new rxjs.Subject();

app.get('/api/test', (req, res) => {
  const data = {user: '123', voted: 2};
  let testData = [data];
  rxjs.interval(1000).pipe(
    operators.take(200),
    operators.takeUntil(subject)
  ).subscribe(() => {
    testData = [...testData, data];
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
  socket.on('disconnect', () => {
    subject.next(false);
  });
});


