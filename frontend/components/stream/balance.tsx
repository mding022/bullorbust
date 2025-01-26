import { useState, useEffect } from "react";

type LiveBalanceProps = {
    username: string;
};

const LiveBalance = ({ username }: LiveBalanceProps) => {
    const [balance, setBalance] = useState < number | null > (null);

    const fetchLiveData = async () => {
        try {
            if (!username) return;
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/balance/${username}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            setBalance(data.balance);
        } catch (error) {
            console.error("Error fetching live data:", error);
        }
    };

    useEffect(() => {
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 500);
        return () => clearInterval(interval);
    }, [username]);

    return <div className="text-3xl font-bold">${balance !== null ? balance : "Loading..."}</div>;
};

export default LiveBalance;
