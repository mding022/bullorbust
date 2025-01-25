import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import expressWs from 'express-ws';
import WebSocket from 'ws';
import { authRouter } from "./routers/auth";
import { startOutputParser } from "./chain/market";
import leadRouter from "./routers/leaderboard";
import helmet from "helmet";
import prisma from "./lib/db";
import { Session } from "@prisma/client";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Ollama } from "@langchain/ollama";
import requestRouter from "./routers/place-request";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";

declare global {
  namespace Express {
    interface Request {
      user?: Session
    }
  }
}
// import requestRouter from "./routers/place-request";

dotenv.config();

const { app, getWss, applyTo } = expressWs(express());
const port = process.env.PORT || 3000;

const router = express.Router() as expressWs.Router;

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning', 'Cookie']
}));

// Headers to allow ngrok and CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('ngrok-skip-browser-warning', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Session middleware
app.use(async(req, res, next) => {
  const session = req.cookies.session;
  if(session) {
    const user = await prisma.session.findUnique({ where: { id: session } });
    if(user) {
      req.user = user;
    }
  }
  next();
});

// Base route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

interface UserConnection {
  ws: WebSocket;
  userId: string;
  lastSentData: string | null;
}

// Track all active connections
const userConnections = new Map<string, UserConnection>();

// Single interval for all connections
let updateInterval: NodeJS.Timeout | null = null;

router.ws('/echo', (ws, req) => {
  ws.on('message', (msg: String) => {
      ws.send(msg);
  });

  console.log('Connection opened');
  ws.send('Hello World!');

  setInterval(() => {
    ws.send('Hello World!');
  }, 1000);

  ws.on('close', () => {
    console.log('Connection closed');
  });
});

// News types and effects
type NewsType = 'jump' | 'neutral' | 'pump_dump' | 'fall';
interface NewsEffect {
    type: NewsType;
    priceMultiplier: number;
    duration: number;
    volatility: number;
}

const newsEffects: Record<NewsType, NewsEffect> = {
    jump: { 
        type: 'jump', 
        priceMultiplier: 1.40,  // 40% increase
        duration: 6,            // Over 6 intervals
        volatility: 0.04        // Higher volatility during positive news
    },
    neutral: { 
        type: 'neutral', 
        priceMultiplier: 1.0,   // No significant change
        duration: 3,            // Short duration
        volatility: 0.01        // Low volatility during neutral news
    },
    pump_dump: { 
        type: 'pump_dump', 
        priceMultiplier: 0.70,  // 30% total decrease
        duration: 8,            // Over 8 intervals
        volatility: 0.05        // Highest volatility during pump and dump
    },
    fall: { 
        type: 'fall', 
        priceMultiplier: 0.65,  // 35% decrease
        duration: 5,            // Over 5 intervals
        volatility: 0.03        // Moderate volatility during negative news
    }
};

// Track active news effects
const activeNewsEffects = new Map<string, { effect: NewsEffect, remainingDuration: number }>();

// Define industry types for each stock
const stockIndustries = {
    'GLD': 'mining',
    'UNCF': 'agriculture',
    'CFC': 'fisheries',
    'MDS': 'defense',
    'OIL': 'energy',
    'CREC': 'real_estate'
} as const;

const newsPrompts = {
    mining: {
        jump: {
            templates: [
                "{company} discovers major gold deposit in Northern Quebec",
                "{company} secures exclusive mining rights in promising new territory",
                "{company} reports record-breaking quarterly gold production",
                "{company} receives fast-track approval for new mining project",
                "{company} implements breakthrough extraction technology, boosting efficiency by 40%"
            ]
        },
        neutral: {
            templates: [
                "{company} evaluating potential expansion of current mining operations",
                "{company} conducting environmental impact studies for new sites",
                "{company} reviewing operational efficiency measures across facilities",
                "{company} considering implementation of new extraction technologies",
                "{company} exploring additional resource locations in Western Canada"
            ]
        },
        pump_dump: {
            templates: [
                "BREAKING: Anonymous source reveals {company} sitting on massive untapped gold reserve",
                "Industry insiders hint at game-changing discovery at {company}'s newest site",
                "Leaked report suggests {company} about to announce revolutionary mining technique",
                "Undisclosed experts predict unprecedented gold yields for {company}",
                "Secret geological survey suggests {company} properties contain rare earth elements"
            ]
        },
        fall: {
            templates: [
                "{company} halts operations after major equipment failure at primary site",
                "{company} faces environmental investigation over water contamination concerns",
                "Safety violations force immediate shutdown of {company}'s largest mine",
                "Key mining permit revoked for {company}'s flagship project",
                "Major geological instability discovered at {company}'s primary mining site"
            ]
        }
    },
    agriculture: {
        jump: {
            templates: [
                "{company} secures major international grain export deal",
                "{company} reports record harvest yields across all regions",
                "{company} receives approval for innovative farming technology patent",
                "{company} signs exclusive distribution agreement with major retail chain",
                "{company} acquires premium farmland in Saskatchewan"
            ]
        },
        neutral: {
            templates: [
                "{company} evaluating sustainable farming practices for implementation",
                "{company} conducting studies on crop diversification strategies",
                "{company} reviewing potential expansion into organic markets",
                "{company} assessing impact of new agricultural technologies",
                "{company} analyzing seasonal crop rotation patterns"
            ]
        },
        pump_dump: {
            templates: [
                "Inside sources reveal {company}'s revolutionary crop yield technology",
                "Anonymous expert predicts unprecedented harvest for {company}",
                "Leaked report suggests {company} developing breakthrough fertilizer",
                "Industry insiders hint at major {company} expansion announcement",
                "Undisclosed deal could make {company} largest agricultural exporter"
            ]
        },
        fall: {
            templates: [
                "Severe drought conditions affecting {company}'s major farming regions",
                "Pest infestation threatens {company}'s primary crop yields",
                "Environmental concerns raised over {company}'s farming practices",
                "Early frost damages significant portion of {company}'s crops",
                "Supply chain issues force {company} to halt major operations"
            ]
        }
    },
    fisheries: {
        jump: {
            templates: [
                "{company} secures exclusive fishing rights in prime territories",
                "{company} reports record-breaking salmon harvest",
                "{company} receives certification for sustainable fishing practices",
                "{company} signs major distribution deal with Asian markets",
                "{company} successfully implements advanced fish farming technology"
            ]
        },
        neutral: {
            templates: [
                "{company} evaluating expansion of aquaculture operations",
                "{company} studying impact of new fishing regulations",
                "{company} reviewing sustainable fishing practices",
                "{company} considering modernization of fishing fleet",
                "{company} analyzing potential for new species cultivation"
            ]
        },
        pump_dump: {
            templates: [
                "Inside sources reveal {company}'s breakthrough aquaculture system",
                "Anonymous experts predict unprecedented catch rates for {company}",
                "Leaked report suggests {company} discovered untapped fishing grounds",
                "Industry insiders hint at major {company} technology breakthrough",
                "Undisclosed deal could revolutionize {company}'s operations"
            ]
        },
        fall: {
            templates: [
                "Unusual ocean conditions severely impact {company}'s fish stocks",
                "New fishing regulations threaten {company}'s operations",
                "Disease outbreak reported in {company}'s fish farms",
                "Environmental group files lawsuit against {company}",
                "Major equipment failure halts {company}'s fishing operations"
            ]
        }
    },
    defense: {
        jump: {
            templates: [
                "{company} awarded major government defense contract",
                "{company} successfully tests new military technology",
                "{company} secures international partnership for defense systems",
                "{company} receives approval for next-generation weapon system",
                "{company} reports breakthrough in cybersecurity technology"
            ]
        },
        neutral: {
            templates: [
                "{company} evaluating new defense technology proposals",
                "{company} reviewing potential military contracts",
                "{company} conducting research into advanced materials",
                "{company} studying applications of AI in defense systems",
                "{company} analyzing market for autonomous defense solutions"
            ]
        },
        pump_dump: {
            templates: [
                "Anonymous source reveals {company}'s classified defense project",
                "Industry insiders hint at major {company} contract announcement",
                "Leaked document suggests {company} developing revolutionary weapon",
                "Undisclosed military deal could transform {company}'s future",
                "Secret testing suggests {company}'s new system outperforms competitors"
            ]
        },
        fall: {
            templates: [
                "{company} faces investigation over contract compliance",
                "Security breach discovered in {company}'s defense systems",
                "Government cancels major contract with {company}",
                "Technical flaws found in {company}'s latest military product",
                "Congressional inquiry launched into {company}'s pricing practices"
            ]
        }
    },
    energy: {
        jump: {
            templates: [
                "{company} discovers major oil reserve in Northern territory",
                "{company} successfully implements new extraction technology",
                "{company} secures exclusive drilling rights in promising region",
                "{company} reports record-breaking quarterly production",
                "{company} receives fast-track approval for new energy project"
            ]
        },
        neutral: {
            templates: [
                "{company} evaluating renewable energy investments",
                "{company} studying impact of new drilling technologies",
                "{company} reviewing environmental protection measures",
                "{company} considering expansion into new territories",
                "{company} analyzing potential of offshore projects"
            ]
        },
        pump_dump: {
            templates: [
                "Anonymous source reveals {company}'s major oil discovery",
                "Industry insiders hint at game-changing energy technology",
                "Leaked report suggests {company} found vast untapped reserves",
                "Undisclosed experts predict unprecedented oil yields",
                "Secret geological survey suggests massive energy potential"
            ]
        },
        fall: {
            templates: [
                "Major oil spill reported at {company}'s offshore platform",
                "Environmental investigation launched into {company}'s operations",
                "Technical failure halts {company}'s primary production facility",
                "New regulations threaten {company}'s drilling projects",
                "Safety violations force shutdown of {company}'s key operations"
            ]
        }
    },
    real_estate: {
        jump: {
            templates: [
                "{company} secures prime development locations in major cities",
                "{company} reports record-breaking property sales",
                "{company} receives approval for major urban development project",
                "{company} signs landmark commercial leasing agreement",
                "{company} successfully completes luxury development ahead of schedule"
            ]
        },
        neutral: {
            templates: [
                "{company} evaluating potential property acquisitions",
                "{company} studying impact of market trends on portfolio",
                "{company} reviewing development opportunities in emerging markets",
                "{company} considering expansion into new property segments",
                "{company} analyzing commercial real estate demand patterns"
            ]
        },
        pump_dump: {
            templates: [
                "Inside sources reveal {company}'s major development plans",
                "Anonymous experts predict unprecedented property value growth",
                "Leaked document suggests {company} acquiring prime locations",
                "Industry insiders hint at major {company} expansion",
                "Undisclosed deal could transform {company}'s portfolio"
            ]
        },
        fall: {
            templates: [
                "Major construction defects discovered in {company}'s properties",
                "Market downturn severely impacts {company}'s portfolio value",
                "Zoning changes threaten {company}'s development projects",
                "Environmental concerns halt {company}'s construction plans",
                "Financial audit reveals concerns in {company}'s operations"
            ]
        }
    }
};

// Define Zod schema for news output
const newsOutputSchema = z.object({
    description: z.string().max(200).min(20)
});

async function generateNewsHeadline(symbol: string, type: NewsType): Promise<{ title: string, desc: string }> {
    const industry = stockIndustries[symbol as keyof typeof stockIndustries];
    const industryPrompts = newsPrompts[industry];
    const templates = industryPrompts[type].templates;
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    const title = selectedTemplate.replace("{company}", symbol);
    
    const ollama = new Ollama({
        model: "deepseek-r1:7b",
        temperature: 0.7,
    });

    const descPrompt = `Write a 2-3 sentence financial news description for this headline: "${title}"

Requirements:
1. Be specific and factual
2. Expand on the headline with relevant details
3. Use professional financial news language
4. Keep it between 20-200 characters
5. When mentioning any prices, amounts, or percentages, use numbers with exactly 2 decimal places (e.g., $45.20, 12.50%)
6. Format the response as valid JSON like this:
{
    "description": "Your 2-3 sentence description here with prices like $45.20"
}

Return ONLY the JSON, no other text.`;

    try {
        const response = await ollama.invoke(descPrompt);
        let parsedResponse;
        
        try {
            // Try to parse the response as JSON
            parsedResponse = JSON.parse(response);
        } catch {
            // If not valid JSON, wrap the raw response
            parsedResponse = { description: response.trim() };
        }
        
        // Validate with Zod schema
        const parsed = newsOutputSchema.parse(parsedResponse);
        
        return { 
            title,
            desc: parsed.description
        };
    } catch (error) {
        // Create a more specific fallback description based on the news type
        const fallbacks = {
            jump: `${symbol} announces significant positive developments in their operations, leading to increased market confidence.`,
            neutral: `${symbol} continues regular operations while evaluating future opportunities and market conditions.`,
            pump_dump: `Market speculation surrounds ${symbol} as unconfirmed reports circulate about potential developments.`,
            fall: `${symbol} faces operational challenges that have raised concerns among market observers.`
        };
        
        return {
            title,
            desc: fallbacks[type]
        };
    }
}

function generateStockPrice(currentPrice: number, symbol: string): number {
    const newsEffect = activeNewsEffects.get(symbol);
    const baseVolatility = 0.01; // Reduced base volatility
    let volatility = baseVolatility;
    let trend = 0;

    if (newsEffect) {
        volatility = newsEffect.effect.volatility;

        if (newsEffect.effect.type === 'pump_dump') {
            // Initial pump phase (first 25% of duration)
            const pumpPhaseDuration = Math.floor(newsEffect.effect.duration * 0.25);
            if (newsEffect.remainingDuration > newsEffect.effect.duration - pumpPhaseDuration) {
                trend = 0.15; // 15% up during pump
            } else {
                trend = (newsEffect.effect.priceMultiplier - 1.15) / (newsEffect.effect.duration - pumpPhaseDuration); // Rest is decline
            }
        } else if (newsEffect.effect.type === 'jump') {
            // Rapid initial jump followed by stabilization
            const jumpPhaseDuration = Math.floor(newsEffect.effect.duration * 0.5);
            if (newsEffect.remainingDuration > newsEffect.effect.duration - jumpPhaseDuration) {
                trend = (newsEffect.effect.priceMultiplier - 1) / jumpPhaseDuration;
            } else {
                trend = 0; // Stabilize after the jump
            }
        } else if (newsEffect.effect.type === 'fall') {
            // Sharp initial drop followed by slower decline
            const sharpDropDuration = Math.floor(newsEffect.effect.duration * 0.4);
            if (newsEffect.remainingDuration > newsEffect.effect.duration - sharpDropDuration) {
                trend = -0.20; // 20% sharp drop
            } else {
                trend = (newsEffect.effect.priceMultiplier - 0.8) / (newsEffect.effect.duration - sharpDropDuration);
            }
        } else {
            // Neutral news: small random movements
            trend = (Math.random() - 0.5) * 0.01; // ±0.5% random drift
        }

        // Decrease remaining duration
        newsEffect.remainingDuration--;
        if (newsEffect.remainingDuration <= 0) {
            activeNewsEffects.delete(symbol);
        }
    }

    const randomChange = currentPrice * (Math.random() * 2 * volatility - volatility);
    const trendChange = currentPrice * trend;
    // Round to 2 decimal places
    return Number((Math.max(currentPrice + randomChange + trendChange, 0.01)).toFixed(2));
}

async function updateStockPrices(priceUpdates: { symbol: string, oldPrice: number, newPrice: number, timestamp: Date }[]) {
    const MAX_PRICES = 120;
    
    // Process each stock update sequentially instead of in a transaction
    for (const update of priceUpdates) {
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                const stock = await prisma.stock.findUnique({
                    where: { symbol: update.symbol }
                });
                
                if (!stock) continue;
                
                // Get current prices and add new one
                let updatedPrices = [...stock.price, Number(update.newPrice.toFixed(2))];
                
                // Keep only the last 120 prices
                if (updatedPrices.length > MAX_PRICES) {
                    updatedPrices = updatedPrices.slice(-MAX_PRICES);
                }
                
                await prisma.stock.update({
                    where: { symbol: update.symbol },
                    data: { 
                        price: updatedPrices
                    }
                });
                break; // Success, exit retry loop
            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    console.error(`Failed to update ${update.symbol} after ${maxRetries} attempts`);
                    throw error;
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
            }
        }
    }
}

// Create a new router for market data
const marketRouter = express.Router();

// Get latest price for a specific stock
marketRouter.get('/price/:symbol', async (req, res) => {
    try {
        const stock = await prisma.stock.findUnique({
            where: { symbol: req.params.symbol },
            select: {
                symbol: true,
                price: true
            }
        });

        if (!stock) {
            res.status(404).json({ error: 'Stock not found' });
            return;
        }

        const latestPrice = Number(stock.price[stock.price.length - 1]);
        
        res.json({
            symbol: stock.symbol,
            price: Number(latestPrice.toFixed(2)),
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error fetching stock price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get latest prices for all stocks
marketRouter.get('/prices', async (req, res) => {
    try {
        const stocks = await prisma.stock.findMany({
            select: {
                symbol: true,
                price: true
            }
        });

        const priceData = stocks.map(stock => ({
            symbol: stock.symbol,
            price: Number(stock.price[stock.price.length - 1].toFixed(2)),
            timestamp: new Date()
        }));

        res.json(priceData);
    } catch (error) {
        console.error('Error fetching stock prices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get latest news
marketRouter.get('/news/latest', async (req, res) => {
    try {
        const latestNews = await prisma.news.findMany({
            orderBy: {
                id: 'desc'
            },
            take: 6
        });

        res.json(latestNews);
    } catch (error) {
        console.error('Error fetching latest news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get latest news for a specific stock
marketRouter.get('/news/:symbol', async (req, res) => {
    try {
        const stockNews = await prisma.news.findMany({
            where: {
                tickers: {
                    equals: { symbol: req.params.symbol }
                }
            },
            orderBy: {
                id: 'desc'
            },
            take: 10
        });

        res.json(stockNews);
    } catch (error) {
        console.error('Error fetching stock news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's personal value
marketRouter.get('/value/:username', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username: req.params.username }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Get current stock prices
        const stocks = await prisma.stock.findMany();
        const stockPrices = new Map(stocks.map(stock => [
            stock.symbol, 
            Number(stock.price[stock.price.length - 1])
        ]));

        // Calculate holdings value
        const holdings = (user.holding as any)?.data || [];
        const holdingsValue = holdings.reduce((total: number, holding: any) => {
            const price = stockPrices.get(holding.stock) || 0;
            return total + (price * holding.amount);
        }, 0);

        // Total value = balance + holdings value
        const totalValue = Number((user.balance || 0) + holdingsValue);

        res.json({
            username: user.username,
            balance: Number((user.balance || 0).toFixed(2)),
            holdingsValue: Number(holdingsValue.toFixed(2)),
            totalValue: Number(totalValue.toFixed(2))
        });
    } catch (error) {
        console.error('Error calculating personal value:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Background tasks for price updates and news generation
let lastNewsId: string | null = null;

// Price update interval (every 0.5 seconds)
setInterval(async () => {
    try {
        const stocks = await prisma.stock.findMany({
            orderBy: {
                symbol: 'asc'  // Ensure consistent ordering
            }
        });
        const priceUpdates = stocks.map(stock => {
            const currentPrices = stock.price;
            const latestPrice = Number(currentPrices[currentPrices.length - 1]);
            const newPrice = generateStockPrice(latestPrice, stock.symbol);
            
            return {
                symbol: stock.symbol,
                oldPrice: Number(latestPrice.toFixed(2)),
                newPrice: Number(newPrice.toFixed(2)),
                timestamp: new Date()
            };
        });

        await updateStockPrices(priceUpdates);
    } catch (error) {
        console.error('Error in price update:', error);
    }
}, 500);

// News generation interval (every 15 seconds)
setInterval(async () => {
    try {
        // Get all stocks and shuffle them
        const stocks = await prisma.stock.findMany({
            select: {
                symbol: true,
                price: true
            }
        });
        
        if (stocks.length === 0) return;

        // Fisher-Yates shuffle algorithm
        for (let i = stocks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [stocks[i], stocks[j]] = [stocks[j], stocks[i]];
        }

        // Take the first stock after shuffling
        const selectedStock = stocks[0];
        console.log('Selected stock for news:', selectedStock.symbol);

        const newsTypes: NewsType[] = ['jump', 'neutral', 'pump_dump', 'fall'];
        const newsType = newsTypes[Math.floor(Math.random() * newsTypes.length)];

        const news = await generateNewsHeadline(selectedStock.symbol, newsType);
        const savedNews = await prisma.news.create({
            data: {
                title: news.title,
                desc: news.desc,
                tickers: { symbol: selectedStock.symbol, effect: newsType }
            }
        });

        lastNewsId = savedNews.id;

        // Apply news effect
        activeNewsEffects.set(selectedStock.symbol, {
            effect: newsEffects[newsType],
            remainingDuration: newsEffects[newsType].duration
        });
    } catch (error) {
        console.error('Error generating news:', error);
    }
}, 15000);

// Add the market router to the main app
app.use('/market', marketRouter);

// Main routers
app.use("/auth", authRouter);
app.use('/ws', router);
app.use('/leaderboard', leadRouter);
app.use('/place-request', requestRouter);

// 404 handler - MUST come after all other routes
app.use("*", (req, res) => {
  res.status(404).send("Not Found");
});

// Error handling - MUST be last
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// async function main() {
//   const result = await startOutputParser();
//   console.log(result);
// }

// main();

