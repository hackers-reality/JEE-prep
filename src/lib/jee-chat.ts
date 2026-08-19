import { JEE_TUTOR_SYSTEM_PROMPT } from "./jee-tutor-prompt";

export function buildJeeSystemPrompt(context?: string) {
  const supplied = context?.trim();
  if (!supplied) return JEE_TUTOR_SYSTEM_PROMPT;
  return `${JEE_TUTOR_SYSTEM_PROMPT}\n\nCURRENT PLATFORM CONTEXT\n${supplied}\n\nUse the supplied context as the authoritative local context for this turn. Do not claim access to anything beyond it.`;
}
