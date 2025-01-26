import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import expressWs from 'express-ws';
import WebSocket from 'ws';
import { authRouter } from "./routers/auth";
import { startOutputParser } from "./chain/market";
import leadRouter from "./routers/leaderboard";
import helmet from "helmet";
import prisma from "./lib/db";
import { Session } from "@prisma/client";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Ollama } from "@langchain/ollama";
import requestRouter from "./routers/place-request";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import proxy from 'express-http-proxy';
import balanceRouter from "./routers/balance";
import assetsRouter from "./routers/assets";

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

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning', 'Cookie']
}));

// Headers to allow ngrok and CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('ngrok-skip-browser-warning', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

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

// Base route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

interface UserConnection {
  ws: WebSocket;
  userId: string;
  lastSentData: string | null;
}

// Track all active connections
const userConnections = new Map<string, UserConnection>();

// Single interval for all connections
let updateInterval: NodeJS.Timeout | null = null;

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


// Create a new router for market data
const marketRouter = express.Router();

// Get latest price for a specific stock
marketRouter.get('/price/:symbol', async (req, res) => {
    try {
        const stock = await prisma.stock.findUnique({
            where: { symbol: req.params.symbol },
            select: {
                symbol: true,
                price: true
            }
        });

        if (!stock) {
            res.status(404).json({ error: 'Stock not found' });
            return;
        }

        const latestPrice = Number(stock.price[stock.price.length - 1]);
        
        res.json({
            symbol: stock.symbol,
            price: Number(latestPrice.toFixed(2)),
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error fetching stock price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get latest prices for all stocks
marketRouter.get('/prices', async (req, res) => {
    try {
        const stocks = await prisma.stock.findMany({
            select: {
                symbol: true,
                price: true
            }
        });

        const priceData = stocks.map(stock => ({
            symbol: stock.symbol,
            price: Number(stock.price[stock.price.length - 1].toFixed(2)),
            timestamp: new Date()
        }));

        res.json(priceData);
    } catch (error) {
        console.error('Error fetching stock prices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get latest news
marketRouter.get('/news/latest', async (req, res) => {
    try {
        const latestNews = await prisma.news.findMany({
            orderBy: {
                id: 'desc'
            },
            take: 6
        });

        res.json(latestNews);
    } catch (error) {
        console.error('Error fetching latest news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get latest news for a specific stock
marketRouter.get('/news/:symbol', async (req, res) => {
    try {
        const stockNews = await prisma.news.findMany({
            where: {
                tickers: {
                    equals: { symbol: req.params.symbol }
                }
            },
            orderBy: {
                id: 'desc'
            },
            take: 10
        });

        res.json(stockNews);
    } catch (error) {
        console.error('Error fetching stock news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's personal value
marketRouter.get('/value/:username', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username: req.params.username }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Get current stock prices
        const stocks = await prisma.stock.findMany();
        const stockPrices = new Map(stocks.map(stock => [
            stock.symbol, 
            Number(stock.price[stock.price.length - 1])
        ]));

        // Calculate holdings value
        const holdings = (user.holding as any)?.data || [];
        const holdingsValue = holdings.reduce((total: number, holding: any) => {
            const price = stockPrices.get(holding.stock) || 0;
            return total + (price * holding.amount);
        }, 0);

        // Total value = balance + holdings value
        const totalValue = Number((user.balance || 0) + holdingsValue);

        res.json({
            username: user.username,
            balance: Number((user.balance || 0).toFixed(2)),
            holdingsValue: Number(holdingsValue.toFixed(2)),
            totalValue: Number(totalValue.toFixed(2))
        });
    } catch (error) {
        console.error('Error calculating personal value:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.use('/balance', balanceRouter);
app.use('/assets', assetsRouter);

// Proxy the spring bean
// proxy /bean/* to the spring boot app at localhost:8083
app.use('/bean', proxy('http://localhost:8083', {
  proxyReqOptDecorator: function(proxyReqOpts) {
    proxyReqOpts.headers = {
      ...proxyReqOpts.headers,
      'Origin': 'http://localhost:3000'
    };
    return proxyReqOpts;
  },
  userResHeaderDecorator: function(headers) {
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['Access-Control-Allow-Headers'] = '*';
    headers['Access-Control-Allow-Credentials'] = 'true';
    return headers;
  }
}));

// Add the market router to the main app
app.use('/market', marketRouter);

// Main routers
app.use("/auth", authRouter);
app.use('/ws', router);
app.use('/leaderboard', leadRouter);
app.use('/place-request', requestRouter);

// 404 handler - MUST come after all other routes
app.use("*", (req, res) => {
  res.status(404).send("Not Found");
});

// Error handling - MUST be last
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// async function main() {
//   const result = await startOutputParser();
//   console.log(result);
// }

// main();

