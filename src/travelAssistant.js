import { firebaseFunctions } from "./firebase.js";

/** Must stay in sync with ASSISTANT_LIMITS.maxQuestionChars in functions/index.js. */
export const ASSISTANT_QUESTION_LIMIT = 500;

export const ASSISTANT_SUGGESTIONS = [
  "Which trip suits a first-time visitor to Himachal?",
  "How much does the Shimla Hill Escape cost?",
  "What is included in the Spiti slow road trip?",
  "What should I know about travelling in December?",
];

/** Turns a callable-function error into something a visitor can act on. */
export function assistantErrorMessage(error) {
  const byCode = {
    "functions/invalid-argument": error?.message || "Please check your question and try again.",
    "functions/failed-precondition":
      error?.message || "The travel assistant is not available right now. Please use the contact form.",
    "functions/internal": "The travel assistant could not answer just now. Please try again in a moment.",
    "functions/unauthenticated": "Please sign in to use the travel assistant.",
    "functions/unavailable": "The travel assistant is offline. Please try again shortly.",
    "functions/deadline-exceeded": "That took too long to answer. Please try again.",
  };
  return byCode[error?.code] || "Something went wrong. Please try again, or use the contact form.";
}

/**
 * Asks the grounded travel assistant a question.
 * Returns { answer, sources: [{ kind, label, url }] }.
 * Throws a Firebase functions error on failure.
 */
export async function askTravelAssistant(question, history = []) {
  if (!firebaseFunctions) {
    throw new Error("The travel assistant is not configured for this build.");
  }

  const { httpsCallable } = await import("firebase/functions");
  const ask = httpsCallable(firebaseFunctions, "askTravelAssistant");
  const result = await ask({
    question: String(question ?? "").trim(),
    history: (Array.isArray(history) ? history : [])
      .slice(-12)
      .map((entry) => ({ role: entry?.role === "assistant" ? "assistant" : "user", text: String(entry?.text ?? "") }))
      .filter((entry) => entry.text.length > 0),
  });

  const data = result?.data ?? {};
  return {
    answer: String(data.answer ?? "").trim(),
    sources: Array.isArray(data.sources) ? data.sources : [],
  };
}
