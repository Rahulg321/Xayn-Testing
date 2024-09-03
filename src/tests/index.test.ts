import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import * as dotenv from "dotenv";
import { main, sendToNoxtua, getAccessToken } from "../index";

dotenv.config();

let token: string;
let tenantId: string;

// runs once before each test case
beforeAll(async () => {
  tenantId = process.env.TENANT_ID!;
  const apiId = process.env.CLIENT_ID!;
  const apiSecret = process.env.API_SECRET!;
  token = await getAccessToken(tenantId, apiId, apiSecret);
});

describe("Noxtua API", () => {
  it("should get an access token", async () => {
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  it("should send a message to Noxtua and receive a response within a reasonable time", async () => {
    const message = "What is your name, and can you please count to 10";
    const startTime = Date.now();
    const response = await sendToNoxtua(token, tenantId, message);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response).toBeDefined();
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
    expect(responseTime).toBeLessThan(10000); // Assuming 10 seconds is a reasonable maximum time
    console.log(`Response time: ${responseTime}ms`);
  });

  it("should throw an error when environment variables are missing", async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, TENANT_ID: undefined };

    await expect(main()).rejects.toThrow("Missing environment variables");

    process.env = originalEnv;
  });
});

describe("Noxtua API Load Test", () => {
  it("should handle multiple requests simultaneously", async () => {
    const numberOfRequests = 100; // Set the number of requests for load testing
    const message = "Load testing request";

    // Send multiple requests simultaneously
    const promises = Array.from({ length: numberOfRequests }, () =>
      sendToNoxtua(token, tenantId, message)
    );

    const results = await Promise.all(promises);

    results.forEach((response) => {
      expect(response).toBeDefined();
      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
    });

    console.log(
      `Successfully handled ${numberOfRequests} simultaneous requests.`
    );
  }, 30000); // Add timeout of 30 seconds for this specific test
});

afterAll(() => {
  // Clean up any resources if needed
});
