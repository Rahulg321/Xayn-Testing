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
  "Are there clear mechanisms for reporting misconduct while evaluating compliance and ethical considerations by Noxtua?",
  "Does Noxtua comply with regulations by providing clear mechanisms for reporting misconduct?",
  "What ethical standards guide Noxtua in establishing clear mechanisms for reporting misconduct?",
  "What technical measures are implemented by Noxtua to ensure the mechanisms for reporting misconduct are clear and effective?",
  "How does Noxtua handle reports of misconduct that may involve conflicts of interest within the legal team using the platform?",
];

// Test suite
describe("evaluating clear mechanisms for reporting misconduct while evaluating compliance and ethical considerations by Noxtua", async () => {
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
      "ethical-compliance/clear-mechanism"
    );
  });
});
