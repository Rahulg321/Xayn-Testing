import { generateText } from "ai";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import {
  llamaGenerateResponse,
  openaiGenerateResponse,
} from "./ai/generateText";
import { evaluateNoxtuaResponse } from "./ai/EvaluateNoxtuaResponse";
import * as mongoose from "mongoose";
import { LegalCopilot, TestResult } from "./lib/schemas";
import User from "./lib/schemas/User";

// Load environment variables from .env file
dotenv.config();

// async function addTestResultToCopilot(
//   copilotName: string,
//   newTestResultData: any
// ) {
//   // First, find the copilot by name
//   const copilot = await LegalCopilot.findOne({ name: copilotName });

//   if (!copilot) {
//     console.log(`Copilot ${copilotName} not found`);
//     return;
//   }

//   // Create a new TestResult, with reference to the copilot's _id
//   const testResult = new TestResult({
//     ...newTestResultData,
//     copilot_id: copilot._id, // Reference to the copilot
//   });

//   // Save the test result to the database
//   await testResult.save();
//   console.log(`Test result added to ${copilotName}:`, testResult);
// }

export async function main() {
  try {
    console.log("connecting to mongoose");
    mongoose.set("debug", true);
    mongoose
      .connect(
        `mongodb+srv://${process.env.COSMOSDB_USER}:${process.env.COSMOSDB_PASSWORD}@xayn-testing.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`,
        {
          retryWrites: true,
          dbName: "xayn", // Set the correct database name
        }
      )
      .then(() => {
        console.log("successfully connected to mongoose");
      })
      .catch((e) => {
        console.error("error connecting to mongoose", e);
      });

    const newUser = new User({
      name: "Surbhi Bhandari",
      email: "bhandari@google.com",
    });

    const savedUser = await newUser.save();
    console.log("successfully saved user", savedUser);
    // const newTestResultData = {
    //   test_id: "5678",
    //   overall_rating: 5,
    //   explanation: "Test passed with excellent results",
    //   tags: ["security", "performance"],
    //   category: "security",
    //   execution_node_id: "node-03",
    //   general_log: "No errors, system functioned as expected.",
    //   ai_log: "AI responded accurately and swiftly",
    //   metadata: { duration: "4m", version: "v2.0.1" },
    // };
    // Add the new test result to the 'Noxtua' copilot
    // addTestResultToCopilot("Noxtua", newTestResultData);
    // const tenantId = process.env.TENANT_ID;
    // const apiId = process.env.CLIENT_ID;
    // const apiSecret = process.env.API_SECRET;
    // console.log("tenantId:", tenantId);
    // console.log("apiId:", apiId);
    // console.log("apiSecret:", apiSecret);
    // if (!tenantId || !apiId || !apiSecret) {
    //   console.error("Missing environment variables");
    //   throw new Error("Missing environment variables");
    // }
    // const token = await getAccessToken(tenantId, apiId, apiSecret);
    // if (!token) {
    //   throw new Error("Token was undefined");
    // }
    // const response = await sendToNoxtua(
    //   token,
    //   tenantId,
    //   "What is your name, and what is your specialization and what do you allow customers to do?"
    // );
    // console.log("Answer ->", response);
    // console.log("current working directory", process.cwd());
    // // src / documents / agreements / ;
    // const documentPath =
    //   "./src/documents/agreements/addendum_2_confidentiality-agreement.pdf"; // replace with your document path
    // const documentName = "addendum_2_confidentiality-agreement.pdf"; // replace with your document name
    // const responseWithDoc = await sendDocumentToNoxtua(
    //   token,
    //   tenantId,
    //   documentPath,
    //   "explain this document",
    //   documentName
    // );
    // console.log("current working directory", process.cwd());
    // Send a document with a request
    // const responseWithDoc = await sendMultipleDocuments(
    //   token,
    //   tenantId,
    //   [
    //     { path: "./src/documents/invoice.pdf", name: "invoice.pdf" },
    //     { path: "./src/documents/hello.txt", name: "hello.txt" },
    //   ],
    //   "can u summarize and compare what is in these two documents"
    // );
    // console.log("Document Response ->", responseWithDoc);
  } catch (error) {
    console.error("an error", error);
  }
}

main();

const REGEX_PATTERN = /event\: (.+)\ndata: (\{.*\})/gm;

export async function sendToNoxtua(
  token: string,
  tenantId: string,
  message: string
) {
  const sessionHeaders = new Headers();

  sessionHeaders.append("tenant-id", tenantId);
  sessionHeaders.append("Authorization", `Bearer ${token}`);

  const requestOptions1: RequestInit = {
    method: "POST",
    headers: sessionHeaders,
    redirect: "follow" as RequestRedirect,
  };

  const resSession = (
    await (
      await fetch("https://app.noxtua.ai/v2/api/chat/sessions", requestOptions1)
    ).json()
  )["session"];

  sessionHeaders.append("Accept", "json/event-stream");
  sessionHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    messages: [
      {
        text: message,
        type: "text",
      },
    ],
  });
  const requestOptions2: RequestInit = {
    method: "POST",
    headers: sessionHeaders,
    body: raw,
    redirect: "follow" as RequestRedirect,
  };
  const resM = await fetch(
    `https://app.noxtua.ai/v2/api/chat/sessions/${resSession}/messages`,
    requestOptions2
  );

  console.log("resM from noxtua text", resM);

  let buffer = "";

  for await (const message of decodeStreamToJson(resM.body)) {
    buffer += message;
  }
  return buffer;
}

export async function sendMultipleDocuments(
  token: string,
  tenantId: string,
  documents: { path: string; name: string }[],
  promptInquiry: string
) {
  try {
    const sessionHeaders = new Headers();

    sessionHeaders.append("tenant-id", tenantId);
    sessionHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions1: RequestInit = {
      method: "POST",
      headers: sessionHeaders,
      redirect: "follow" as RequestRedirect,
    };

    // Create a session with Noxtua
    const resSession = (
      await (
        await fetch(
          "https://app.noxtua.ai/v2/api/chat/sessions",
          requestOptions1
        )
      ).json()
    )["session"];

    sessionHeaders.append("Accept", "json/event-stream");
    sessionHeaders.append("Content-Type", "application/json");

    // Prepare the array of messages to send (multiple documents + text prompt)
    const messages: Array<{
      binary?: string;
      text?: string;
      name?: string;
      type: string;
    }> = [];

    // Loop through documents and add each to the messages array
    for (const document of documents) {
      const fileContent = readFileSync(document.path, { encoding: "base64" });
      messages.push({
        binary: fileContent,
        name: document.name,
        type: "file",
      });
    }

    // Add the prompt inquiry as a message
    messages.push({
      text: promptInquiry,
      type: "text",
    });

    const raw = JSON.stringify({ messages });

    console.log("Request Body:", raw); // Log the request body for debugging

    const requestOptions2: RequestInit = {
      method: "POST",
      headers: sessionHeaders,
      body: raw,
      redirect: "follow" as RequestRedirect,
    };

    // Send the documents and prompt inquiry to Noxtua
    const resM = await fetch(
      `https://app.noxtua.ai/v2/api/chat/sessions/${resSession}/messages`,
      requestOptions2
    );

    let buffer = "";

    // Process the response stream
    for await (const message of decodeStreamToJson(resM.body)) {
      buffer += message;
    }

    return buffer;
  } catch (error: any) {
    console.error(
      "An error occurred while sending documents to Noxtua",
      error,
      error.message
    );
  }
}

export async function sendDocumentToNoxtua(
  token: string,
  tenantId: string,
  documentPath: string,
  promptInquiry: string,
  documentName: string
) {
  try {
    const sessionHeaders = new Headers();

    sessionHeaders.append("tenant-id", tenantId);
    sessionHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions1: RequestInit = {
      method: "POST",
      headers: sessionHeaders,
      redirect: "follow" as RequestRedirect,
    };

    const resSession = (
      await (
        await fetch(
          "https://app.noxtua.ai/v2/api/chat/sessions",
          requestOptions1
        )
      ).json()
    )["session"];

    sessionHeaders.append("Accept", "json/event-stream");
    sessionHeaders.append("Content-Type", "application/json");

    // Read the document and encode it to base64
    const fileContent = readFileSync(documentPath, { encoding: "base64" });

    const raw = JSON.stringify({
      messages: [
        {
          binary: fileContent,
          name: documentName,
          type: "file",
        },
        {
          text: promptInquiry,
          type: "text",
        },
      ],
    });

    console.log("Request Body:", raw); // Log the request body for debugging

    const requestOptions2: RequestInit = {
      method: "POST",
      headers: sessionHeaders,
      body: raw,
      redirect: "follow" as RequestRedirect,
    };

    const resM = await fetch(
      `https://app.noxtua.ai/v2/api/chat/sessions/${resSession}/messages`,
      requestOptions2
    );

    let buffer = "";

    for await (const message of decodeStreamToJson(resM.body)) {
      buffer += message;
    }

    return buffer;
  } catch (error: any) {
    console.error(
      "an error occurred while sending document to noxtua",
      error,
      error.message
    );
  }
}

export async function getAccessToken(
  tenantId: string,
  apiId: string,
  apiSecret: string
) {
  try {
    console.log("getting the access token");
    const tokenHeaders = new Headers();
    tokenHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    const urlencoded = new URLSearchParams();
    urlencoded.append("client_id", apiId);
    urlencoded.append("grant_type", "client_credentials");
    urlencoded.append("client_secret", apiSecret);
    const tokenRequestOptions: RequestInit = {
      method: "POST",
      headers: tokenHeaders,
      body: urlencoded,
      redirect: "follow" as RequestRedirect,
    };
    const res = await fetch(
      `https://app.noxtua.ai/v2/auth/realms/${tenantId}/protocol/openid-connect/token`,
      tokenRequestOptions
    );
    const bodyJson = await res.json();
    const token = bodyJson["access_token"];
    if (!token) {
      console.error(`Did not receive a token: ${res.status}: ${res.statusText} :
${JSON.stringify(bodyJson)}`);
    }
    return token;
  } catch (error) {
    console.error("an error occured while fetching token", error);
  }
}

async function* decodeStreamToJson(data: ReadableStream<Uint8Array> | null) {
  if (!data) return;
  const reader = data.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      try {
        const decodedValue = decoder.decode(value);
        const matches = decodedValue.matchAll(REGEX_PATTERN);
        // we use the index 2 which is the one with the JSON data
        const newChunks = Array.from(matches)
          .map((match) => JSON.parse(match[2]).chunk)
          .filter((chunk) => chunk !== undefined);
        for (const chunk of newChunks) {
          yield chunk;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}

main();
