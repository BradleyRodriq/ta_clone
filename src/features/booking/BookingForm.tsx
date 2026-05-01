"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Boat = {
  id: string;
  title: string;
  pricePerHour: number;
  pricePerDay: number;
  capacity: number;
};

export function BookingForm({ boat, canceled }: { boat: Boat; canceled?: boolean }) {
  const router = useRouter();
  const [pricingMode, setPricingMode] = useState<"DAY" | "HOUR">("DAY");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const estimate = useMemo(() => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (e <= s) return null;
    if (pricingMode === "HOUR") {
      const ms = e.getTime() - s.getTime();
      const hours = Math.max(1, Math.ceil(ms / 3600000));
      return Math.round(hours * boat.pricePerHour * 100) / 100;
    }
    const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000));
    return Math.round(days * boat.pricePerDay * 100) / 100;
  }, [start, end, pricingMode, boat.pricePerDay, boat.pricePerHour]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const startDate = new Date(start).toISOString();
    const endDate = new Date(end).toISOString();
    const res = await fetch("/api/bookings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boatId: boat.id,
        startDate,
        endDate,
        guestCount,
        pricingMode,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setErr(typeof j.error === "string" ? j.error : "Booking failed");
      return;
    }
    const checkout = await fetch("/api/stripe/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: j.booking.id }),
    });
    const cj = await checkout.json().catch(() => ({}));
    setLoading(false);
    if (!checkout.ok) {
      setErr(typeof cj.error === "string" ? cj.error : "Could not start checkout");
      return;
    }
    if (cj.url) {
      window.location.href = cj.url as string;
    } else {
      setErr("Stripe did not return a checkout URL. Check STRIPE_SECRET_KEY.");
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mx-auto max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6">
      <h1 className="text-xl font-semibold text-foreground">Book {boat.title}</h1>
      {canceled && <p className="text-sm text-amber-800">Checkout was canceled. You can try again below.</p>}
      <label className="block text-sm text-muted">
        Pricing
        <select
          value={pricingMode}
          onChange={(e) => setPricingMode(e.target.value as "DAY" | "HOUR")}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-foreground"
        >
          <option value="DAY">Per day</option>
          <option value="HOUR">Per hour</option>
        </select>
      </label>
      <label className="block text-sm text-muted">
        Start
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-foreground"
          required
        />
      </label>
      <label className="block text-sm text-muted">
        End
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-foreground"
          required
        />
      </label>
      <label className="block text-sm text-muted">
        Guests
        <input
          type="number"
          min={1}
          max={boat.capacity}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-foreground"
        />
      </label>
      {estimate != null && (
        <p className="text-sm text-muted">
          Estimated rental: <strong className="text-foreground">${estimate}</strong> (platform service fee
          added at checkout)
        </p>
      )}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Continue to Stripe checkout"}
      </button>
      <button type="button" className="w-full text-sm text-muted hover:text-foreground" onClick={() => router.back()}>
        Back
      </button>
    </form>
  );
}
