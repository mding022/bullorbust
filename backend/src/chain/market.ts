import { z } from "zod";
import ollama from "../lib/ai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

// Validate that trajectory has exactly 30 numbers
const validateTrajectory = (arr: number[]) => arr.length === 30;

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    headline: z.string(),
    description: z.string(),
    affected_stocks: z.array(z.string()),
    stock_changes: z.array(z.object({
      stock: z.string(),
      change: z.number(),
      trajectory: z.array(z.number()).length(30).refine(validateTrajectory, "Must have exactly 30 numbers"),
      volatility: z.number().min(0).max(1),
    })),
  })
);

const formatInstructions = parser.getFormatInstructions();

const prompt = PromptTemplate.fromTemplate(
  `Generate a news article and analyze its impact on relevant stocks. Follow these steps:

1. Write a headline and description that DOES NOT mention any company names or stock information directly
2. List the affected stock tickers in the affected_stocks array as simple strings (e.g., ["GLDY", "GOLD", "GDX"])
3. For each stock in stock_changes array, you MUST include ALL of these fields:
   - "stock": ticker symbol as string
   - "change": final percentage as number
   - "trajectory": EXACTLY 30 NUMBERS (NO MORE, NO LESS)
   - "volatility": number between 0 and 1 (NOT higher)

TRAJECTORY REQUIREMENTS (CRITICAL):
1. Each trajectory MUST have EXACTLY 30 numbers
2. Here is a valid trajectory with 30 numbers (copy this pattern but adjust values):
   [100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72, 70, 68, 66, 64, 62, 60, 58, 56, 54, 52, 51, 50.5, 50.2, 50.1, 50]
3. COUNT YOUR NUMBERS CAREFULLY - MUST BE EXACTLY 30
4. Start near 100
5. End near your target percentage
6. VERIFY THE COUNT BEFORE SUBMITTING

For each stock, analyze:
- How the news directly impacts their operations
- Their geographic location relative to the news
- Whether this gives them a competitive advantage or disadvantage
- Then predict:
  a) Final percentage change (-100 to +100):
     * Use negative numbers with minus sign for negative impact (e.g., -50)
     * Use positive numbers WITHOUT plus sign for positive impact (e.g., 20)
  b) Volatility (0 to 1 only):
     * 0 = smooth, predictable movement
     * 1 = highly volatile, erratic movement
     * MUST be between 0 and 1, NOT higher

{format_instructions}

Question: {question}
Topic: {topic}

FINAL CHECKLIST:
✓ Headline and description avoid mentioning companies
✓ affected_stocks is an array of strings
✓ Each stock_changes entry has ALL required fields
✓ Each trajectory has EXACTLY 30 numbers
✓ All volatility values are between 0 and 1
✓ No + signs in numbers
✓ Verify trajectory count before submitting`
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
