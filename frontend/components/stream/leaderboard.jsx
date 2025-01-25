"use client"

import { useEffect, useState } from "react";

export default function Leaderboard() {
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleAuth = async () => {
            try {
                const response = await fetch("https://normal-heroic-wren.ngrok-free.app/leaderboard", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true"
                    },
                });
                const data = await response.json();

                if (data.leaderboard && Array.isArray(data.leaderboard)) {
                    setTopUsers(data.leaderboard.slice(0, 10));
                }
            } catch(error) { 
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        handleAuth();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center h-screen bg-gray-100 animate-fade-in">
                <div className="text-lg font-semibold">Loading leaderboard...</div>
            </div>
        );
    }

    return (
        <div className="w-full flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-4 bg-white shadow-md rounded-lg animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <svg
                        id="logosandtypes_com"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 150 150"
                        className="h-8 w-8 mr-4"
                    >
                        <path d="M0 0h150v150H0V0z" fill="none" />
                        <path d="M90 44.8c-2.1.5-3.6.8-5.2.2-1.2-.7-2.2-1.8-2.9-3L67.6 22.5c-.7-1.2-1.8-2.3-3-3-1.5-.6-3.1-.2-5.2.2l-46 12.5v85.9l46.3-12.4c2.1-.5 3.7-.8 5.2-.3 1.2.7 2.2 1.7 2.9 2.9L82 128c.7 1.2 1.7 2.2 2.9 2.9 1.5.6 3.1.2 5.2-.3l46.2-12.3V32.4L90 44.8z" fill="#e21e26" />
                    </svg>
                    <h2 className="text-xl font-bold">Leaderboard</h2>
                    <a href="/" className="mr-1">
                        <button className="group relative inline-flex h-6 items-center justify-center overflow-hidden rounded-md bg-red-500 px-2 font-medium text-neutral-200 transition hover:scale-110">
                            <span>Back</span>
                            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                <div className="relative h-full w-8 bg-white/20"></div>
                            </div>
                        </button>
                    </a>
                </div>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-4">Top 10 Asset Managers</h3>
                        <div className="space-y-2">
                            {topUsers.map((user, index) => (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center p-2 rounded-md bg-[#EEEEEE] animate-stagger-fade-in opacity-0`}
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    <span className="font-medium">{index + 1}. {user.username}</span>
                                    <span>{user.totalBalance.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
