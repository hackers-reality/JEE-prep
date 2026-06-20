"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0" style={{ color: "var(--ink)" }}>{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2 last:mb-0 text-sm">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 last:mb-0 text-sm">{children}</ol>,
  li: ({ children }) => <li style={{ color: "var(--ink)" }}>{children}</li>,
  strong: ({ children }) => <strong className="font-bold" style={{ color: "var(--ink)" }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: "var(--ink)" }}>{children}</em>,
  code: ({ children }) => <code className="text-sm font-mono px-1 py-0.5 rounded" style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "var(--ink)" }}>{children}</code>,
  pre: ({ children }) => <pre className="text-sm font-mono p-3 rounded mb-2 overflow-x-auto" style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "var(--ink)" }}>{children}</pre>,
  h1: ({ children }) => <h1 className="font-hand text-xl font-bold mb-2" style={{ color: "var(--ink)" }}>{children}</h1>,
  h2: ({ children }) => <h2 className="font-hand text-lg font-bold mb-2" style={{ color: "var(--ink)" }}>{children}</h2>,
  h3: ({ children }) => <h3 className="font-hand text-base font-bold mb-1" style={{ color: "var(--ink)" }}>{children}</h3>,
  blockquote: ({ children }) => <blockquote className="border-l-2 pl-3 my-2 text-sm italic opacity-80" style={{ borderColor: "var(--grid-line)", color: "var(--ink)" }}>{children}</blockquote>,
  a: ({ children, href }) => <a href={href} className="underline hover:opacity-80" style={{ color: "var(--accent-red)" }} target="_blank" rel="noopener">{children}</a>,
  hr: () => <hr className="my-3" style={{ borderColor: "var(--grid-line)" }} />,
};

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
