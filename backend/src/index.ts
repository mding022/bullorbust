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

router.ws('/user-data', async (ws, req) => {
  const session = req.cookies.session;
  if (!session) {
    ws.send(JSON.stringify({ error: "Unauthorized" }));
    ws.close();
    return;
  }

  const userSession = await prisma.session.findUnique({ 
    where: { id: session }
  });

  if (!userSession) {
    ws.send(JSON.stringify({ error: "Unauthorized" }));
    ws.close();
    return;
  }

  // Add this connection to our tracking
  const connectionId = `${userSession.userId}-${Date.now()}`;
  userConnections.set(connectionId, {
    ws,
    userId: userSession.userId,
    lastSentData: null
  });

  // Start the update interval if it's not already running
  if (!updateInterval) {
    updateInterval = setInterval(async () => {
      // Get all unique user IDs
      const userIds = new Set([...userConnections.values()].map(conn => conn.userId));
      
      // Fetch data for all users at once
      const usersData = await prisma.user.findMany({
        where: {
          id: {
            in: Array.from(userIds)
          }
        },
        select: {
          id: true,
          username: true,
          balance: true,
          holding: true,
        }
      });

      // Send updates to each connection if data changed
      for (const [connId, connection] of userConnections.entries()) {
        const userData = usersData.find(u => u.id === connection.userId);
        if (!userData) continue;

        const currentData = JSON.stringify(userData);
        if (currentData !== connection.lastSentData) {
          try {
            connection.ws.send(currentData);
            connection.lastSentData = currentData;
          } catch (error) {
            // Connection might be dead, remove it
            userConnections.delete(connId);
          }
        }
      }

      // Stop interval if no connections left
      if (userConnections.size === 0 && updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    }, 1000);
  }

  // Send initial data
  const initialData = await prisma.user.findUnique({
    where: { id: userSession.userId },
    select: {
      id: true,
      username: true,
      balance: true,
      holding: true,
    }
  });
  ws.send(JSON.stringify(initialData));

  ws.on('close', () => {
    // Remove this connection from tracking
    for (const [connId, conn] of userConnections.entries()) {
      if (conn.ws === ws) {
        userConnections.delete(connId);
        break;
      }
    }
    console.log('User data connection closed');
  });
});


app.get("/", (req: Request, res: Response) => {
  res.status(200).send("OK");
});


app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Headers to allow ngrok and CORS
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning');
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

// Routers
app.use("/auth", authRouter);
app.use('/ws', router);
app.use('/leaderboard', leadRouter);

app.use("*", (req, res) => {
  res.status(404).send("Not Found");
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// app.use('/place-request', requestRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// async function main() {
//   const result = await startOutputParser();
//   console.log(result);
// }

// main();

