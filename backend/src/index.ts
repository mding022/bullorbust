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
import requestRouter from "./routers/place-request";

dotenv.config();

const { app, getWss, applyTo } = expressWs(express());
const port = process.env.PORT || 3000;

//Websocket 

//THIS IS THE FUNCTION THAT SHOULD LINK TO AI AND CHANGES
function generateStockPrice(currentPrice: number): number {
  const volatility = 0.02;
  const change = currentPrice * (Math.random() * 2 * volatility - volatility);
  return Math.max(currentPrice + change, 1);
}

const router = express.Router() as expressWs.Router;

router.ws('/live', (ws, req) => {

  //on turn on
  ws.on('message', (msg: String) => {
      ws.send(msg);
  });

  // test send
  console.log('Connection opened');
  ws.send('Hello World!');

  //market changes
  const marketSimulation = setInterval(async () => {
    const stocks = await prisma.stock.findMany();
    const priceUpdates = stocks.map(stock => {
      const currentPrices = stock.price;
      const latestPrice = currentPrices[currentPrices.length - 1];
      const newPrice = generateStockPrice(latestPrice);

      return {
        symbol: stock.symbol,
        oldPrice: latestPrice,
        newPrice: Math.round(newPrice),
        timestamp: new Date()
      };
    });

    // Update database on market changes
    for (let update of priceUpdates) {
      await prisma.stock.update({
        where: { symbol: update.symbol },
        data: { 
          price: {
            push: update.newPrice
          }
        }
      });
    }

    // Send updates to client
    ws.send(JSON.stringify(priceUpdates));
  }, 5000);

  //stops backend work
  ws.on('close', () => {
    clearInterval(marketSimulation);
    console.log('Connection closed');
  });
});

// index api response
app.get("/", (req: Request, res: Response) => {
  
  res.status(200).send("OK");
});


app.use(express.json());
app.use(cookieParser());
app.use(helmet());

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

// Routers
app.use("/auth", authRouter);
app.use('/ws', router);
app.use('/leaderboard', leadRouter);

app.use('/place-request', requestRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// async function main() {
//   const result = await startOutputParser();
//   console.log(result);
// }

// main();
