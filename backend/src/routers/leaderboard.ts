import { Router } from 'express';
import prisma from '../lib/db';
import axios from 'axios';

const leadRouter = Router();

interface Holding { //To be used in representing the User.holding objects
  stock: string; // Stock symbol
  amount: number; // Quantity of stock held
}


leadRouter.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const stocks = await prisma.stock.findMany();

    const leaderboardPromises = users.map(async user => {
      const holdings = ((user.holding as any)?.data || []) as Holding[];
      
      const holdingPromises = holdings.map(async holding => {
        const stock = stocks.find(s => s.symbol === holding.stock);
        if (stock) {
          const response = await axios.get<any>(`http://localhost:8083/api/stock?ticker=${stock.symbol}`);
          return response.data * holding.amount;
        }
        return 0;
      });

      const holdingsTotal = (await Promise.all(holdingPromises)).reduce((a, b) => a + b, 0);
      const totalBalance = holdingsTotal + (user.balance || 0);
      
      return {
        username: user.username,
        totalBalance,
      };
    });
    
    const leaderboard = await Promise.all(leaderboardPromises);
    leaderboard.sort((a, b) => b.totalBalance - a.totalBalance);

    const top10 = leaderboard.slice(0, 10);
    res.status(200).json({ leaderboard: top10 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default leadRouter;
