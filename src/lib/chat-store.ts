const KEYS = {
  MODEL: "jee-prep-nvidia-model",
  CHAT_PREFIX: "jee-prep-chat-",
};

export const AVAILABLE_MODELS = [
  { id: "nvidia/llama-3.3-nemotron-super-49b-v1", name: "Nemotron Super 49B", tier: "balanced" },
  { id: "meta/llama-3.1-405b-instruct", name: "Llama 3.1 405B", tier: "deep" },
  { id: "meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B", tier: "fast" },
  { id: "meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B", tier: "quick" },
  { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B", tier: "quick" },
  { id: "deepseek-ai/deepseek-r1", name: "DeepSeek R1", tier: "reasoning" },
] as const;

export function getApiKey(): string {
  return "";
}

export function setApiKey(_key: string) {
  // Provider credentials must remain server-side. Kept as a no-op for
  // backwards compatibility with the settings UI until that UI is migrated.
}

export function getSelectedModel(): string {
  if (typeof window === "undefined") return AVAILABLE_MODELS[0].id;
  const stored = localStorage.getItem(KEYS.MODEL);
  return AVAILABLE_MODELS.some((model) => model.id === stored) ? stored! : AVAILABLE_MODELS[0].id;
}

export function setSelectedModel(model: string) {
  if (AVAILABLE_MODELS.some((item) => item.id === model)) localStorage.setItem(KEYS.MODEL, model);
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
  localStorage.removeItem(`${KEYS.CHAT_PREFIX}${topicId}`);
}
