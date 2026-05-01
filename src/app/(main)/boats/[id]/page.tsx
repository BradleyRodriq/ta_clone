import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoatById } from "@/data/boat";
import { BoatMapLoader } from "@/features/map/BoatMapLoader";
import { FavoriteToggle } from "@/features/boats/FavoriteToggle";
import { ReviewForm } from "@/features/boats/ReviewForm";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

type Props = { params: Promise<{ id: string }> };

export default async function BoatDetailPage({ params }: Props) {
  const { id } = await params;
  const boat = await getBoatById(id);
  if (!boat) notFound();

  const ratings = boat.reviews.map((r) => r.rating);
  const averageRating = ratings.length ? ratings.reduce((a, c) => a + c, 0) / ratings.length : null;
  const user = await getCurrentUser();

  let canReview = false;
  if (user) {
    const past = await prisma.booking.findFirst({
      where: { userId: user.id, boatId: id, status: BookingStatus.CONFIRMED },
    });
    const already = await prisma.review.findUnique({
      where: { userId_boatId: { userId: user.id, boatId: id } },
    });
    canReview = Boolean(past && !already);
  }

  const mainImage = boat.images[0] ?? "/globe.svg";
  const remote = mainImage.startsWith("http");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-border">
            {remote ? (
              <Image
                src={mainImage}
                alt={boat.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            ) : (
              <Image
                src={mainImage}
                alt={boat.title}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            )}
          </div>
          {boat.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {boat.images.slice(1, 6).map((src) => (
                <div key={src} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-border">
                  {src.startsWith("http") ? (
                    <Image src={src} alt="" fill className="object-cover" sizes="112px" aria-hidden />
                  ) : (
                    <Image src={src} alt="" fill className="object-cover" sizes="112px" aria-hidden />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">{boat.city}</p>
              <h1 className="mt-1 text-3xl font-semibold text-foreground">{boat.title}</h1>
              {averageRating != null && (
                <p className="mt-2 text-sm text-muted">
                  {Math.round(averageRating * 10) / 10} average · {ratings.length} reviews
                </p>
              )}
            </div>
            {user && <FavoriteToggle boatId={boat.id} />}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <span className="rounded-full bg-background px-3 py-1">Up to {boat.capacity} guests</span>
            <span className="rounded-full bg-background px-3 py-1 capitalize">{boat.boatType}</span>
          </div>

          <p className="mt-6 text-2xl font-semibold">
            ${Number(boat.pricePerDay)}
            <span className="text-base font-normal text-muted"> / day</span>
            <span className="mx-2 text-muted">·</span>${Number(boat.pricePerHour)}
            <span className="text-base font-normal text-muted"> / hour</span>
          </p>

          <p className="mt-4 text-sm text-muted">
            Listed by <span className="font-medium text-foreground">{boat.owner.name}</span> · member
            since {boat.owner.createdAt.getFullYear()}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/boats/${boat.id}/book`}
              className="rounded-xl bg-accent px-6 py-3 text-center text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Book this boat
            </Link>
            {user && user.id !== boat.ownerId && (
              <Link
                href={`/messages/${boat.ownerId}?boatId=${boat.id}`}
                className="rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-background"
              >
                Message owner
              </Link>
            )}
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">{boat.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Amenities</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {boat.amenities.map((a) => (
                <li key={a} className="rounded-lg border border-border bg-card px-3 py-1 text-sm">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Location</h2>
        <p className="mt-1 text-sm text-muted">{boat.city}</p>
        <div className="mt-4">
          <BoatMapLoader latitude={boat.latitude} longitude={boat.longitude} title={boat.title} city={boat.city} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Reviews</h2>
        <ul className="mt-4 space-y-4">
          {boat.reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{r.user.name}</span>
                <span className="text-sm text-muted">{r.rating}/5</span>
              </div>
              <p className="mt-2 text-sm text-muted">{r.comment}</p>
            </li>
          ))}
          {boat.reviews.length === 0 && <p className="text-sm text-muted">No reviews yet.</p>}
        </ul>
        {canReview && <ReviewForm boatId={boat.id} />}
      </section>
    </div>
  );
}
