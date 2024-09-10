import dotenv from "dotenv";
import { createOpenAI as createGroq, createOpenAI } from "@ai-sdk/openai";

dotenv.config();

export const groq = createGroq({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export const openai = createOpenAI({
  // custom settings, e.g.
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: "strict", // strict mode, enable when using the OpenAI API
});
