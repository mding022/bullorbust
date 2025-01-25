"use client";

import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const Chart = () => {
    const chartContainerRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chartOptions = {
            layout: {
                textColor: "black",
                background: { type: "solid", color: "white" },
                attributionLogo: false
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
                tickMarkFormatter: (time) => new Date(time * 1000).toLocaleTimeString(),
            },
            height: 100,
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        const series = chart.addAreaSeries({
            lineColor: "#FFC107",
            topColor: "rgba(255, 193, 7, 0.3)",
            bottomColor: "rgba(255, 193, 7, 0.0)"
        });

        series.setData([]);
        chart.timeScale().fitContent();
        chart.timeScale().scrollToPosition(5);

        const ws = new WebSocket("ws://normal-heroic-wren.ngrok-free.app/ws/live");

        ws.onopen = () => {
            console.log("WebSocket connection established");
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "price") {
                const gldData = message.data.find(item => item.symbol === "GLD");
                if (gldData) {
                    const timestamp = new Date(gldData.timestamp).getTime() / 1000; // Convert to Unix timestamp
                    const newPrice = gldData.newPrice;
                    series.update({ time: timestamp, value: newPrice });
                }
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error: ", error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        window.addEventListener("resize", () => {
            chart.applyOptions({ height: 100 });
        });

        return () => {
            ws.close();
            chart.remove();
        };
    }, []);

    return <div ref={chartContainerRef} className="w-full h-28" />;
};

export default Chart;
