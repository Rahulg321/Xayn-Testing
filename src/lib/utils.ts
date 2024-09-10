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
