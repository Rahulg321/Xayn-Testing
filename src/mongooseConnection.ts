// mongooseConnection.ts
import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    console.log("Database already connected.");
    return;
  }

  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.COSMOSDB_USER}:${process.env.COSMOSDB_PASSWORD}@xayn-testing.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`,
      { retryWrites: false, dbName: "xayn" }
    );
    isConnected = true;
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

export default mongoose;
