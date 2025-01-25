import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import expressWs from 'express-ws';
import { authRouter } from "./routers/auth";
import { startOutputParser } from "./chain/market";
import leadRouter from "./routers/leaderboard";
import helmet from "helmet";
import prisma from "./lib/db";
import { Session } from "@prisma/client";
import cookieParser from 'cookie-parser';

declare global {
  namespace Express {
    interface Request {
      user?: Session
    }
  }
}
// import requestRouter from "./routers/place-request";

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


app.use(express.json());
app.use(cookieParser());
app.use(helmet());


// Routers


app.use('/ws', router);


app.use('/leaderboard', leadRouter);


app.use("/auth", authRouter);

// app.use('/place-request', requestRouter);

// Session middleware
app.use(async(req, res, next) => {
  const session = req.cookies.session;
  if(session) {
    const user = await prisma.session.findUnique({ where: { id: session } });
    if(user) {
      req.user = user;
    }
  }
  next();
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// async function main() {
//   const result = await startOutputParser();
//   console.log(result);
// }

// main();
