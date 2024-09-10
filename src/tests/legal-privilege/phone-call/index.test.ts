import { describe, it, expect, beforeAll, vi, afterAll } from "vitest";
import * as dotenv from "dotenv";
import { sendToNoxtua } from "../../..";
import { globalSetup, tenantId, token } from "../../setupTest";
import { NoxtuaResponse } from "../../../lib/types";
import { evaluateNoxtuaResponse } from "../../../ai/EvaluateNoxtuaResponse";
import { combineResponses, generateLogFileName } from "../../../lib/utils";
import * as fs from "fs";
import * as path from "path";
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
  "How does Noxtua implement secure protocols for attorney-client phone calls?",
  "How can secure protocols be implemented for attorney-client phone calls",
  "What steps should be taken to ensure secure protocols for attorney-client phone communications?",
  "How do we establish secure methods for attorney-client phone conversations?",
  "What measures can be used to protect attorney-client confidentiality during phone calls?",
];

// Test suite
describe("Testing secure protocols developed by Noxtua for attorney client privileges", async () => {
  // Mock the GPT analysis function
  beforeAll(async () => {
    testResults.push(
      "running the global setup for getting the token and tenant id"
    );
    await globalSetup();
    testResults.push("gathering the ai responses for this test");
    aiResponses = await getNoxtuaResponses(questions, token, tenantId);
  }, 60000);

  it("all ai-responses for testing secure protocols must be present and should have a question and answer property", async () => {
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

  it("eu rules analysis by ai, must recieve a response and a rating back", async () => {
    await evaluateResponsesAndLog(aiResponses, testResults, ratingResults);
  }, 30000);
});

afterAll(async () => {
  await writeLogs(
    aiResponses,
    testResults,
    ratingResults,
    "legal-privilege/phone-call"
  );
});
