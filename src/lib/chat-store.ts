const KEYS = {
  API_KEY: "jee-prep-nvidia-key",
  MODEL: "jee-prep-nvidia-model",
  CHAT_PREFIX: "jee-prep-chat-",
};

export const AVAILABLE_MODELS = [
  { id: "nvidia/llama-3.3-nemotron-super-49b-v1", name: "Llama 3.3 Nemotron Super 49B" },
  { id: "meta/llama-3.1-405b-instruct", name: "Llama 3.1 405B Instruct" },
  { id: "meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B Instruct" },
  { id: "meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B Instruct" },
  { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B Instruct" },
  { id: "deepseek-ai/deepseek-r1", name: "DeepSeek R1" },
];

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEYS.API_KEY) ?? "";
}

export function setApiKey(key: string) {
  localStorage.setItem(KEYS.API_KEY, key);
}

export function getSelectedModel(): string {
  if (typeof window === "undefined") return AVAILABLE_MODELS[0].id;
  return localStorage.getItem(KEYS.MODEL) ?? AVAILABLE_MODELS[0].id;
}

export function setSelectedModel(model: string) {
  localStorage.setItem(KEYS.MODEL, model);
}

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function getChatHistory(topicId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(`${KEYS.CHAT_PREFIX}${topicId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveChatMessage(topicId: string, message: ChatMessage) {
  const history = getChatHistory(topicId);
  history.push(message);
  localStorage.setItem(`${KEYS.CHAT_PREFIX}${topicId}`, JSON.stringify(history));
}

export function clearChatHistory(topicId: string) {
  localStorage.removeItem(`${KEYS.CHAT_PREFIX}${topicId}`);
}
