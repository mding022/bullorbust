import { Router, Request, Response } from "express";
import prisma from "../lib/db";
import axios from "axios";

interface Holding {
  stock: string;
  amount: number;
}

const assetsRouter = Router();

assetsRouter.get("/:username", async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { username } = req.params;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const holdings = ((user.holding as any)?.data || []) as Holding[];
    
    // Return empty array if no holdings
    if (!holdings.length) {
      res.status(200).json([]);
      return;
    }
    
    // Group holdings by ticker
    const groupedHoldings = holdings.reduce((acc, holding) => {
      if (!acc[holding.stock]) {
        acc[holding.stock] = 0;
      }
      acc[holding.stock] += holding.amount;
      return acc;
    }, {} as Record<string, number>);

    // Get prices and calculate values for consolidated holdings
    const holdingsValue = await Promise.all(
      Object.entries(groupedHoldings).map(async ([ticker, amount]) => {
        const response = await axios.get(`http://localhost:8083/api/stock?ticker=${ticker}`);
        const price = Number(response.data);
        return {
          ticker,
          amount,
          price,
          value: price * amount,
        };
      })
    );

    res.status(200).json(holdingsValue);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default assetsRouter;
