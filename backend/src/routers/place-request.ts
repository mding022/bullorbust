// src/routes/placeRequest.ts
import { Router } from "express";
import prisma from "../lib/db";
import { Stock, User } from "@prisma/client";
import {isAuthenticated } from "../lib/isAuthenticated";
import axios from "axios";

const requestRouter = Router();

requestRouter.post("/", async (req, res) => {
    const { symbol, amount, username } = req.body;
    
    if (!symbol || !amount || !username) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    const user: User | null = await prisma.user.findUnique({
        where: { username },
    });

    const stock: Stock | null = await prisma.stock.findUnique({
        where: { symbol },
    });

    if (!user || !stock) {
        res.status(404).json({ error: "User or stock not found" });
        return;
    }


    const response = await axios.get(`http://localhost:8083/api/stock?ticker=${stock.symbol}`);
    const price: any = response.data;
    const totalCost = price * amount;


    try {
        const holdings = (user.holding as any)?.data || [];
        await prisma.user.update({
            where: { username },
            data: {
                balance: (user.balance || 0) - totalCost,
                holding: {
                    data: [...holdings, { stock: symbol, amount }]
                }
            }
        });

        res.status(200).json({ success: "Transaction successful" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Transaction failed" });
    }
});

requestRouter.put("/", async (req, res) => {
    const { symbol, amount, username } = req.body;
    
    if (!symbol || !amount) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }


    const user: User | null = await prisma.user.findUnique({
        where: { username },
    });

    const stock: Stock | null = await prisma.stock.findUnique({
        where: { symbol },
    });

    if (!user || !stock) {
        res.status(404).json({ error: "User or stock not found" });
        return;
    }

    const response = await axios.get(`http://localhost:8083/api/stock?ticker=${stock.symbol}`);
    const price: any = response.data;
    const totalCost = price * amount;


    const holdings = (user.holding as any)?.data || [];
    const existingHolding = holdings.find((h: any) => h.stock === symbol);
    if (!existingHolding || existingHolding.amount < amount) {
        res.status(400).json({ error: "Insufficient stocks" });
        return;
    }

    try {
        await prisma.user.update({
            where: { username },
            data: {
                balance: (user.balance || 0) + totalCost,
                holding: {
                    data: holdings.map((h: any) => 
                        h.stock === symbol 
                            ? { ...h, amount: h.amount - amount }
                            : h
                    )
                }
            }
        });

        res.status(200).json({ success: "Transaction successful" });
    } catch (error) {
        res.status(400).json({ error: "Transaction failed" });
    }
});

export default requestRouter;