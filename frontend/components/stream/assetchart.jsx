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
        chart.timeScale().scrollToPosition(5, true);

        const fetchLiveData = async () => {
            try {
                const response = await fetch("https://bullorbust.matiass.ca/balance/millerding222", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const price = await response.json();

                if (typeof price === 'number') {
                    series.update({
                        time: Math.floor(Date.now() / 1000),
                        value: price,
                    });
                }
            } catch (error) {
                console.error("Error fetching live data:", error);
            }
        };

        const intervalID = setInterval(() => {
            fetchLiveData();
        }, 1000);

        window.addEventListener("resize", () => {
            chart.applyOptions({ height: 200 });
        });

        return () => {
            clearInterval(intervalID);
            chart.remove();
        };
    }, []);

    return <div ref={chartContainerRef} className="w-full h-52" />;
};

export default Chart;
