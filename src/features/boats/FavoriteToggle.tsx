"use client";

import { useEffect, useState } from "react";

export function FavoriteToggle({ boatId }: { boatId: string }) {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/favorites", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const ids = new Set((d.boats as { id: string }[] | undefined)?.map((b) => b.id) ?? []);
        setOn(ids.has(boatId));
      })
      .catch(() => setOn(false));
  }, [boatId]);

  const toggle = async () => {
    if (on) {
      await fetch(`/api/favorites?boatId=${encodeURIComponent(boatId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      setOn(false);
    } else {
      const res = await fetch("/api/favorites", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boatId }),
      });
      if (res.ok) setOn(true);
    }
  };

  if (on === null) {
    return <span className="h-9 w-24 animate-pulse rounded-lg bg-border" />;
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-background"
    >
      {on ? "Saved" : "Save"}
    </button>
  );
}
