import { Ollama } from "@langchain/ollama";

const ollama = new Ollama({
    model: "deepseek-r1:7b",
    temperature: 0.7,
    maxRetries: 3,
});

export default ollama;