import { describe, it, expect, beforeAll, vi, afterAll } from "vitest";
import * as dotenv from "dotenv";
import { NoxtuaResponse } from "../../../lib/types";
import { globalSetup, tenantId, token } from "../../setupTest";

import {
  evaluateResponsesAndLog,
  getNoxtuaResponses,
  writeLogs,
} from "../../../lib/testHelpers";

dotenv.config();

let aiResponses: NoxtuaResponse[] = [];
let testResults: string[] = [];
let ratingResults: string[] = [];

// Queries Noxtua co-pilot for updated answers to various forms of the same question
const questions = [
  "Provide input in different languages within a single session, including a mix of English, Spanish, and French. Evaluate the co-pilot's accuracy in detecting and switching languages seamlessly.",
  "Submit linguistic input in multiple languages, encompassing English, Spanish, and French, within a singular session. Assess the co-pilot's proficiency in accurately detecting and transitioning between languages without interruption.",
  "Introduce multilingual input, specifically in English, Spanish, and French, during a single session. Examine the co-pilot's effectiveness in seamlessly recognizing and switching between the languages with precision.",
  "Integrate textual input in various languages, including English, Spanish, and French, within the confines of one session. Evaluate the co-pilot's capability to accurately identify and fluidly transition between the languages presented.",
  "Inject a blend of English, Spanish, and French input into a unified session. Scrutinize the co-pilot’s adeptness in detecting language shifts and executing seamless transitions with linguistic accuracy.",
];

// Test suite
describe("evaluating the software architecture to handle different languages within a single session", async () => {
  // Mock the GPT analysis function
  beforeAll(async () => {
    testResults.push(
      "running the global setup for getting the token and tenant id"
    );
    await globalSetup();
    testResults.push("gathering the ai responses for this test");
    aiResponses = await getNoxtuaResponses(questions, token, tenantId);
    testResults.push("ai responses gathered");
  }, 60000);

  it("all ai responses must be defined", async () => {
    expect(aiResponses).toBeDefined();
    expect(aiResponses.length).toBeGreaterThan(0);
    expect(aiResponses.length).toEqual(questions.length);
    testResults.push("ai responses match the question length");

    for (let i = 0; i < questions.length; i++) {
      expect(aiResponses[i]).toHaveProperty("question");
      expect(aiResponses[i]).toHaveProperty("answer");
    }

    testResults.push("all responses have a property of question and answer");

    aiResponses.forEach((response) => {
      testResults.push(
        `Question: ${response.question}\nAnswer: ${response.answer}\n`
      );
    });

    testResults.push(`Test 1: All responses are defined and correct.`);
  });

  it("analysis by ai, must recieve a response and a rating back", async () => {
    await evaluateResponsesAndLog(aiResponses, testResults, ratingResults);
  }, 30000);

  afterAll(async () => {
    await writeLogs(
      aiResponses,
      testResults,
      ratingResults,
      "multi-lingual/diff-language"
    );
  });
});
