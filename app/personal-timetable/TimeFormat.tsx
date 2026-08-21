"use client";

import { useEffect } from "react";

function formatOneHour(hour: number, minute: string) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${minute} ${suffix}`;
}

function formatTimeRange(text: string) {
  return text.replace(/\b(0?\d|1\d|2[0-3]):([0-5]\d)\s*[–-]\s*(0?\d|1\d|2[0-3]):([0-5]\d)\b/g, (_match, h1, m1, h2, m2) =>
    `${formatOneHour(Number(h1), m1)}–${formatOneHour(Number(h2), m2)}`,
  ).replace(/\b(0?\d|1\d|2[0-3]):([0-5]\d)\b/g, (_match, h, m) => formatOneHour(Number(h), m));
}

function normalizeTextNodes(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node as Text;
    if (text.parentElement?.closest("script,style,textarea,input,[contenteditable='true']")) continue;
    if (/\b(?:0?\d|1\d|2[0-3]):[0-5]\d\b/.test(text.nodeValue ?? "")) nodes.push(text);
  }
  for (const text of nodes) {
    const current = text.nodeValue ?? "";
    const next = formatTimeRange(current);
    if (next !== current) text.nodeValue = next;
  }
}

export default function TimeFormat() {
  useEffect(() => {
    normalizeTextNodes(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType === Node.TEXT_NODE) normalizeTextNodes(node);
          else if (node.nodeType === Node.ELEMENT_NODE) normalizeTextNodes(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
