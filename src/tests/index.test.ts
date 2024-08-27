import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import * as dotenv from "dotenv";
import { main, sendToNoxtua, getAccessToken } from "../index";

dotenv.config();

let token: string;
let tenantId: string;

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

  it("should send a message to Noxtua and receive a response", async () => {
    const message = "What is your name, and can you please count to 10";
    const response = await sendToNoxtua(token, tenantId, message);

    expect(response).toBeDefined();
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
  });

  it("should throw an error when environment variables are missing", async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, TENANT_ID: undefined };

    await expect(main()).rejects.toThrow("Missing environment variables");

    process.env = originalEnv;
  });
});

afterAll(() => {
  // Clean up any resources if needed
});
