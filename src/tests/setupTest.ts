// setupTests.ts
import * as dotenv from "dotenv";
import { getAccessToken } from "../index";

dotenv.config();

export let token: string;
export let tenantId: string;

export async function globalSetup() {
  tenantId = process.env.TENANT_ID!;
  const apiId = process.env.CLIENT_ID!;
  const apiSecret = process.env.API_SECRET!;
  token = await getAccessToken(tenantId, apiId, apiSecret);
}
