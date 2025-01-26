"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fakeHoldings, useNews } from "./data";
import { motion } from "framer-motion";
import AssetChart from './stream/assetchart'
import StockQuote from "./stockquote";

const AuthPage = ({ onLogin }: { onLogin: (userId: string) => void }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [balance, setBalance] = useState<number | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const fetchLiveData = async () => {
        try {
            if (!username) return;// Ensure username is set before fetching
            console.log("here")
            const response = await fetch(`https://bullorbust.matiass.ca/balance/millerding222`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            // const data = await response.json();
            // setBalance(data.balance)
        } catch (error) {
            console.error("Error fetching live data:", error);
        }
    };


    useEffect(() => {
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 5000); // Fetch every 5 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const handleAuth = async () => {
        const endpoint = isRegistering
            ? "https://bullorbust.matiass.ca/auth/register"
            : "https://bullorbust.matiass.ca/auth/login";

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.userId) {
                onLogin(username);
            } else {
                alert("Authentication failed");
            }
        } catch (error) {
            alert("Error during authentication");
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
                    <h2 className="text-2xl font-semibold mb-0">
                        {isRegistering ? "Register" : "Login"}
                    </h2>
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
                    onClick={handleAuth}
                    className="w-full p-2 bg-red-400 text-white rounded mb-2"
                >
                    {isRegistering ? "Register" : "Login"}
                </button>
                <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="w-full p-2 text-red-400 border border-red-400 rounded"
                >
                    Switch to {isRegistering ? "Login" : "Register"}
                </button>
            </div>
        </div>
    );
};

export default function BullOrBust() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const news = useNews();

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
        return <AuthPage onLogin={handleLoginSuccess} />;
    }

    // Rest of the component remains the same as in the original code
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
                    <a href="/leaderboard"><span className="mr-3 hover:underline underline-offset-8">🏆&nbsp;Leaderboards</span></a>
                    <span>👤&nbsp;Account: {username}</span>
                </div>
            </header>
            <motion.main className="p-3 grid  grid-cols-1  md:grid-cols-3 gap-2 overflow-hidden">
                <motion.div className="flex flex-col gap-4" variants={cardVariants}>
                    <Card className="flex flex-col p-0">
                        <CardHeader>
                            <CardTitle>Total Assets Under Management (AUM)</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-3xl font-bold">${ }</p>
                            <p className="text-base text-muted-foreground pb-5">Profit/Loss: $0.00</p>
                        </CardContent>
                        <CardHeader>
                            <CardTitle>Realtime BB Fund Value</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1"><AssetChart /></CardContent>
                    </Card>
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Open Positions</CardTitle>
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
                            <CardTitle className="flex items-center">
                                <span className="text-red-800">BB</span>loomberg Terminal News
                                <span className="ml-4 w-3 h-3 rounded-full bg-lime-500 animate-ping"></span> {/* Small lime circle */}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto">
                            <ScrollArea className="h-full">
                                {news.length > 0 && (
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold">{news[0].title}</h2>
                                        <p className="text-base text-muted-foreground">{news[0].content}</p>
                                    </div>
                                )}
                                <div className="overflow-y-auto h-36">
                                    {news.slice(1).map((article, index) => (
                                        <div key={index} className="text-xs opacity-70">
                                            <h3 className="font-semibold">
                                                {article.title}
                                                <span className="italic text-muted-foreground ml-2">{article.time}</span>
                                            </h3>
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
                            <StockQuote username={username} />
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.main>
        </motion.div>
    );
}