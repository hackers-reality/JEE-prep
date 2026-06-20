"use client";

import { useState } from "react";
import {
  getApiKey,
  setApiKey,
  getSelectedModel,
  setSelectedModel,
  AVAILABLE_MODELS,
} from "@/lib/chat-store";
import Link from "next/link";

export default function SettingsPage() {
  const [key, setKey] = useState(() => getApiKey());
  const [model, setModel] = useState(() => getSelectedModel());
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setApiKey(key);
    setSelectedModel(model);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <Link
        href="/"
        className="text-sm mb-4 inline-block hover:underline"
        style={{ color: "var(--ink)" }}
      >
        ← Back to Home
      </Link>
      <h1
        className="font-hand text-3xl font-bold mb-6"
        style={{ color: "var(--ink)" }}
      >
        Settings
      </h1>

      <div
        className="rounded-lg p-6 shadow-md space-y-6"
        style={{
          backgroundColor: "var(--sticky-yellow)",
          borderRadius: "6px 10px 8px 12px",
        }}
      >
        <div>
          <label className="block font-hand text-lg font-bold mb-2">
            NVIDIA NIM API Key
          </label>
          <p className="text-xs mb-2 opacity-70">
            Your key is stored in your browser (localStorage). When you send a
            chat message, the key is sent to your own server in-memory only,
            forwarded to NVIDIA NIM, and discarded — never written to disk,
            database, or logs.
          </p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your NVIDIA NIM API key"
            className="w-full px-3 py-2 text-sm rounded border"
            style={{
              borderColor: "var(--grid-line)",
              backgroundColor: "white",
              color: "var(--ink)",
            }}
          />
        </div>

        <div>
          <label className="block font-hand text-lg font-bold mb-2">
            Model
          </label>
          <p className="text-xs mb-2 opacity-70">
            Select which NVIDIA NIM hosted model to use for the chatbot.
          </p>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded border"
            style={{
              borderColor: "var(--grid-line)",
              backgroundColor: "white",
              color: "var(--ink)",
            }}
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 text-sm font-bold rounded-lg transition-all hover:shadow-md"
          style={{
            backgroundColor: saved ? "var(--sticky-green)" : "var(--sticky-blue)",
            color: "var(--ink)",
          }}
        >
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </main>
  );
}
