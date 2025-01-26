import { Router } from "express";
import prisma from "../lib/db";
import bcrypt from "bcrypt";
import { isAuthenticated } from "../lib/isAuthenticated";
export const authRouter = Router();

// TODO: This needs to be a WebSocket.
authRouter.get("/user-data", isAuthenticated, async (req, res) => {
    if(!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const id = req.user.id;

    const user = await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            username: true,
            balance: true,
            holding: true,
        },
    });
    

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

    try {
        // Delete any existing sessions
        await prisma.session.deleteMany({
            where: {
                userId: user.id
            }
        });

        // Create new session
        const session = await prisma.session.create({
            data: {
                userId: user.id,
                session: { id: user.id, username: user.username },
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        res.cookie("session", session.id, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/'
        });
        res.status(200).json({ userId: user.id });
    } catch (error: any) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Failed to create session" });
    }
});

authRouter.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password) {
        res.status(400).json({ error: "Missing username or password" });
        return;
    }

    if (username.length < 3 || username.length > 20) {
        res.status(400).json({ error: "Username must be between 3 and 20 characters long" });
        return;
    }

    if (password.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters long" });
        return;
    }

    if (username.includes(" ")) {
        res.status(400).json({ error: "Username cannot contain spaces" });
        return;
    }

    if (username.includes(".")) {
        res.status(400).json({ error: "Username cannot contain periods" });
        return;
    }

    if (username.includes("@")) {
        res.status(400).json({ error: "Username cannot contain @ symbols" });
        return;
    }

    if (username.includes("_")) {
        res.status(400).json({ error: "Username cannot contain _ symbols" });
        return;
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            username: username,
        },
    });

    if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
    }

    const MAX_RETRIES = 3;
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.$transaction(async (tx) => {
                const createdUser = await tx.user.create({
                    data: {
                        username,
                        password: hashedPassword,
                        name: username,
                        holding: { data: [] },
                        balance: 100000 // Starting balance for new users
                    }
                });

                const session = await tx.session.create({
                    data: {
                        userId: createdUser.id,
                        session: { id: createdUser.id, username: createdUser.username },
                        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    },
                });

                return { user: createdUser, session };
            });

            res.cookie("session", user.session.id, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
                path: '/'
            });
            res.status(200).json({ userId: user.user.id });
            return;

        } catch (error: any) {
            if (error.code === 'P2002') {
                res.status(400).json({ error: "Username already taken" });
                return;
            } else if (error.code === 'P2034') {
                // Write conflict, retry
                retryCount++;
                if (retryCount === MAX_RETRIES) {
                    console.error("Max retries reached for registration:", error);
                    res.status(500).json({ error: "Failed to create user after multiple attempts" });
                    return;
                }
                // Wait a small random amount of time before retrying
                await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
                continue;
            } else {
                console.error("Registration error:", error);
                res.status(500).json({ error: "Failed to create user" });
                return;
            }
        }
    }
});
