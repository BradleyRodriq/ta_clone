"use client";

import { useEffect, useState } from "react";

export function AvailabilityHint({ boatId }: { boatId: string }) {
  const [rows, setRows] = useState<{ startDate: string; endDate: string; status: string }[]>([]);

  useEffect(() => {
    const from = new Date();
    const to = new Date(Date.now() + 86400000 * 120);
    const u = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    void fetch(`/api/boats/${boatId}/availability?${u}`)
      .then((r) => r.json())
      .then((d) => setRows(d.blocked ?? []))
      .catch(() => setRows([]));
  }, [boatId]);

  if (rows.length === 0) {
    return <p className="text-xs text-muted">No blocked slots in the next 120 days (pending or confirmed).</p>;
  }

  return (
    <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted">
      <p className="font-medium text-foreground">Busy windows</p>
      <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
        {rows.map((b) => (
          <li key={b.startDate + b.endDate}>
            {new Date(b.startDate).toLocaleString()} – {new Date(b.endDate).toLocaleString()} ({b.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
