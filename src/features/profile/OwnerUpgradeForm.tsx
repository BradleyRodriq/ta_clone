"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OwnerUpgradeForm() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/owner/upgrade", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insuranceConfirmed: true }),
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setErr(typeof j.error === "string" ? j.error : "Could not upgrade");
      return;
    }
    router.refresh();
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-4 space-y-3">
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1" />
        <span>
          I confirm that I carry appropriate liability and hull insurance for renting out my vessel, and I
          understand I remain solely responsible for compliance with local laws and regulations.
        </span>
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={!checked || loading}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Saving…" : "Become a boat owner"}
      </button>
    </form>
  );
}
