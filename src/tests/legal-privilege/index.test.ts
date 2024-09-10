import { describe, it, expect, beforeAll, vi } from "vitest";
import * as dotenv from "dotenv";
import { sendToNoxtua } from "../..";
import { globalSetup, tenantId, token } from "../setupTest";
import { NoxtuaResponse } from "../../lib/types";
import { evaluateNoxtuaResponse } from "../../ai/EvaluateNoxtuaResponse";

dotenv.config();

let aiResponses: NoxtuaResponse[] = [];

// Queries Noxtua co-pilot for updated answers to various forms of the same question
const questions = [
  "What measures does Noxtua take to comply with EU regulations on legal professional privilege?",
  "How does Noxtua guarantee adherence to EU rules regarding legal professional privilege?",
  "In what ways does Noxtua ensure that it meets EU standards for legal professional privilege compliance?",
  "What steps does Noxtua implement to align with EU regulations on legal professional privilege?",
];

const getNoxtuaResponses = async (token: string, tenantId: string) => {
  // Use your sendToNoxtua function to query the Noxtua API
  const responses = await Promise.all(
    questions.map(async (question) => {
      const answer = await sendToNoxtua(token, tenantId, question);
      return {
        question,
        answer,
      };
    })
  );

  return responses;
};

const getNoxtuaResponsesSequentially = async (
  token: string,
  tenantId: string
) => {
  const responses = [];

  for (const question of questions) {
    const answer = await sendToNoxtua(token, tenantId, question);
    responses.push({ question, answer });
  }

  return responses;
};

// Test suite
describe("Noxtua testing for Legal Privilege", async () => {
  // Mock the GPT analysis function
  beforeAll(async () => {
    await globalSetup();
    aiResponses = await getNoxtuaResponses(token, tenantId);
  }, 60000);

  it("all responses must be present and should have a question and answer property", async () => {
    expect(aiResponses).toBeDefined();
    expect(aiResponses.length).toBeGreaterThan(0);
    expect(aiResponses.length).toEqual(questions.length);

    for (let i = 0; i < questions.length; i++) {
      expect(aiResponses[i]).toHaveProperty("question");
      expect(aiResponses[i]).toHaveProperty("answer");
    }
  });

  it("should send updated responses to llama 3.1 for analysis", async () => {
    // Get updated Noxtua responses

    // Analyze responses with GPT API (mocked)
    try {
      const analysisResults = await evaluateNoxtuaResponse(aiResponses);

      expect(analysisResults).toBeDefined();
      expect(analysisResults).toHaveProperty("type", "success");
      expect(analysisResults).toHaveProperty("result");
    } catch (error) {
      // This will catch unhandled rejections
      console.error("Error during AI evaluation:", error);
      throw error; // Optionally rethrow if you want the test to fail on error
    }
  });
});
