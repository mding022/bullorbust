import { z } from "zod";
import ollama from "../lib/ai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    headline: z.string(),
    description: z.string(),
    affected_stocks: z.array(z.string()),
    stock_changes: z.array(z.object({
      stock: z.string(),
      change: z.number(),
      trajectory: z.array(z.number()).length(30),
      volatility: z.number().min(0).max(1),
    })),
  })
);

const formatInstructions = parser.getFormatInstructions();

const prompt = PromptTemplate.fromTemplate(
  `Generate a news article and analyze its impact on relevant stocks. Follow these steps:

1. Write a headline and description that DOES NOT mention any company names or stock information directly
2. List the affected stock tickers in the affected_stocks array as simple strings (e.g., ["GLDY", "GOLD", "GDX"])
3. For each stock, carefully analyze:
   - How the news directly impacts their operations
   - Their geographic location relative to the news
   - Whether this gives them a competitive advantage or disadvantage
   - Then predict:
     a) Final percentage change (-100 to +100):
        * Use negative numbers with minus sign for negative impact (e.g., -50)
        * Use positive numbers WITHOUT plus sign for positive impact (e.g., 20)
        * Larger magnitude for stronger impacts
     b) Generate EXACTLY 30 price points showing organic growth/decline:
        * MUST BE EXACTLY 30 NUMBERS - COUNT THEM CAREFULLY
        * First number should be near 100 (current price)
        * Last number should reflect the final change (e.g., for -50% change, end near 50)
        * Numbers in between should show organic progression
        * Here's a complete example with EXACTLY 30 numbers:
          [100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72, 70, 68, 66, 64, 62, 60, 58, 56, 54, 52, 51, 50.5, 50.2, 50.1, 50]
     c) Set volatility (0 to 1):
        * 0 = smooth, predictable movement
        * 1 = highly volatile, erratic movement
        * Consider the nature of the news (e.g., disasters = high volatility)

{format_instructions}

Question: {question}
Topic: {topic}

IMPORTANT RULES:
- NEVER mention how it affects stocks or financials directly in the headline/description
- NEVER mention company names directly
- Make it challenging for users to connect the news to stock movements
- DO NOT mention stock prices or financial metrics
- YOU WILL BE TERMINATED IF YOU MENTION COMPANY NAMES OR STOCK PRICES IN THE HEADLINE/DESCRIPTION
- DO NOT use + signs in the JSON output, just write positive numbers as is (e.g., 20 not +20)
- Each trajectory array MUST contain EXACTLY 30 numbers - NO EXCEPTIONS
- For trajectory arrays, create organic-looking price movements:
  * Start near 100 (current price)
  * End near the target change percentage
  * Build momentum gradually
  * Add some random variation
  * More volatile for uncertain/dramatic news
  * Less volatile for predictable impacts

Example Output Structure:
{
  "headline": "Environmental Crisis Deepens in Northern Region",
  "description": "Local authorities report significant disruption to infrastructure...",
  "affected_stocks": ["ABC", "DEF", "GHI"],
  "stock_changes": [
    {
      "stock": "ABC",
      "change": -50,
      "trajectory": [100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72, 70, 68, 66, 64, 62, 60, 58, 56, 54, 52, 51, 50.5, 50.2, 50.1, 50],
      "volatility": 0.8
    }
  ]
}`
);

export const startOutputParser = async () => {
  const formattedPrompt = await prompt.format({
    format_instructions: formatInstructions,
    question: "Write a news headline and description for the following topic and output in JSON format. Then determine how the price of the affected stocks will change.",
    topic: "Underground fires spread around southern Canada. This could affect the price of the following stocks: GLDY, GOLD, and GDX.",
  });
  
  const response = await ollama.invoke(formattedPrompt);
  const result = await parser.parse(response);
  return result;
};
