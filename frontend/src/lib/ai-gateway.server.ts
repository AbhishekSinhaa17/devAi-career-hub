import { serverApiClient } from "./api-client";

export async function callAi(payload: any): Promise<string> {
  const { token, ...body } = payload;
  const { data } = await serverApiClient.post("/ai/copilot/chat", body, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data.text || data.message || data.result || "";
}

export async function callAiJson<T = any>(payload: any): Promise<T> {
  const { token, ...body } = payload;
  const { data } = await serverApiClient.post("/ai/generate-json", body, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data.result || data;
}
