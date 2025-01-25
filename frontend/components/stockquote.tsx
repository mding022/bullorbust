import { useState } from 'react';
import StockChart1 from './stream/quotes/gld';
import StockChart2 from './stream/quotes/fishrs';
import StockChart3 from './stream/quotes/crude';
import StockChart4 from './stream/quotes/houses';
import StockChart5 from './stream/quotes/farmrs';
import StockChart6 from './stream/quotes/mltry';

export default function StockQuote() {
    const [quantity, setQuantity] = useState('');
    const [shares, setShares] = useState('');

    return (
        <div className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">GLD</p>
                    <div className="h-24">
                        <StockChart1 />
                    </div>
                </div>
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">FISHR</p>
                    <div className="h-24">
                        <StockChart2 />
                    </div>
                </div>
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">CRUDE</p>
                    <div className="h-24">
                        <StockChart3 />
                    </div>
                </div>
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">HOUSES</p>
                    <div className="h-24">
                        <StockChart4 />
                    </div>
                </div>
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">FARMRS</p>
                    <div className="h-24">
                        <StockChart5 />
                    </div>
                </div>
                <div className="p-2 border rounded shadow bg-white">
                    <p className="text-sm font-semibold text-center">TECH</p>
                    <div className="h-24">
                        <StockChart6 />
                    </div>
                </div>
            </div>
            <div className="flex items-center w-full">
                <button className="bg-green-500 text-white px-4 py-2 mr-4 rounded hover:bg-green-600 transition">
                    Buy
                </button>
                <button className="bg-red-500 text-white px-4 py-2 mr-4 rounded hover:bg-red-600 transition">
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
        </div>
    );
}
