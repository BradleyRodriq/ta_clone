import Image from "next/image";
import Link from "next/link";

export type BoatCardData = {
  id: string;
  title: string;
  city: string;
  pricePerDay: number;
  pricePerHour: number;
  images: string[];
  capacity: number;
  boatType: string;
  averageRating: number | null;
  reviewCount: number;
};

export function BoatCard({ boat }: { boat: BoatCardData }) {
  const img = boat.images[0] ?? "/globe.svg";
  const isRemote = img.startsWith("http");

  return (
    <Link
      href={`/boats/${boat.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-border">
        {isRemote ? (
          <Image
            src={img}
            alt={boat.title}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <Image src={img} alt={boat.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 font-medium text-foreground">{boat.title}</h2>
          {boat.averageRating != null && (
            <span className="shrink-0 rounded-md bg-background px-2 py-0.5 text-xs font-medium">
              {boat.averageRating} ({boat.reviewCount})
            </span>
          )}
        </div>
        <p className="text-sm text-muted">{boat.city}</p>
        <p className="mt-auto text-sm text-muted">
          Up to {boat.capacity} guests · {boat.boatType}
        </p>
        <p className="text-sm font-semibold text-foreground">
          ${boat.pricePerDay}
          <span className="font-normal text-muted"> / day</span>
          <span className="mx-1 text-muted">·</span>
          ${boat.pricePerHour}
          <span className="font-normal text-muted"> / hr</span>
        </p>
      </div>
    </Link>
  );
}
