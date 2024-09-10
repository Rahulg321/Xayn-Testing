import { generateText } from "ai";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { llamaGenerateResponse } from "./ai/generateText";
import { evaluateNoxtuaResponse } from "./ai/EvaluateNoxtuaResponse";

// Load environment variables from .env file
dotenv.config();

export async function main() {
  console.log("running the main function for llama3.1");

  const response = await evaluateNoxtuaResponse();
  console.log("response from llama is->", response);
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
  // console.log("received token was", token);

  // if (!token) {
  //   throw new Error("Token was undefined");
  // }

  // const response = await sendToNoxtua(
  //   token,
  //   tenantId,
  //   "What is your name, and what is your specialization and what do you allow customers to do?"
  // );
  // console.log("Answer ->", response);

  const documentPath = "./src/documents/invoice.pdf"; // replace with your document path
  const documentName = "invoice.pdf"; // replace with your document name

  // // Send a document with a request
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
