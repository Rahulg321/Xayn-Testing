import mongoose from "mongoose";

// Define the TestResult Schema
const testResultSchema = new mongoose.Schema({
  test_id: {
    type: String,
    required: true,
  },
  overall_rating: {
    type: Number,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  tags: {
    type: [String], // Array of tags
  },
  category: {
    type: String,
    required: true,
  },
  execution_node_id: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now, // Automatically set the date
  },
  general_log: {
    type: String, // Logs as a string, you can also adjust this if it needs to be a more structured type
  },
  ai_log: {
    type: String, // AI log details
  },
  metadata: {
    type: Map,
    of: String, // Key-value metadata
  },
  copilot_id: { type: mongoose.Schema.Types.ObjectId, ref: "LegalCopilot" },
});

// Define the LegalCopilot Schema
const legalCopilotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

// Create models for LegalCopilot and TestResult
const LegalCopilot = mongoose.model("LegalCopilot", legalCopilotSchema);
const TestResult = mongoose.model("TestResult", testResultSchema);

export { LegalCopilot, TestResult };
