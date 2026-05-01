"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string;
};

export function ThreadClient({
  otherUserId,
  initialBoatId,
  initialMessages,
}: {
  otherUserId: string;
  initialBoatId?: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/messages", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: otherUserId,
        body,
        boatId: initialBoatId,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(typeof j.error === "string" ? j.error : "Send failed");
      return;
    }
    setBody("");
    const m = j.message as { id: string; body: string; createdAt: string; senderId: string };
    setMessages((prev) => [
      ...prev,
      {
        id: m.id,
        body: m.body,
        createdAt: m.createdAt,
        senderId: m.senderId,
        senderName: "You",
      },
    ]);
  };

  return (
    <>
      {initialBoatId && (
        <p className="mt-2 text-xs text-muted">
          Thread linked to listing <code>{initialBoatId}</code>
        </p>
      )}
      <div className="mt-4 flex max-h-[50vh] flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-card p-4">
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-medium text-foreground">{m.senderName}</span>
            <span className="ml-2 text-xs text-muted">{new Date(m.createdAt).toLocaleString()}</span>
            <p className="mt-1 text-muted">{m.body}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => void send(e)} className="mt-4 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          required
          placeholder="Type a message…"
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
          Send
        </button>
      </form>
    </>
  );
}
