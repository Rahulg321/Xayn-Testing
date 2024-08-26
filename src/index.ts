async function main() {
  const tenantId = process.env.TENANT_ID;
  const apiId = process.env.CLIENT_ID;
  const apiSecret = process.env.API_SECRET;
  const token = await getAccessToken(tenantId, apiId, apiSecret);
  const response = await sendToNoxtua(
    token,
    tenantId,
    "What is your name, and can you please count to 10"
  );
  console.log(response);
}

main();

const REGEX_PATTERN = /event\: (.+)\ndata: (\{.*\})/gm;

async function sendToNoxtua(token: string, tenantId: string, message: string) {
  const sessionHeaders = new Headers();

  sessionHeaders.append("tenant-id", tenantId);
  sessionHeaders.append("Authorization", `Bearer ${token}`);
  console.log(`Token: ${token}`);

  const requestOptions1 = {
    method: "POST",
    headers: sessionHeaders,
    redirect: "follow",
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
  const requestOptions2 = {
    method: "POST",
    headers: sessionHeaders,
    body: raw,
    redirect: "follow",
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

async function getAccessToken(
  tenantId: string,
  apiId: string,
  apiSecret: string
) {
  const tokenHeaders = new Headers();
  tokenHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  const urlencoded = new URLSearchParams();
  urlencoded.append("client_id", apiId);
  urlencoded.append("grant_type", "client_credentials");
  urlencoded.append("client_secret", apiSecret);
  const tokenRequestOptions = {
    method: "POST",
    headers: tokenHeaders,
    body: urlencoded,
    redirect: "follow",
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
}

async function* decodeStreamToJson(data: any) {
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
