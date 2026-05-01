"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewForm({ boatId }: { boatId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boatId, rating, comment }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(typeof j.error === "string" ? j.error : "Could not submit review");
      return;
    }
    setComment("");
    router.refresh();
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-6 rounded-xl border border-border bg-card p-4">
      <h3 className="font-medium text-foreground">Write a review</h3>
      <label className="mt-3 block text-sm text-muted">
        Rating
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-foreground"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-3 block text-sm text-muted">
        Comment
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-foreground"
          required
        />
      </label>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
