import { Router } from "express";
import prisma from "../lib/db";
import bcrypt from "bcrypt";

export const authRouter = Router();


// TODO: This needs to be a WebSocket.
authRouter.get("/user-data", async (req, res) => {
    const { id } = req.query;

    if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
    }
    
    const user = await prisma.user.findUnique({
        where: {
            id: id,
        },
        select: {
            id: true,
            username: true,
        },
    });

    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    res.status(200).json(user);
});

authRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password) {
        res.status(400).json({ error: "Missing username or password" });
        return;
    }

    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
        select: {
            id: true,
            username: true,
            password: true,
        },
    });

    if (!user) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
    }

    res.status(200).json({ userId: user.id });
});

authRouter.post("/register", async (req, res) => {
});