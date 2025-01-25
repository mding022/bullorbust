import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import expressWs from 'express-ws';
import { authRouter } from "./routers/auth";
import { startOutputParser } from "./chain/market";

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


// Routers
app.use("/auth", authRouter);


app.use('/ws', router);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

async function main() {
  const result = await startOutputParser();
  console.log(result);
}

main();
