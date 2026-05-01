import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { BoatCard } from "@/features/listings/BoatCard";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/favorites");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      boat: {
        include: {
          owner: { select: { id: true, name: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const boats = favorites.map((f) => {
    const b = f.boat;
    const ratings = b.reviews.map((r) => r.rating);
    const avg = ratings.length ? ratings.reduce((a, c) => a + c, 0) / ratings.length : null;
    return {
      id: b.id,
      title: b.title,
      city: b.city,
      pricePerDay: Number(b.pricePerDay),
      pricePerHour: Number(b.pricePerHour),
      images: b.images,
      capacity: b.capacity,
      boatType: b.boatType,
      averageRating: avg !== null ? Math.round(avg * 10) / 10 : null,
      reviewCount: ratings.length,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Saved boats</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {boats.map((b) => (
          <BoatCard key={b.id} boat={b} />
        ))}
      </div>
      {boats.length === 0 && (
        <p className="mt-6 text-sm text-muted">
          No favorites yet.{" "}
          <Link href="/listings" className="text-accent hover:text-accent-hover">
            Browse listings
          </Link>
        </p>
      )}
    </div>
  );
}
