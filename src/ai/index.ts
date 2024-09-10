import dotenv from "dotenv";
import { createOpenAI as createGroq } from "@ai-sdk/openai";

dotenv.config();

export const groq = createGroq({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});
