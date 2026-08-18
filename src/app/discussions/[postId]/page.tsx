"use client";

import { FormEvent, useEffect, useState } from "react";

export default function DiscussionDetail({ params }: { params: Promise<{ postId: string }> }) {
  const [postId, setPostId] = useState("");
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ postId: id }) => setPostId(id));
  }, [params]);

  async function load(id = postId) {
    if (!id) return;
    const [postResponse, commentsResponse] = await Promise.all([
      fetch(`/api/discussions/${id}`, { cache: "no-store" }),
      fetch(`/api/discussions/${id}/comments`, { cache: "no-store" }),
    ]);
    if (!postResponse.ok) { setError("Discussion not found or you are not signed in."); return; }
    setPost(await postResponse.json());
    if (commentsResponse.ok) setComments(await commentsResponse.json());
  }

  useEffect(() => { if (postId) load(postId); }, [postId]);

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/discussions/${postId}/comments`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error ?? "Couldn't add comment."); return; }
    setBody(""); setError(""); await load(postId);
  }

  if (error) return <main className="min-h-screen bg-[#0b0d10] p-6 text-white"><div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center"><p className="text-zinc-400">{error}</p><a href="/discussions" className="mt-4 inline-block text-sm font-semibold text-emerald-300">← Back to discussions</a></div></main>;
  if (!post) return <main className="min-h-screen bg-[#0b0d10] p-6 text-zinc-400">Loading discussion…</main>;

  return (
    <main className="min-h-screen bg-[#0b0d10] text-white">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <a href="/discussions" className="text-sm text-zinc-500 hover:text-emerald-300">← Discussions</a>
        <article className="mt-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500"><span className="font-semibold text-zinc-300">{post.student.name || "Student"}</span><span>•</span><span>{new Date(post.createdAt).toLocaleString()}</span>{post.subject && <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300">{post.subject}</span>}</div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">{post.title}</h1>
          {post.topic && <p className="mt-1 text-xs text-zinc-500">Topic · {post.topic.title}</p>}
          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{post.body}</p>
          <div className="mt-6 flex gap-4 border-t border-white/10 pt-4 text-xs text-zinc-500"><span>▲ {post.voteCount}</span><span>💬 {post.commentCount}</span><span>🔖 {post.bookmarkCount}</span></div>
        </article>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.025] p-5">
          <h2 className="font-semibold">Solutions & discussion</h2>
          <div className="mt-4 space-y-3">
            {comments.length === 0 ? <p className="rounded-2xl bg-white/[0.03] p-4 text-sm text-zinc-500">No answers yet. Be the first person to attempt it.</p> : comments.map((comment) => <div key={comment.id} className="rounded-2xl bg-white/[0.035] p-4"><div className="text-xs font-semibold text-zinc-400">{comment.student.name || "Student"}{comment.isBest && <span className="ml-2 text-emerald-300">✓ Best answer</span>}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{comment.body}</p></div>)}
          </div>
          <form onSubmit={submitComment} className="mt-5 flex gap-2"><textarea required minLength={2} maxLength={10000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Post your approach or correction…" rows={3} className="min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500/50" /><button className="self-end rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-bold text-black">Reply</button></form>
        </section>
      </div>
    </main>
  );
}
