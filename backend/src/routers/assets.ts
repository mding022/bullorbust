import { Router, Request, Response } from "express";
import prisma from "../lib/db";
import axios from "axios";

interface Holding {
  stock: string;
  amount: number;
}

const assetsRouter = Router();

assetsRouter.get("/:username", async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const holdings = ((user.holding as any)?.data || []) as Holding[];
  
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
      const response = await axios.get<{ price: number }>(`http://localhost:8083/api/stock?ticker=${ticker}`);
      return {
        ticker,
        amount,
        price: response.data,
        value: response.data as any * amount,
      };
    })
  );

  res.status(200).json(holdingsValue);
});

export default assetsRouter;
