"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [becomeOwner, setBecomeOwner] = useState(false);
  const [insuranceConfirmed, setInsuranceConfirmed] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
        name,
        phone: phone || null,
        becomeOwner,
        insuranceConfirmed: becomeOwner ? insuranceConfirmed : undefined,
      }),
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      const flat = j.error?.fieldErrors as Record<string, string[]> | undefined;
      const msg = flat ? Object.values(flat).flat().join(" ") : typeof j.error === "string" ? j.error : "Register failed";
      setErr(msg);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
        <label className="block text-sm">
          Name
          <input
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Password (min 8 characters)
          <input
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <label className="block text-sm">
          Phone (optional)
          <input
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={becomeOwner} onChange={(e) => setBecomeOwner(e.target.checked)} />
          <span>I want to list boats as an owner</span>
        </label>
        {becomeOwner && (
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={insuranceConfirmed}
              onChange={(e) => setInsuranceConfirmed(e.target.checked)}
            />
            <span>I confirm appropriate insurance for peer-to-peer rentals.</span>
          </label>
        )}
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:text-accent-hover">
          Log in
        </Link>
      </p>
    </div>
  );
}
