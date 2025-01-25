import { Router } from 'express';
import prisma from '../lib/db';

const leadRouter = Router();

interface Holding { //To be used in representing the User.holding objects
  stock: string; // Stock symbol
  amount: number; // Quantity of stock held
}

leadRouter.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const stocks = await prisma.stock.findMany();
    const leaderboard = users.map(user => {
      const holdings = ((user.holding as any)?.data || []) as Holding[];
      
      const totalBalance = holdings.reduce((total: number, holding: Holding) => {
        const stock = stocks.find(s => s.symbol === holding.stock);
        if (stock) {
          total += stock.price[stock.price.length - 1] * holding.amount;
        }
        return total;
      }, 0) + (user.balance || 0);
      
      return {
        username: user.username,
        totalBalance,
      };
    });
    
    leaderboard.sort((a, b) => b.totalBalance - a.totalBalance);

    const top10 = leaderboard.slice(0, 10);
    res.status(200).json({ leaderboard: top10 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default leadRouter;
