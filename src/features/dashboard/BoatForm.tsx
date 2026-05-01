"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BOAT_TYPES } from "@/lib/constants";

type Initial = Partial<{
  title: string;
  description: string;
  pricePerHour: number;
  pricePerDay: number;
  city: string;
  latitude: number;
  longitude: number;
  capacity: number;
  amenities: string[];
  images: string[];
  boatType: string;
}>;

export function BoatForm({ boatId, initial }: { boatId?: string; initial?: Initial }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [pricePerHour, setPricePerHour] = useState(initial?.pricePerHour ?? 80);
  const [pricePerDay, setPricePerDay] = useState(initial?.pricePerDay ?? 500);
  const [city, setCity] = useState(initial?.city ?? "");
  const [latitude, setLatitude] = useState(initial?.latitude ?? 25.76);
  const [longitude, setLongitude] = useState(initial?.longitude ?? -80.19);
  const [capacity, setCapacity] = useState(initial?.capacity ?? 6);
  const [amenitiesStr, setAmenitiesStr] = useState((initial?.amenities ?? []).join(", "));
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [boatType, setBoatType] = useState(initial?.boatType ?? "motor");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(typeof j.error === "string" ? j.error : "Upload failed");
    setImages((prev) => [...prev, j.url as string]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const amenities = amenitiesStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      title,
      description,
      pricePerHour,
      pricePerDay,
      city,
      latitude,
      longitude,
      capacity,
      amenities,
      images,
      boatType,
    };
    const url = boatId ? `/api/boats/${boatId}` : "/api/boats";
    const res = await fetch(url, {
      method: boatId ? "PATCH" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setErr(typeof j.error === "string" ? j.error : "Save failed");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mx-auto max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          Title
          <input
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          Description
          <textarea
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          $ / hour
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(Number(e.target.value))}
            required
          />
        </label>
        <label className="block text-sm">
          $ / day
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(Number(e.target.value))}
            required
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          City
          <input
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Latitude
          <input
            type="number"
            step="any"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={latitude}
            onChange={(e) => setLatitude(Number(e.target.value))}
            required
          />
        </label>
        <label className="block text-sm">
          Longitude
          <input
            type="number"
            step="any"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={longitude}
            onChange={(e) => setLongitude(Number(e.target.value))}
            required
          />
        </label>
        <label className="block text-sm">
          Capacity
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            required
          />
        </label>
        <label className="block text-sm">
          Boat type
          <select
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={boatType}
            onChange={(e) => setBoatType(e.target.value)}
          >
            {BOAT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          Amenities (comma-separated)
          <input
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            value={amenitiesStr}
            onChange={(e) => setAmenitiesStr(e.target.value)}
          />
        </label>
        <div className="sm:col-span-2">
          <p className="text-sm font-medium">Images</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {images.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="url"
              placeholder="Image URL (https://...)"
              className="min-w-[200px] flex-1 rounded-lg border border-border px-3 py-2"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-sm"
              onClick={() => {
                if (imageUrl) {
                  setImages((p) => [...p, imageUrl]);
                  setImageUrl("");
                }
              }}
            >
              Add URL
            </button>
            <label className="rounded-lg border border-border px-3 py-2 text-sm">
              Upload
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f).catch((ex: Error) => setErr(ex.message));
                }}
              />
            </label>
          </div>
        </div>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={loading || images.length === 0}
        className="rounded-xl bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Saving…" : boatId ? "Update listing" : "Publish listing"}
      </button>
      {images.length === 0 && <p className="text-xs text-muted">Add at least one image URL or upload a file.</p>}
    </form>
  );
}
