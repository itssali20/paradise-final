"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessage } from "@/actions/member";

type M = { id: string; body: string; senderId: string; createdAt: string };

/** Private chat with optimistic sending and lightweight polling (no realtime service needed). */
export default function Chat({ conversationId, me, initial, blocked }: { conversationId: string; me: string; initial: M[]; blocked: boolean }) {
  const [msgs, setMsgs] = useState<M[]>(initial);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" }); }, [msgs.length]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      const last = msgs[msgs.length - 1]?.createdAt ?? "";
      try {
        const r = await fetch(`/api/messages/${conversationId}?after=${encodeURIComponent(last)}`, { cache: "no-store" });
        if (r.ok) {
          const data: { messages: M[] } = await r.json();
          if (alive && data.messages.length) setMsgs((cur) => [...cur, ...data.messages.filter((m) => !cur.some((c) => c.id === m.id))]);
        }
      } catch {}
    };
    const id = setInterval(() => { if (document.visibilityState === "visible") poll(); }, 4000);
    return () => { alive = false; clearInterval(id); };
  }, [conversationId, msgs]);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    start(async () => {
      const r = await sendMessage(conversationId, body);
      if (r.ok && r.message) setMsgs((cur) => [...cur, r.message!]);
    });
  };

  return (
    <>
      <div className="chat__msgs" ref={box} aria-live="polite">
        {msgs.length === 0 && <p className="muted center" style={{ margin: "auto" }}>Say hello 👋 — you both accepted the introduction.</p>}
        {msgs.map((m) => (
          <div key={m.id} className={`bubble${m.senderId === me ? " me" : ""}`}>
            {m.body}
            <time>{new Date(m.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
          </div>
        ))}
      </div>
      {blocked ? (
        <p className="muted" style={{ paddingTop: 14 }}>This conversation is closed.</p>
      ) : (
        <form className="chat__form" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <label className="sr-only" htmlFor="chat-input">Message</label>
          <textarea id="chat-input" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Write a message…" maxLength={4000} />
          <button className="btn btn--aqua btn--sm" disabled={pending || !text.trim()}>Send</button>
        </form>
      )}
    </>
  );
}
