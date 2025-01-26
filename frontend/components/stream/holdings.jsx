"use client";

import { useEffect, useState } from "react";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";

const Holdings = ({ username }) => {
    const [holdings, setHoldings] = useState([]);

    useEffect(() => {
        const fetchHoldings = async () => {
            try {
                const response = await fetch(`http://localhost:8080/assets/${username}`);
                const data = await response.json();
                setHoldings(data);
            } catch (error) {
                console.error("Error fetching holdings:", error);
            }
        };

        fetchHoldings();
        const interval = setInterval(fetchHoldings, 500);

        return () => clearInterval(interval);
    }, [username]);

    return (
        <TableBody>
            {holdings.map((holding, index) => (
                <TableRow key={`${holding.ticker}-${index}`}>
                    <TableCell>{holding.ticker}</TableCell>
                    <TableCell>{holding.amount}</TableCell>
                    <TableCell>${holding.price.toFixed(2)}</TableCell>
                    <TableCell>${holding.value.toFixed(2)}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    );
};

export default Holdings;
