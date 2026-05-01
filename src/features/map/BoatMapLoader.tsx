"use client";

import dynamic from "next/dynamic";

const BoatMap = dynamic(() => import("./BoatMap").then((m) => m.BoatMap), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-border md:h-80" />,
});

export function BoatMapLoader(props: {
  latitude: number;
  longitude: number;
  title: string;
  city: string;
}) {
  return <BoatMap {...props} />;
}
