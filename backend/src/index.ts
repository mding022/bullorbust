import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import expressWs from 'express-ws';

dotenv.config();

const { app, getWss, applyTo } = expressWs(express());
const port = process.env.PORT || 3000;

const router = express.Router() as expressWs.Router;

router.ws('/echo', (ws, req) => {
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

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.use('/ws', router);