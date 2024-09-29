import mongoose, { Schema, Document } from "mongoose";

// Define the TestResult schema
const DocumentTestResultSchema: Schema = new Schema({
  uniqueTestId: {
    type: String,
    required: true,
    unique: true, // Ensure uniqueness
  },
  prompt: {
    type: String,
    required: true,
  },
  document: {
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g., "consulting agreement"
  },
  aiResponse: {
    type: String,
    required: true,
  },
  evaluationResult: {
    rating: { type: Number, required: true },
    response: { type: String, required: true },
  },
  logs: [String], // Array to store the logs during the test execution
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a TestResult model
const DocumentTestResult = mongoose.model(
  "DocumentTestResult",
  DocumentTestResultSchema
);

export default DocumentTestResult;
