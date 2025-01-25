"use client";

import { useState } from "react";
import StockChart1 from './stream/quotes/gld';
import StockChart2 from './stream/quotes/fishrs';
import StockChart3 from './stream/quotes/crude';
import StockChart4 from './stream/quotes/houses';
import StockChart5 from './stream/quotes/farmrs';
import StockChart6 from './stream/quotes/mltry';

export default function StockQuote({ username }) {
    const [quantity, setQuantity] = useState('');
    const [shares, setShares] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);

    const handleBuy = async () => {
        if (!quantity || !shares || !username) return;
        
        try {
            const response = await fetch("https://normal-heroic-wren.ngrok-free.app/place-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true" 
                },
                body: JSON.stringify({
                    symbol: shares,
                    amount: quantity,
                    username: username
                }),
            });

            if (response.ok) {
                setPopupMessage("Order placed successfully!");
            } else {
                setPopupMessage("Failed to place the order.");
            }
        } catch (error) {
            setPopupMessage("Error occurred. Please try again.");
        } finally {
            setPopupVisible(true);
        }
    };

    const handleSell = async () => {
        if (!quantity || !shares || !username) return;
        
        try {
            const response = await fetch("https://normal-heroic-wren.ngrok-free.app/place-request", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    symbol: shares,
                    amount: quantity,
                    username: username
                }),
            });

            if (response.ok) {
                setPopupMessage("Order placed successfully!");
            } else {
                setPopupMessage("Failed to place the order.");
            }
        } catch (error) {
            setPopupMessage("Error occurred. Please try again.");
        } finally {
            setPopupVisible(true);
        }
    };

    return (
        <div className="p-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">GLD<span className="font-normal text-gray-400 ml-2">The Gold Mining Co. Canada</span></p>
                    <div className="h-full mt-1">
                        <StockChart1 />
                    </div>
                </div>
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-bold text-center">FISHR<span className="font-normal text-gray-400 ml-2">Canadian Fisheries Company Inc.</span></p>
                    <div className="h-full mt-1">
                        <StockChart2 />
                    </div>
                </div>
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">CRUDE<span className="font-normal text-gray-400 ml-2">National Cdn. Crude Oil Index</span></p>
                    <div className="h-full mt-1">
                        <StockChart3 />
                    </div>
                </div>
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">HOUSES<span className="font-normal text-gray-400 ml-2">Canada Real Estate Composite</span></p>
                    <div className="h-full mt-1">
                        <StockChart4 />
                    </div>
                </div>
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">FARMRS<span className="font-normal text-gray-400 ml-2">Union of Cdn. National Farmers</span></p>
                    <div className="h-full mt-1">
                        <StockChart5 />
                    </div>
                </div>
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">MLTRY<span className="font-normal text-gray-400 ml-2">Military Dfse Solutions of Canada</span></p>
                    <div className="h-full mt-1">
                        <StockChart6 />
                    </div>
                </div>
            </div>
            <div className="flex items-center w-full">
                <button
                    className="bg-green-500 text-white px-12 py-2 mr-4 rounded hover:bg-green-600 transition"
                    onClick={handleBuy}
                >
                    Buy
                </button>
                <button
                    className="bg-red-500 text-white px-12 py-2 mr-4 rounded hover:bg-red-600 transition"
                    onClick={handleSell}
                >
                    Sell
                </button>
                <input
                    type="number"
                    placeholder="Quantity"
                    className="w-1/4 p-2 border rounded mr-4"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
                <h1> shares of </h1>
                <input
                    type="text"
                    placeholder="Shares"
                    className="w-1/4 p-2 border rounded ml-4"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                />
            </div>
            {popupVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <p className="text-lg font-semibold">{popupMessage}</p>
                        <button
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => setPopupVisible(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
