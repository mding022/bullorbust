import { useEffect, useState } from 'react';

// Define types for the news data
export interface NewsItem {
    time: string;
    title: string;
    content: string;
}

// Define the hook to fetch news data from API
export function useNews(): NewsItem[] {
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        async function fetchNews() {
            try {
                const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/bean/api/news');
                const data: string[] = await response.json(); // Assuming the response is an array of strings

                const formattedNews = data.map((item) => ({
                    time: "9:02", // Set the time to a fixed value
                    title: "Bloomberg Equity Market Update", // Use a fixed title for all news
                    content: item, // Use the content from each news item
                }));

                setNews(formattedNews.reverse()); // Update state with the fetched data
            } catch (error) {
                console.error("Error fetching news:", error);
            }
        }

        fetchNews(); // Fetch news on component mount

        const interval = setInterval(fetchNews, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return news;
}
