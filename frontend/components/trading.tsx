"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fakeHoldings, fakeNews } from "./data";
import { motion } from "framer-motion";
import AssetChart from './stream/assetchart'
import StockQuote from "./stockquote";

const LoginPage = ({ onLogin }: { onLogin: (userId: string) => void }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        if (username && password) {
            fetch("http://localhost:8080/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            })
                .then((response) => response.json())
                // .then((data) => {
                //     if (data.userid && data.userid !== "-1") {
                //         onLogin(data.userid);
                //     } else {
                //         alert("Invalid login credentials");
                //     }
                // })
                // .catch(() => alert("Error logging in"));
                .catch(() => onLogin("admin"))
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="bg-white p-8 rounded shadow-lg w-96">
                <div className="flex items-center gap-1.5 pb-5">
                    <svg
                        id="logosandtypes_com"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 150 150"
                        className="h-7 w-7"
                    >
                        <path d="M0 0h150v150H0V0z" fill="none" />
                        <path
                            d="M90 44.8c-2.1.5-3.6.8-5.2.2-1.2-.7-2.2-1.8-2.9-3L67.6 22.5c-.7-1.2-1.8-2.3-3-3-1.5-.6-3.1-.2-5.2.2l-46 12.5v85.9l46.3-12.4c2.1-.5 3.7-.8 5.2-.3 1.2.7 2.2 1.7 2.9 2.9L82 128c.7 1.2 1.7 2.2 2.9 2.9 1.5.6 3.1.2 5.2-.3l46.2-12.3V32.4L90 44.8z"
                            fill="#e21e26"
                        />
                    </svg>
                    <h2 className="text-2xl font-semibold mb-0">Login</h2>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter username"
                        autoFocus
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter password"
                    />
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full p-2 bg-red-400 text-white rounded"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default function BullOrBust() {
    const [loggedIn, setLoggedIn] = useState(true); //TODO: change to false
    const [username, setUsername] = useState("default-user");

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        show: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.3, delayChildren: 0.2 },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
        show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.6 },
        },
    };

    const handleLoginSuccess = (userId: string) => {
        setLoggedIn(true);
        setUsername(userId);
    };

    if (!loggedIn) {
        return <LoginPage onLogin={handleLoginSuccess} />;
    }

    return (
        <motion.div
            className="min-h-screen bg-background text-foreground flex flex-col"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            <header className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-2">
                    <svg
                        id="logosandtypes_com"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 150 150"
                        className="h-8 w-8"
                    >
                        <path d="M0 0h150v150H0V0z" fill="none" />
                        <path d="M90 44.8c-2.1.5-3.6.8-5.2.2-1.2-.7-2.2-1.8-2.9-3L67.6 22.5c-.7-1.2-1.8-2.3-3-3-1.5-.6-3.1-.2-5.2.2l-46 12.5v85.9l46.3-12.4c2.1-.5 3.7-.8 5.2-.3 1.2.7 2.2 1.7 2.9 2.9L82 128c.7 1.2 1.7 2.2 2.9 2.9 1.5.6 3.1.2 5.2-.3l46.2-12.3V32.4L90 44.8z" fill="#e21e26" />
                    </svg>
                    <h1 className="text-2xl font-bold">NBC BB Markets</h1>
                </div>
                <div className="flex items-center gap-2">
                    <a href="/leaderboard"><span className="mr-3 hover:underline underline-offset-8">🏆&nbsp;leaderboards</span></a>
                    <span>👤&nbsp;{username}</span>
                </div>
            </header>
            <motion.main className="p-4 grid  grid-cols-1  md:grid-cols-3 gap-4 overflow-hidden">
                <motion.div className="flex flex-col gap-4" variants={cardVariants}>
                    <Card className="flex flex-col p-0">
                        <CardHeader>
                            <CardTitle>Total Assets</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-3xl font-bold">$100,000</p>
                            <p className="text-base text-muted-foreground pb-5">Profit/Loss: $0.00</p>
                        </CardContent>
                        <CardHeader>
                            <CardTitle>Realtime Portfolio Value</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1"><AssetChart /></CardContent>
                    </Card>
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Positions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-x-auto">
                            <ScrollArea className="h-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Symbol</TableHead>
                                            <TableHead>Shares</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fakeHoldings.map((holding) => (
                                            <TableRow key={holding.symbol}>
                                                <TableCell>{holding.symbol}</TableCell>
                                                <TableCell>{holding.shares}</TableCell>
                                                <TableCell>${holding.price.toFixed(2)}</TableCell>
                                                <TableCell>${holding.value.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div className="flex flex-col gap-4 col-span-2" variants={cardVariants}>
                    <Card className="flex-1 flex flex-col h-1/3">
                        <CardHeader>
                            <CardTitle><span className="text-red-800">BB</span>loomberg Terminal News</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto">
                            <ScrollArea className="h-full">
                                {fakeNews.length > 0 && (
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold">{fakeNews[0].title}</h2>
                                        <p className="text-base text-muted-foreground">{fakeNews[0].content}</p>
                                    </div>
                                )}
                                <div className="mt-4 space-y-2 overflow-y-auto h-40">
                                    {fakeNews.slice(1).map((article, index) => (
                                        <div key={index} className="text-xs opacity-70">
                                            <h3 className="font-semibold">{article.title}<span className="italic text-muted-foreground ml-2">{article.time}</span></h3>
                                            <p className="text-muted-foreground">{article.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 flex flex-col h-2/3">
                        <CardHeader>
                            <CardTitle>Stock Quote</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <StockQuote />
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.main>
        </motion.div>
    );
}
