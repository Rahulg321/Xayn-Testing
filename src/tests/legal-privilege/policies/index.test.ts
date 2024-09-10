// import { describe, it, expect, beforeAll, vi } from "vitest";
// import * as dotenv from "dotenv";
// import { sendToNoxtua } from "../../..";
// import { globalSetup, tenantId, token } from "../../setupTest";
// import { NoxtuaResponse } from "../../../lib/types";
// import { evaluateNoxtuaResponse } from "../../../ai/EvaluateNoxtuaResponse";

// dotenv.config();

// let aiResponses: NoxtuaResponse[] = [];

// // Queries Noxtua co-pilot for updated answers to various forms of the same question
// const questions = [
//   "How does Noxtua develop policies for handling drafts to ensure privilege?",
//   "How can we create policies for managing drafts to maintain legal privilege?",
//   "What steps should be taken to establish policies for handling drafts while preserving privilege?",
//   "How do we develop guidelines for dealing with drafts to ensure they remain privileged?",
//   "What measures can be implemented to handle drafts in a way that protects legal privilege?",
// ];

// const getNoxtuaResponses = async (token: string, tenantId: string) => {
//   // Use your sendToNoxtua function to query the Noxtua API
//   const responses = await Promise.all(
//     questions.map(async (question) => {
//       const answer = await sendToNoxtua(token, tenantId, question);
//       return {
//         question,
//         answer,
//       };
//     })
//   );

//   return responses;
// };

// const getNoxtuaResponsesSequentially = async (
//   token: string,
//   tenantId: string
// ) => {
//   const responses = [];

//   for (const question of questions) {
//     const answer = await sendToNoxtua(token, tenantId, question);
//     responses.push({ question, answer });
//   }

//   return responses;
// };

// // Test suite
// describe("Testing the legal privilege policies for Noxtua", async () => {
//   // Mock the GPT analysis function
//   beforeAll(async () => {
//     await globalSetup();
//     aiResponses = await getNoxtuaResponses(token, tenantId);
//   }, 60000);

//   it("all aiResponses for policies in legal privilege must be present and should have a question and answer property", async () => {
//     expect(aiResponses).toBeDefined();
//     expect(aiResponses.length).toBeGreaterThan(0);
//     expect(aiResponses.length).toEqual(questions.length);

//     for (let i = 0; i < questions.length; i++) {
//       expect(aiResponses[i]).toHaveProperty("question");
//       expect(aiResponses[i]).toHaveProperty("answer");
//     }
//   });

//   it("evaluation legal privilege policies from ai and getting a rating and explanation back", async () => {
//     // Get updated Noxtua responses

//     // Analyze responses with GPT API (mocked)
//     try {
//       const analysisResults = await evaluateNoxtuaResponse(aiResponses);

//       expect(analysisResults).toBeDefined();
//       expect(analysisResults).toHaveProperty("type", "success");
//       expect(analysisResults).toHaveProperty("result");
//     } catch (error) {
//       // This will catch unhandled rejections
//       console.error("Error during AI evaluation:", error);
//       throw error; // Optionally rethrow if you want the test to fail on error
//     }
//   }, 30000);
// });
