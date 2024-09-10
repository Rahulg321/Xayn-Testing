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
  "Develop and integrate customizable segregation rules to better manage different document types and volumes.",
  "Formulate and implement adaptable segregation protocols to enhance the management of diverse document types and varying volumes.",
  "Engineer and incorporate bespoke rules for segregation to optimize the handling of assorted document classifications and quantities.",
  "Devise and integrate configurable segregation methodologies to improve the administration of distinct document types and their respective volumes.",
  "Construct and deploy tailored segregation guidelines to more effectively govern the organization of various document types and their volumes.",
];

// Test suite
describe("testing diverse documentation types in Noxtua for Legal Privilege", async () => {
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

  it("all responses for diverse document types in document management must be defined", async () => {
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

  it("documenation types analysis by ai, must recieve a response and a rating back", async () => {
    await evaluateResponsesAndLog(aiResponses, testResults, ratingResults);
  }, 30000);

  afterAll(async () => {
    await writeLogs(
      aiResponses,
      testResults,
      ratingResults,
      "document-management/diverse-types"
    );
  });
});
