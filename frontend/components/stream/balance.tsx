import { useState, useEffect } from "react";

type LiveBalanceProps = {
    username: string;
};

const LiveBalance = ({ username }: LiveBalanceProps) => {
    const [balance, setBalance] = useState < number | null > (null);

    const fetchLiveData = async () => {
        try {
            if (!username) return;
            const response = await fetch(`https://bullorbust.matiass.ca/balance/${username}`, {
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
        const interval = setInterval(fetchLiveData, 5000);
        return () => clearInterval(interval);
    }, [username]);

    return <div>{balance !== null ? balance : "Loading..."}</div>;
};

export default LiveBalance;
