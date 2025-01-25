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
            height: 200,
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        const series = chart.addAreaSeries({
            lineColor: "#2196F3",
            topColor: "rgba(33, 150, 243, 0.3)",
            bottomColor: "rgba(33, 150, 243, 0.0)"
        });

        series.setData([]);
        chart.timeScale().fitContent();
        chart.timeScale().scrollToPosition(5);

        const fetchLiveData = (() => {
            let lastTime = Math.floor(Date.now() / 1000);
            let lastPrice = 100;

            return () => {
                const now = Math.floor(Date.now() / 1000);
                const priceChange = (Math.random() - 0.5) * 2;
                const newPrice = lastPrice + priceChange;
                if (now > lastTime) {
                    lastTime = now;
                    series.update({ time: now, value: newPrice });
                }
                lastPrice = newPrice;
            };
        })();

        const intervalID = setInterval(() => {
            fetchLiveData();
        }, 100);

        window.addEventListener("resize", () => {
            chart.applyOptions({ height: 200 });
        });

        return () => {
            clearInterval(intervalID);
            chart.remove();
        };
    }, []);

    return <div ref={chartContainerRef} className="w-full h-48" />;
};

export default Chart;
