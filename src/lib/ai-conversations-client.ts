export type SavedConversation = { id: string; title: string; topicId?: string | null; model: string; updatedAt?: string };

export async function listSavedConversations(): Promise<SavedConversation[]> {
  const response = await fetch("/api/chat/conversations", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load saved AI conversations.");
  return (await response.json()).conversations ?? [];
}

export async function loadSavedConversation(id: string) {
  const response = await fetch(`/api/chat/conversations/${id}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load this conversation.");
  return response.json();
}
