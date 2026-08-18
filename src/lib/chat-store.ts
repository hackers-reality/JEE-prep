import { AI_MODELS, DEFAULT_AI_MODEL } from "./ai-models";

const KEYS = { API_KEY: "jee-prep-nvidia-api-key", MODEL: "jee-prep-ai-model", CHAT_PREFIX: "jee-prep-chat-" };
export const AVAILABLE_MODELS = AI_MODELS;

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEYS.API_KEY) || "";
}

export function setApiKey(key: string) {
  if (typeof window === "undefined") return;
  const value = key.trim();
  if (value) localStorage.setItem(KEYS.API_KEY, value);
  else localStorage.removeItem(KEYS.API_KEY);
}

export function getSelectedModel(): string {
  if (typeof window === "undefined") return DEFAULT_AI_MODEL;
  const stored = localStorage.getItem(KEYS.MODEL);
  return AI_MODELS.some((model) => model.id === stored) ? stored! : DEFAULT_AI_MODEL;
}

export function setSelectedModel(model: string) {
  if (AI_MODELS.some((candidate) => candidate.id === model)) localStorage.setItem(KEYS.MODEL, model);
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function getChatHistory(topicId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(`${KEYS.CHAT_PREFIX}${topicId}`);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveChatMessage(topicId: string, message: ChatMessage) {
  const history = getChatHistory(topicId);
  history.push(message);
  localStorage.setItem(`${KEYS.CHAT_PREFIX}${topicId}`, JSON.stringify(history.slice(-60)));
}

export function clearChatHistory(topicId: string) {
  if (typeof window !== "undefined") localStorage.removeItem(`${KEYS.CHAT_PREFIX}${topicId}`);
}
