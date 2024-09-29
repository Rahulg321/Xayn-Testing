import { generateText } from "ai";
import { createOpenAI as createGroq } from "@ai-sdk/openai";
import { JSONParseError, TypeValidationError, generateObject } from "ai";
import { groq, openai } from ".";
import { z } from "zod";
import { NoxtuaResponse } from "../lib/types";
import { combineResponses } from "../lib/utils";

const testRatingSchema = z.object({
  overallRating: z
    .number()
    .min(0, { message: "Rating must be at least 0" })
    .max(5, { message: "Rating must not exceed 5" }),

  reasonForRating: z.string().min(10, {
    message: "Reason for rating must be at least 10 characters long",
  }),
});

type testRating = z.infer<typeof testRatingSchema>;

export async function evaluateNoxtuaResponse(
  aiResponses: NoxtuaResponse[]
): Promise<
  | { type: "success"; result: testRating }
  | { type: "parse-error"; text: string }
  | { type: "validation-error"; value: unknown }
  | { type: "unknown-error"; error: unknown }
> {
  if (!aiResponses || aiResponses.length === 0) {
    return { type: "unknown-error", error: "ai responses is undefined" };
  }

  const combinedResponse = combineResponses(aiResponses);

  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: testRatingSchema,
      prompt: `You are a helpful AI Assistant evaluating responses from a legal Copilot. I have asked it 4 different but similar legal-related questions. Below are the combined responses it provided: ${combinedResponse}.
      Please rate the combined response on a scale of 0 to 5, where 5 represents highly accurate and relevant answers, and 0 indicates poor or irrelevant answers. In addition to the rating, explain your reasoning in less than 200 words, covering the accuracy, clarity, and completeness of the answers.`,
    });

    return { type: "success", result: result.object };
  } catch (error) {
    console.log(error);
    if (TypeValidationError.isInstance(error)) {
      return { type: "validation-error", value: error.value };
    } else if (JSONParseError.isInstance(error)) {
      return { type: "parse-error", text: error.text };
    } else {
      return { type: "unknown-error", error };
    }
  }
}

export async function evaluateDocumentResponseFromNoxtua(
  questionAsked: string,
  aiResponse: string
): Promise<
  | { type: "success"; result: testRating }
  | { type: "parse-error"; text: string }
  | { type: "validation-error"; value: unknown }
  | { type: "unknown-error"; error: unknown }
> {
  if (!aiResponse) {
    return { type: "unknown-error", error: "ai response is undefined" };
  }

  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: testRatingSchema,
      prompt: `You are a helpful AI Assistant evaluating responses from a legal Copilot. I have supplied it a legal document and asked it to analyse it using the following question: ${questionAsked}. Below is the combined response it provided: ${aiResponse}.
      Please rate the combined response on a scale of 0 to 5, where 5 represents highly accurate and relevant answers, and 0 indicates poor or irrelevant answers. In addition to the rating, explain your reasoning in less than 200 words, covering the accuracy, clarity, and completeness of the answers.`,
    });

    console.log("Result generated for response analysis", result);

    return { type: "success", result: result.object };
  } catch (error) {
    console.log(
      "An error occured while evaluating the response from chatgpt",
      error
    );
    if (TypeValidationError.isInstance(error)) {
      return { type: "validation-error", value: error.value };
    } else if (JSONParseError.isInstance(error)) {
      return { type: "parse-error", text: error.text };
    } else {
      return { type: "unknown-error", error };
    }
  }
}
