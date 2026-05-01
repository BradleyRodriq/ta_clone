import Link from "next/link";
import { SearchHero } from "@/features/home/SearchHero";
import { getBoatsForList } from "@/data/boats";
import { BoatCard } from "@/features/listings/BoatCard";

export default async function HomePage() {
  const featured = await getBoatsForList({});
  const slice = featured.slice(0, 3);

  return (
    <div>
      <SearchHero />
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Popular near you</h2>
            <p className="mt-1 text-sm text-muted">Hand-picked from recent listings</p>
          </div>
          <Link href="/listings" className="text-sm font-medium text-accent hover:text-accent-hover">
            View all
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {slice.map((b) => (
            <BoatCard key={b.id} boat={b} />
          ))}
        </div>
      </section>
    </div>
  );
}
