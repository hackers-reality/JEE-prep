export type AIModelCapability = "reasoning" | "vision" | "tool_use" | "long_context";

export type AIModel = {
  id: string;
  name: string;
  provider: "nvidia";
  strengths: string[];
  capabilities: AIModelCapability[];
  status: "available";
};

export const AI_MODELS: AIModel[] = [
  { id: "nvidia/nemotron-3.5-lightning-30b-a3b", name: "Nemotron 3.5 Lightning 30B", provider: "nvidia", strengths: ["fast reasoning", "JEE problem solving", "general tutoring"], capabilities: ["reasoning", "long_context"], status: "available" },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", name: "Nemotron 3 Nano Omni 30B", provider: "nvidia", strengths: ["multimodal tutoring", "image questions", "reasoning"], capabilities: ["reasoning", "vision", "long_context"], status: "available" },
  { id: "thinkingmachines/inkling", name: "Inkling", provider: "nvidia", strengths: ["multimodal reasoning", "image questions", "tool use"], capabilities: ["reasoning", "vision", "tool_use", "long_context"], status: "available" },
  { id: "moonshotai/kimi-k2.6", name: "Kimi K2.6", provider: "nvidia", strengths: ["multimodal reasoning", "image/video understanding", "agentic tasks"], capabilities: ["reasoning", "vision", "tool_use", "long_context"], status: "available" },
  { id: "minimaxai/minimax-m3", name: "MiniMax M3", provider: "nvidia", strengths: ["multimodal reasoning", "coding", "tool calling"], capabilities: ["reasoning", "vision", "tool_use", "long_context"], status: "available" },
  { id: "stepfun-ai/step-3.7-flash", name: "Step 3.7 Flash", provider: "nvidia", strengths: ["fast multimodal reasoning", "coding", "agents"], capabilities: ["reasoning", "vision", "tool_use"], status: "available" },
  { id: "meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "nvidia", strengths: ["balanced", "fast tutoring"], capabilities: [], status: "available" },
  { id: "meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "nvidia", strengths: ["very fast", "simple explanations"], capabilities: [], status: "available" },
];

export const DEFAULT_AI_MODEL = AI_MODELS[0].id;
export const isAllowedAIModel = (model: string) => AI_MODELS.some((candidate) => candidate.id === model);
export const getAIModel = (model: string) => AI_MODELS.find((candidate) => candidate.id === model) ?? null;
export const modelSupports = (model: string, capability: AIModelCapability) => Boolean(getAIModel(model)?.capabilities.includes(capability));
