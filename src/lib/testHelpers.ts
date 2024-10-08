import * as fs from "fs";
import * as path from "path";
import { NoxtuaResponse } from "./types";
import { sendDocumentToNoxtua, sendMultipleDocuments, sendToNoxtua } from "..";
import { evaluateNoxtuaResponse } from "../ai/EvaluateNoxtuaResponse";
import { combineResponses, generateLogFileName } from "./utils";
import DocumentTestResult from "./schemas/DocumentTestResult";
import { connectToDatabase } from "../mongooseConnection";
import { v4 as uuidv4 } from "uuid"; // For generating random numbers/UUIDs
import TestLog from "./schemas/TestLog";

// Helper function to evaluate and log the AI response by sending a document as a response
export const evaluateNoxtuaDocumentResponse = async (
  documentName: string,
  documentPath: string,
  promptInquiry: string,
  token: string,
  tenantId: string
): Promise<string> => {
  const response = await sendDocumentToNoxtua(
    token,
    tenantId,
    documentPath,
    promptInquiry,
    documentName
  );

  if (!response) {
    return "Error";
  }

  return response;
};

export const evaluateMultipleNoxtuaDocumentResponse = async (
  documents: { path: string; name: string }[], // Update to accept an array of documents
  promptInquiry: string,
  token: string,
  tenantId: string
): Promise<string> => {
  // Call sendMultipleDocuments with the updated documents parameter
  const response = await sendMultipleDocuments(
    token,
    tenantId,
    documents, // Pass the documents array
    promptInquiry
  );

  if (!response) {
    return "Error";
  }

  return response;
};

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
      testResults.push(`AI analysis did not return a success result`);
      throw new Error("AI analysis did not return a success result");
    }
  } catch (error: unknown) {
    testResults.push(`Test 2: Error during AI evaluation: ${error}`);
    throw error;
  }
};

function generateUniqueTestId(category: string, testName: string): string {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, ""); // Generate a timestamp in 'YYYYMMDDHHMMSS' format
  const randomNumber = uuidv4().split("-")[0]; // Short UUID
  return `${category}_${testName}_${timestamp}_${randomNumber}`;
}

// Reusable function to save test results
export async function saveDocumentTestResult({
  prompt,
  testCategory,
  testName,
  documentName,
  documentType,
  aiResponse,
  evaluationRating,
  evaluationResponse,
  testLogs,
}: {
  prompt: string;
  testCategory: string;
  testName: string;
  documentName: string;
  documentType: string;
  aiResponse: string;
  evaluationRating?: number;
  evaluationResponse?: string;
  testLogs: string[];
}) {
  try {
    await connectToDatabase();
    // Create a new test result object
    const newTestResult = new DocumentTestResult({
      uniqueTestId: generateUniqueTestId(testCategory, testName),
      prompt: prompt,
      document: {
        name: documentName,
        type: documentType,
      },
      aiResponse: aiResponse,
      evaluationResult: {
        rating: evaluationRating ? evaluationRating : 0,
        response: evaluationResponse
          ? evaluationResponse
          : "Value not provided by the test",
      },
      logs: testLogs,
    });

    // Save the test result to the database
    const savedTestResult = await newTestResult.save();
    console.log("Test result saved successfully:", savedTestResult);

    return savedTestResult;
  } catch (error) {
    console.error("Error saving test result to the database:", error);
    throw error;
  }
}

// Helper function to write logs
export const writeLogs = async (
  aiResponses: NoxtuaResponse[],
  testResults: string[],
  ratingResults: string[],
  testDir: string
) => {
  try {
    // Connect to the database if not already connected
    await connectToDatabase();

    // Combine aiResponses, testResults, and ratingResults into strings
    const combinedAiResponses = combineResponses(aiResponses);
    const combinedTestResults = testResults.join("\n");
    const combinedRatingResults = ratingResults.join("\n");

    // Create a new TestLog object
    const newTestLog = new TestLog({
      uniqueTestId: generateUniqueTestId("Manual-Testing", testDir),
      aiResponses: combinedAiResponses, // Combine AI responses into a string
      testResults: combinedTestResults, // Combine test results into a string
      ratingResults: combinedRatingResults, // Combine rating results into a string
      testDir, // Directory of the test
    });

    // Save the logs to the database
    const savedLog = await newTestLog.save();
    console.log("Test logs saved successfully:", savedLog);
  } catch (error) {
    console.error("Error saving test logs to the database:", error);
    throw error;
  }
};
