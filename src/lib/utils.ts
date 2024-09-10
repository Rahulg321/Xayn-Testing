import { NoxtuaResponse } from "./types";

export function summarizeReasons(reasons: string[]): string {
  return reasons.join("; "); // Simple concatenation. Can be enhanced to generate a more concise summary.
}

export function combineResponses(aiResponses: NoxtuaResponse[]): string {
  return aiResponses
    .map(
      (response) => `Question: ${response.question}\nAnswer: ${response.answer}`
    )
    .join("\n\n"); // Joining with double newlines for readability
}

export const generateLogFileName = (name: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${date}-${hours}-${minutes}-${seconds}-${name}.txt`;
};
