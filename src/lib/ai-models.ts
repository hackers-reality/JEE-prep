export type AIModel = {
  id: string;
  name: string;
  provider: "nvidia";
  strengths: string[];
  status: "available";
};

export const AI_MODELS: AIModel[] = [
  { id: "nvidia/llama-3.3-nemotron-super-49b-v1", name: "Nemotron Super 49B", provider: "nvidia", strengths: ["balanced", "reasoning", "long-form tutoring"], status: "available" },
  { id: "meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "nvidia", strengths: ["balanced", "fast tutoring"], status: "available" },
  { id: "meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "nvidia", strengths: ["fast", "simple explanations"], status: "available" },
];

export const DEFAULT_AI_MODEL = AI_MODELS[0].id;
export const isAllowedAIModel = (model: string) => AI_MODELS.some((candidate) => candidate.id === model);
