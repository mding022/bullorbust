import { Router, Request, Response } from "express";
import { Session } from "@prisma/client";
import prisma from "../lib/db";
import axios from "axios";

declare global {
  namespace Express {
    interface Request {
      user?: Session
    }
  }
}

interface Holding {
  stock: string;
  amount: number;
}

const balanceRouter = Router();

balanceRouter.get("/:username", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const holdings = ((user.holding as any)?.data || []) as Holding[];
    const holdingsValue = await Promise.all(holdings.map(async (holding) => {
      const response = await axios.get(`http://localhost:8083/api/stock?ticker=${holding.stock}`);
      // Log the response to debug
      console.log('Stock response:', response.data, 'for stock:', holding.stock);
      return Number(response.data) * holding.amount;
    }));

    // Log values to debug
    console.log('User balance:', user.balance);
    console.log('Holdings values:', holdingsValue);
    
    const totalBalance = Number(user.balance || 0) + holdingsValue.reduce((a, b) => a + b, 0);
    console.log('Total balance:', totalBalance);
    
    res.status(200).json({ balance: totalBalance });
  } catch (error) {
    console.error('Balance calculation error:', error);
    res.status(500).json({ error: 'Error calculating balance' });
  }
});

export default balanceRouter;
