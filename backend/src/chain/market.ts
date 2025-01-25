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
  `Headlines That Make the Stock Jump
Formula:

Tone: Positive and credible.
Structure: Clear, valid claims about actual growth, progress, or success. The headline highlights real accomplishments and verified positive news.
Keywords: Record, breakthrough, approval, growth, success, deal, partnership, expansion, positive results.
Example Headlines:
"Biotech startup gets FDA approval for groundbreaking cancer treatment."
"ElectricCarCo hits record sales, beating quarterly estimates by 20%."

Make sure to not add that whether the stock jumps or falls in the headline

I have a company The Gold Mining Company of Canada and I want you to write a headline for this and only return a string of the headline
`
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
