"use client";

import { FormEvent, useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  body: string;
  category: string;
  subject: string | null;
  isResolved: boolean;
  createdAt: string;
  student: { id: string; name: string | null };
  topic: { id: string; title: string } | null;
  voteCount: number;
  commentCount: number;
  bookmarkCount: number;
};

const tabs = ["ALL", "ANNOUNCEMENTS", "GENERAL", "PHYSICS", "CHEMISTRY", "MATHEMATICS"];

export default function DiscussionsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (tab !== "ALL" && tab !== "ANNOUNCEMENTS") params.set("category", tab);
    if (query.trim()) params.set("q", query.trim());
    const response = await fetch(`/api/discussions?${params.toString()}`, { cache: "no-store" });
    if (response.ok) setPosts(await response.json());
    else if (response.status === 401) setMessage("Sign in to join the discussion.");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function submitPost(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/discussions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, subject: subject || null, category: subject || "GENERAL" }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(data.error ?? "Couldn't publish that post.");
    else {
      setTitle("");
      setBody("");
      setSubject("");
      setMessage("Posted. Your question is now in the community.");
      await load();
    }
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#0b0d10] text-white">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">JEE Prep Community</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Discussions</h1>
            <p className="mt-1 text-sm text-zinc-400">Ask. Attempt. Explain. Get better.</p>
          </div>
          <a href="/" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10">Dashboard</a>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {tabs.map((item) => (
                <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition ${tab === item ? "bg-emerald-500 text-black" : "bg-white/5 text-zinc-400 hover:bg-white/10"}`}>
                  {item === "ALL" ? "All" : item.charAt(0) + item.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="mb-4 flex gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search discussions…" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500/50" />
              <button onClick={load} className="rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-zinc-300 hover:bg-white/10">Search</button>
            </div>

            <div className="space-y-3">
              {posts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-zinc-500">No discussions yet. Be the first to ask a good JEE question.</div>
              ) : posts.map((post) => (
                <article key={post.id} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/15 hover:bg-white/[0.05] sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                        <span className="font-semibold text-zinc-300">{post.student.name || "Student"}</span>
                        <span>•</span><span>{new Date(post.createdAt).toLocaleString()}</span>
                        {post.subject && <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-semibold text-emerald-300">{post.subject}</span>}
                        {post.isResolved && <span className="rounded-full bg-blue-500/10 px-2 py-1 font-semibold text-blue-300">Solved</span>}
                      </div>
                      <h2 className="text-base font-semibold leading-snug sm:text-lg">{post.title}</h2>
                      {post.topic && <p className="mt-1 text-xs text-zinc-500">Topic · {post.topic.title}</p>}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{post.body}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                    <span>▲ {post.voteCount}</span><span>💬 {post.commentCount}</span><span>🔖 {post.bookmarkCount}</span>
                    <a href={`/discussions/${post.id}`} className="ml-auto font-semibold text-zinc-300 hover:text-emerald-300">Open discussion →</a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.035] p-5 lg:sticky lg:top-5">
            <div className="mb-4">
              <h2 className="font-semibold">Ask the community</h2>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Post a real doubt or your own solution. Keep it useful for other JEE students too.</p>
            </div>
            <form onSubmit={submitPost} className="space-y-3">
              <input required minLength={4} maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's your question?" className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500/50" />
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-zinc-300 outline-none focus:border-emerald-500/50">
                <option value="">General</option><option value="PHYSICS">Physics</option><option value="CHEMISTRY">Chemistry</option><option value="MATHEMATICS">Mathematics</option>
              </select>
              <textarea required minLength={2} maxLength={10000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Show your attempt or explain where you're stuck…" rows={6} className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm leading-5 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50" />
              <button disabled={busy} className="w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Publishing…" : "Post discussion"}</button>
            </form>
            {message && <p className="mt-3 text-xs text-zinc-400">{message}</p>}
          </aside>
        </div>
      </div>
    </main>
  );
}
