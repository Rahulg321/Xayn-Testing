import mongoose, { Schema } from "mongoose";

// Define the TestLog schema
const TestLogSchema: Schema = new Schema({
  uniqueTestId: {
    type: String,
    required: true,
    unique: true, // Ensure uniqueness
  },
  aiResponses: {
    type: String, // Store the combined AI responses as a string
    required: true,
  },
  testResults: {
    type: String, // Store the test results as a string
    required: true,
  },
  ratingResults: {
    type: String, // Store the rating results as a string
    required: true,
  },
  testDir: {
    type: String, // Directory of the test
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TestLog = mongoose.model("TestLog", TestLogSchema);

export default TestLog;
