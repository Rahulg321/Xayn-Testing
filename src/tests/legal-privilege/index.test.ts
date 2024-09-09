import { describe, it, expect, beforeAll, vi } from "vitest";
import * as dotenv from "dotenv";
import { sendToNoxtua } from "../..";
import { globalSetup, tenantId, token } from "../setupTest";

dotenv.config();

// Mock function for sending responses to GPT API for analysis
// const mockAnalyzeResponsesWithGPT = async (responses: any[]) => {
//   return responses.map((response, index) => ({
//     question: response.question,
//     rating: 4 + (index % 2), // Simulate some ratings
//     feedback:
//       index % 2 === 0
//         ? "Well-structured but lengthy."
//         : "More concise but missing key details.",
//   }));
// };

// Queries Noxtua co-pilot for updated answers to various forms of the same question
const getNoxtuaResponses = async (token: string, tenantId: string) => {
  const questions = [
    "What measures does Noxtua take to comply with EU regulations on legal professional privilege?",
    "How does Noxtua guarantee adherence to EU rules regarding legal professional privilege?",
    "In what ways does Noxtua ensure that it meets EU standards for legal professional privilege compliance?",
    "What steps does Noxtua implement to align with EU regulations on legal professional privilege?",
  ];

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
  const questions = [
    "What measures does Noxtua take to comply with EU regulations on legal professional privilege?",
    "How does Noxtua guarantee adherence to EU rules regarding legal professional privilege?",
    "In what ways does Noxtua ensure that it meets EU standards for legal professional privilege compliance?",
    "What steps does Noxtua implement to align with EU regulations on legal professional privilege?",
  ];

  const responses = [];

  for (const question of questions) {
    const answer = await sendToNoxtua(token, tenantId, question);
    responses.push({ question, answer });
  }

  return responses;
};

// Test suite
describe("Noxtua co-pilot responses and GPT analysis", () => {
  // Mock the GPT analysis function
  beforeAll(async () => {
    await globalSetup();
  });

  it("should collect all response from Noxtua co-pilot", async () => {
    const responses = await getNoxtuaResponses(token, tenantId);
    console.log("Responses generated are", responses);
    expect(responses).toBeDefined();
    expect(responses.length).toBeGreaterThan(0);
    expect(responses[0]).toHaveProperty("question");
    expect(responses[0]).toHaveProperty("answer");
  }, 60000);

  //   it("should send updated responses to GPT API for analysis", async () => {
  //     // Get updated Noxtua responses
  //     const responses = await getNoxtuaResponses(token, tenantId);

  //     // Analyze responses with GPT API (mocked)
  //     const analysisResults = await mockAnalyzeResponsesWithGPT(responses);

  //     // Assertions on the GPT analysis results
  //     expect(analysisResults).toBeDefined();
  //     expect(analysisResults.length).toBe(responses.length);
  //     expect(analysisResults[0]).toHaveProperty("rating");
  //     expect(analysisResults[0]).toHaveProperty("feedback");
  //     expect(analysisResults[0].rating).toBeGreaterThanOrEqual(4);
  //   });

  //   it("should handle errors in GPT analysis gracefully", async () => {
  //     // Simulate error during GPT API call
  //     const mockErrorGPT = vi.fn().mockImplementation(async () => {
  //       throw new Error("GPT API failed");
  //     });

  //     try {
  //       await mockErrorGPT();
  //     } catch (error: any) {
  //       expect(error.message).toBe("GPT API failed");
  //     }
  //   });
});
