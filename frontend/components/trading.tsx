"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fakeHoldings, fakeNews } from "./data";
import { motion } from "framer-motion";

export default function BullOrBust() {
    const [username, setUsername] = useState("default-user");
    // const fetchUsername = async () => {
    //     try {
    //         const response = await fetch("http://localhost:8080/username");
    //         if (response.ok) {
    //             const data = await response.json();
    //             setUsername(data.username);
    //         }
    //     } catch (error) {
    //         console.error("Failed to fetch username:", error);
    //     }
    // };

    // useEffect(() => {
    //     fetchUsername();
    // }, []);

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        show: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.3, delayChildren: 0.2 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6 } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-2">
                    <svg
                        id="logosandtypes_com"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 150 150"
                        className="h-8 w-8"
                    >
                        <path d="M0 0h150v150H0V0z" fill="none" />
                        <path
                            d="M90 44.8c-2.1.5-3.6.8-5.2.2-1.2-.7-2.2-1.8-2.9-3L67.6 22.5c-.7-1.2-1.8-2.3-3-3-1.5-.6-3.1-.2-5.2.2l-46 12.5v85.9l46.3-12.4c2.1-.5 3.7-.8 5.2-.3 1.2.7 2.2 1.7 2.9 2.9L82 128c.7 1.2 1.7 2.2 2.9 2.9 1.5.6 3.1.2 5.2-.3l46.2-12.3V32.4L90 44.8z"
                            fill="#e21e26"
                        />
                    </svg>
                    <h1 className="text-2xl font-bold">B/B Markets</h1>
                </div>
                <div className="flex items-center gap-2">
                    <span role="img" aria-label="User icon">
                        👤
                    </span>
                    <span>{username}</span>
                </div>
            </header>
            <motion.main
                className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-hidden"
                initial="hidden"
                animate="show"
                variants={containerVariants}
            >
                <motion.div className="flex flex-col gap-4" variants={cardVariants}>
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Total Assets</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-3xl font-bold">$100,000</p>
                            <p className="text-sm text-muted-foreground">Profit/Loss: $0</p>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Positions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
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
                <motion.div className="flex flex-col gap-4" variants={cardVariants}>
                    <Card className="flex-1 flex flex-col h-1/3">
                        <CardHeader>
                            <CardTitle>News</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto">
                            <ScrollArea className="h-full">
                                {fakeNews.map((article, index) => (
                                    <div key={index} className="mb-4">
                                        <h3 className="font-semibold">{article.title}</h3>
                                        <p className="text-sm text-muted-foreground">{article.content}</p>
                                    </div>
                                ))}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 flex flex-col h-2/3">
                        <CardHeader>
                            <CardTitle>Stock Quote</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full">
                                <p className="text-sm text-muted-foreground">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies,
                                    nunc nisl aliquet nunc, vitae aliquam nisl nunc vitae nisl. Sed vitae nisl eget nisl aliquam
                                    ultricies.
                                </p>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.main>
        </div>
    );
}
