import { Router } from 'express';
import { PrismaClient, User, Stock } from '@prisma/client';

const leadRouter = Router();
const prisma = new PrismaClient();

interface Holdings {
  data: Holding[];
}

interface Holding { //To be used in representing the User.holding objects
  stock: string; // Stock symbol
  amount: number; // Quantity of stock held
}

leadRouter.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const stocks = await prisma.stock.findMany();
    const leaderboard = users.map(user => {
      const holdings = (user.holding as any)?.data || [];
      
      const totalBalance = holdings.reduce((total: number, holding: Holding) => {
        const stock = stocks.find(s => s.symbol === holding.stock);
        if (stock) {
          total += stock.price[stock.price.length - 1] * holding.amount;
        }
        return total;
      }, 0);
      
      return {
        username: user.username,
        totalBalance,
      };
    });
    
    leaderboard.sort((a, b) => b.totalBalance - a.totalBalance);
    res.json({ leaderboard });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default leadRouter;
