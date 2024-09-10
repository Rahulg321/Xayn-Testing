import { generateText } from "ai";
import { createOpenAI as createGroq } from "@ai-sdk/openai";
import { groq, openai } from ".";

export async function llamaGenerateResponse() {
  try {
    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt: "What is love?",
    });
    return text;
  } catch (error) {
    console.error("an error occured", error);
    return "Could not send request";
  }
}

export async function openaiGenerateResponse() {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: "What is love?",
    });
    return text;
  } catch (error) {
    console.error("an error occured", error);
    return "Could not send request";
  }
}
