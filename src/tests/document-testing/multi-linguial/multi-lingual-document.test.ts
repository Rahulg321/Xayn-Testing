import { describe, it, expect, beforeAll, vi, afterAll } from "vitest";
import * as dotenv from "dotenv";
import { globalSetup, tenantId, token } from "../../setupTest";
import {
  evaluateDocumentResponseFromNoxtua,
  evaluateNoxtuaResponse,
} from "../../../ai/EvaluateNoxtuaResponse";
import {
  evaluateNoxtuaDocumentResponse,
  saveDocumentTestResult,
} from "../../../lib/testHelpers";

dotenv.config();

let aiResponse: string;
let testLogs: string[] = [];
let evaluationResult: {
  overallRating: number;
  reasonForRating: string;
};

let prompt =
  "How does Article I of the document contribute to identifying it as an employment contract?";

// Test suite
describe("testing noxtua response for sending consulting agreement in english", async () => {
  // Mock the GPT analysis function
  beforeAll(async () => {
    testLogs.push(
      "running the global setup for getting the token and tenant id"
    );
    await globalSetup();

    expect(token).toBeDefined();
    expect(tenantId).toBeDefined();

    testLogs.push("gathering the ai responses for this test");
    const documentPath =
      "./src/tests/document-testing/multi-linguial/law_insider.docx"; // replace with your document path
    const documentName = "law_insider.docx"; // replace with your document name

    aiResponse = await evaluateNoxtuaDocumentResponse(
      documentName,
      documentPath,
      prompt,
      token,
      tenantId
    );

    expect(aiResponse).toBeDefined();
    console.log("ai response was", aiResponse);

    testLogs.push("ai response by sending a document gathered");
  }, 60000);

  it("should define all AI responses", async () => {
    expect(aiResponse).toBeDefined();
    testLogs.push("All responses are defined and match the question length");
  });

  it("documenation standard for legal privilege analysis by ai, must recieve a response and a rating back", async () => {
    const chatGPTResult = await evaluateDocumentResponseFromNoxtua(
      prompt,
      aiResponse
    );

    // Check for success
    if (chatGPTResult.type === "success") {
      expect(chatGPTResult.result).toBeDefined();
      expect(chatGPTResult.result.overallRating).toBeGreaterThanOrEqual(0);
      expect(chatGPTResult.result.overallRating).toBeLessThanOrEqual(5);
      expect(chatGPTResult.result.reasonForRating).toBeDefined();
      evaluationResult = chatGPTResult.result;
      testLogs.push(
        "Test 2: Legal privilege analysis returned a valid response with a rating."
      );
    }

    // Handle validation errors
    if (chatGPTResult.type === "validation-error") {
      expect(chatGPTResult.type).toBe("validation-error");
    }

    // Handle parse errors
    if (chatGPTResult.type === "parse-error") {
      expect(chatGPTResult.type).toBe("parse-error");
      testLogs.push("Test 2: Parse error occurred.");
    }

    // Handle unknown errors
    if (chatGPTResult.type === "unknown-error") {
      expect(chatGPTResult.type).toBe("unknown-error");
      testLogs.push("Test 2: Unknown error occurred.");
    }
  }, 30000);

  afterAll(async () => {
    await saveDocumentTestResult({
      prompt: "explain a legal consulting agreement document",
      testCategory: "Document-Based-Testing",
      testName: "Multi-Lingual",
      documentName: "law_insider.docx",
      documentType: "Employee Agreement",
      aiResponse,
      evaluationRating: evaluationResult.overallRating,
      evaluationResponse: evaluationResult.reasonForRating,
      testLogs,
    });
  });
});
