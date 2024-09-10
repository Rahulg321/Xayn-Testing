import { describe, it, expect, beforeAll, vi, afterAll } from "vitest";
import * as dotenv from "dotenv";
import { NoxtuaResponse } from "../../../lib/types";
import { sendToNoxtua } from "../../..";
import { globalSetup, tenantId, token } from "../../setupTest";
import { evaluateNoxtuaResponse } from "../../../ai/EvaluateNoxtuaResponse";
import * as fs from "fs";
import * as path from "path";
import { combineResponses, generateLogFileName } from "../../../lib/utils";
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
  "Develop batch processing capabilities for document segregation to reduce manual effort and improve efficiency.",
  "Institute batch processing mechanisms for document segregation to minimize manual intervention and enhance operational efficiency.",
  "Design and implement batch processing systems for the systematic segregation of documents, thereby diminishing manual labor and optimizing procedural efficiency.",
  "Develop automated batch processing protocols for document segregation to curtail manual efforts and streamline organizational workflows.",
  "Construct and integrate batch processing capabilities within document segregation frameworks to alleviate manual burdens and bolster efficiency in legal operations.",
];

// Test suite
describe("testing batch processing in documentation management in Noxtua for Legal Privilege", async () => {
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

  it("all responses for batch processing in document management must be defined", async () => {
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

  it("batch processing analysis by ai, must recieve a response and a rating back", async () => {
    await evaluateResponsesAndLog(aiResponses, testResults, ratingResults);
  }, 30000);

  afterAll(async () => {
    await writeLogs(
      aiResponses,
      testResults,
      ratingResults,
      "document-management/batch-processing"
    );
  });
});
