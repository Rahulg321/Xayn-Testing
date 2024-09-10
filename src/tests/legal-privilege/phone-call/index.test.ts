import { describe, it, expect, beforeAll, vi, afterAll } from "vitest";
import * as dotenv from "dotenv";
import { sendToNoxtua } from "../../..";
import { globalSetup, tenantId, token } from "../../setupTest";
import { NoxtuaResponse } from "../../../lib/types";
import { evaluateNoxtuaResponse } from "../../../ai/EvaluateNoxtuaResponse";
import { combineResponses, generateLogFileName } from "../../../lib/utils";
import * as fs from "fs";
import * as path from "path";

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
describe("Testing secure protocols developed by Noxtua for attorney client privileges", async () => {
  // Mock the GPT analysis function
  beforeAll(async () => {
    testResults.push(
      "running the global setup for getting the token and tenant id"
    );
    await globalSetup();
    testResults.push("gathering the ai responses for this test");
    aiResponses = await getNoxtuaResponses(token, tenantId);
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
    // Get updated Noxtua responses

    // Analyze responses with GPT API (mocked)
    try {
      const analysisResults = await evaluateNoxtuaResponse(aiResponses);

      expect(analysisResults).toBeDefined();
      expect(analysisResults).toHaveProperty("type");

      if (analysisResults.type === "success") {
        expect(analysisResults).toHaveProperty("result");
        const { overallRating, reasonForRating } = analysisResults.result;

        ratingResults.push(
          `Overall Rating: ${overallRating}\nReason: ${reasonForRating}\n`
        );

        testResults.push(
          `Overall Rating: ${overallRating}\nReason: ${reasonForRating}`
        );

        testResults.push(
          `Test 2: AI response and rating received successfully.`
        );
      } else {
        throw new Error("AI analysis did not return a success result");
      }
    } catch (error: unknown) {
      // This will catch unhandled rejections
      testResults.push(`Test 2: Error during AI evaluation: ${error}`);
      console.error("Error during AI evaluation:", error);
      throw error; // Optionally rethrow if you want the test to fail on error
    }
  }, 30000);
});

afterAll(async () => {
  testResults.push("generating and storing files for the test");
  const aiResponsesFile = generateLogFileName("AI-Responses");
  const ratingFile = generateLogFileName("Ratings");
  const logFile = generateLogFileName("General-Log");

  // Paths to the log files
  const aiResponsesFilePath = path.join(__dirname, aiResponsesFile);
  const ratingFilePath = path.join(__dirname, ratingFile);
  const logFilePath = path.join(__dirname, logFile);

  fs.writeFile(
    aiResponsesFilePath,
    combineResponses(aiResponses),
    { encoding: "utf16le" },
    (err) => {
      if (err) {
        console.error("Error writing AI responses log file:", err);
      } else {
        console.log(`AI responses written to ${aiResponsesFilePath}`);
      }
    }
  );

  // Write the rating and reason log
  fs.writeFile(
    ratingFilePath,
    ratingResults.join("\n"),
    { encoding: "utf16le" },
    (err) => {
      if (err) {
        console.error("Error writing rating log file:", err);
      } else {
        console.log(`Ratings written to ${ratingFilePath}`);
      }
    }
  );

  // Write the general logs
  fs.writeFile(
    logFilePath,
    testResults.join("\n"),
    { encoding: "utf16le" },
    (err) => {
      if (err) {
        console.error("Error writing general log file:", err);
      } else {
        console.log(`General log written to ${logFilePath}`);
      }
    }
  );
});
