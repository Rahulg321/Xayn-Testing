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
  "Ensure the system can handle and segregate documents from multiple sources seamlessly.Ensure the system can handle and segregate documents from multiple sources seamlessly.",
  "Draft and enforce customizable segregation protocols to ensure the efficient categorization and management of diverse document types and varying volumes.",
  "Formulate and integrate bespoke segregation mechanisms to optimize the systematic handling and organization of assorted legal documents and their respective quantities.",
  "Engineer and implement tailored segregation frameworks to enhance the regulatory oversight and administration of distinct categories of legal documentation and their volumes.",
  "Devise and operationalize adaptable segregation standards to improve the structured governance and control of various legal document types and their associated volumes.",
];

// Test suite
describe("testing documentation management from multiple sources in Noxtua for Legal Privilege", async () => {
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

  it("all responses for large volumes in document management must be defined", async () => {
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

  it("documenation standard for large volume analysis by ai, must recieve a response and a rating back", async () => {
    await evaluateResponsesAndLog(aiResponses, testResults, ratingResults);
  }, 30000);

  afterAll(async () => {
    await writeLogs(
      aiResponses,
      testResults,
      ratingResults,
      "document-management/multiple-sources"
    );
  });
});
