import express from 'express';
import expressWs from 'express-ws';
// import prisma from './prisma';

//Websocket 
const wsRouter = express.Router() as expressWs.Router;

wsRouter.ws('/', (ws, req) => {
  ws.on('message', (msg: String) => {
      ws.send(msg);
  });

  console.log('Connection opened');
  ws.send('Hello World!');

  setInterval(() => {
    ws.send('Hello World!');
  }, 1000);

  ws.on('close', () => {
    console.log('Connection closed');
  });
});

export default wsRouter;