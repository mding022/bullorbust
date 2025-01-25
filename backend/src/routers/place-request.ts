// src/routes/placeRequest.ts
import { Router } from "express";
import prisma from "../lib/db";
import { Stock, User } from "@prisma/client";
import {isAuthenticated } from "../lib/isAuthenticated";

const requestRouter = Router();

requestRouter.post("/", isAuthenticated, async (req, res) => {
    const { symbol, amount } = req.body;
    
    if (!symbol || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const username = await req.user.username;
    if (!username) {
        return res.status(401).json({ error: "Invalid authentication" });
    }

    const user: User | null = await prisma.user.findUnique({
        where: { username },
    });

    const stock: Stock | null = await prisma.stock.findUnique({
        where: { symbol },
    });

    if (!user || !stock) {
        return res.status(404).json({ error: "User or stock not found" });
    }

    const latestPrice = stock.price[stock.price.length - 1];
    const totalCost = latestPrice * amount;

    try {
        // Buy logic
        await prisma.user.update({
            where: { username },
            data: {
                balance: user.balance - totalCost,
                holding: {
                    push: { stock: symbol, amount }
                }
            }
        });

        return res.status(200).json({ success: "Transaction successful" });
    } catch (error) {
        return res.status(400).json({ error: "Transaction failed" });
    }
});

requestRouter.put("/", async (req, res) => {
    const { symbol, amount } = req.body;
    
    if (!symbol || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const username = await req.user.username;
    if (!username) {
        return res.status(401).json({ error: "Invalid authentication" });
    }

    const user: User | null = await prisma.user.findUnique({
        where: { username },
    });

    const stock: Stock | null = await prisma.stock.findUnique({
        where: { symbol },
    });

    if (!user || !stock) {
        return res.status(404).json({ error: "User or stock not found" });
    }

    const latestPrice = stock.price[stock.price.length - 1];
    const totalCost = latestPrice * amount;

    const existingHolding = user.holding.find((h: any) => h.stock === symbol);
    if (!existingHolding || existingHolding.amount < amount) {
        return res.status(400).json({ error: "Insufficient stocks" });
    }

    try {

        await prisma.user.update({
            where: { username },
            data: {
                balance: user.balance + totalCost,
                holding: {
                    updateMany: {
                        where: { stock: symbol },
                        data: { amount: existingHolding.amount - amount }
                    }
                }
            }
        });

        return res.status(200).json({ success: "Transaction successful" });
    } catch (error) {
        return res.status(400).json({ error: "Transaction failed" });
    }
});

export default requestRouter;