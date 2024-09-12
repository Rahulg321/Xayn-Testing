import * as fs from "fs";
import * as path from "path";
import { NoxtuaResponse } from "./types";
import { sendToNoxtua } from "..";
import { evaluateNoxtuaResponse } from "../ai/EvaluateNoxtuaResponse";
import { combineResponses, generateLogFileName } from "./utils";

// Helper function to get AI responses
export const getNoxtuaResponses = async (
  questions: string[],
  token: string,
  tenantId: string
): Promise<NoxtuaResponse[]> => {
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

// Helper function to evaluate and log the AI response
export const evaluateResponsesAndLog = async (
  aiResponses: NoxtuaResponse[],
  testResults: string[],
  ratingResults: string[]
) => {
  try {
    const analysisResults = await evaluateNoxtuaResponse(aiResponses);

    if (analysisResults.type === "success") {
      const { overallRating, reasonForRating } = analysisResults.result;

      ratingResults.push(
        `Overall Rating: ${overallRating}\nReason: ${reasonForRating}\n`
      );

      testResults.push(
        `Overall Rating: ${overallRating}\nReason: ${reasonForRating}`
      );

      testResults.push(`Test 2: AI response and rating received successfully.`);
    } else {
      throw new Error("AI analysis did not return a success result");
    }
  } catch (error: unknown) {
    testResults.push(`Test 2: Error during AI evaluation: ${error}`);
    throw error;
  }
};

// Helper function to write logs
export const writeLogs = async (
  aiResponses: NoxtuaResponse[],
  testResults: string[],
  ratingResults: string[],
  testDir: string
) => {
  const aiResponsesFile = generateLogFileName("AI-Responses");
  const ratingFile = generateLogFileName("Ratings");
  const logFile = generateLogFileName("General-Log");

  const currentDir = process.cwd();

  const currentPwd = `${currentDir}/src/tests/${testDir}`;

  const aiResponsesFilePath = path.join(currentPwd, aiResponsesFile);
  const ratingFilePath = path.join(currentPwd, ratingFile);
  const logFilePath = path.join(currentPwd, logFile);

  // Write the AI responses
  fs.writeFile(
    aiResponsesFilePath,
    combineResponses(aiResponses),
    { encoding: "utf16le" },
    (err) => {
      if (err) {
        console.error("Error writing AI responses log file:", err);
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
      }
    }
  );
};
