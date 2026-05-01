import { getBoatsForList } from "@/data/boats";
import { BoatCard } from "@/features/listings/BoatCard";
import { BOAT_TYPES } from "@/lib/constants";

function q(v: string | string[] | undefined) {
  if (Array.isArray(v)) return v[0];
  return v;
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ListingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const boats = await getBoatsForList({
    city: q(sp.city),
    boatType: q(sp.boatType),
    minPrice: q(sp.minPrice),
    maxPrice: q(sp.maxPrice),
    minCapacity: q(sp.minCapacity),
    q: q(sp.q),
    availableFrom: q(sp.availableFrom),
    availableTo: q(sp.availableTo),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Browse boats</h1>
      <p className="mt-1 text-sm text-muted">{boats.length} listings</p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <form method="get" className="space-y-4 rounded-2xl border border-border bg-card p-4 text-sm">
            <div>
              <label className="font-medium text-foreground">Search</label>
              <input
                name="q"
                defaultValue={q(sp.q)}
                placeholder="Keywords"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="font-medium text-foreground">City</label>
              <input
                name="city"
                defaultValue={q(sp.city)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="font-medium text-foreground">Boat type</label>
              <select
                name="boatType"
                defaultValue={q(sp.boatType) ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              >
                <option value="">Any</option>
                {BOAT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-foreground">Min $ / day</label>
                <input
                  name="minPrice"
                  type="number"
                  defaultValue={q(sp.minPrice)}
                  className="mt-1 w-full rounded-lg border border-border px-2 py-2"
                />
              </div>
              <div>
                <label className="font-medium text-foreground">Max $ / day</label>
                <input
                  name="maxPrice"
                  type="number"
                  defaultValue={q(sp.maxPrice)}
                  className="mt-1 w-full rounded-lg border border-border px-2 py-2"
                />
              </div>
            </div>
            <div>
              <label className="font-medium text-foreground">Min capacity</label>
              <input
                name="minCapacity"
                type="number"
                min={1}
                defaultValue={q(sp.minCapacity)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="font-medium text-foreground">Available from</label>
              <input
                name="availableFrom"
                type="date"
                defaultValue={q(sp.availableFrom)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="font-medium text-foreground">Available to</label>
              <input
                name="availableTo"
                type="date"
                defaultValue={q(sp.availableTo)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-accent py-2 font-medium text-white hover:bg-accent-hover"
            >
              Apply filters
            </button>
          </form>
        </aside>

        <div className="grid flex-1 gap-6 sm:grid-cols-2">
          {boats.length === 0 ? (
            <p className="text-muted">No boats match your filters.</p>
          ) : (
            boats.map((b) => <BoatCard key={b.id} boat={b} />)
          )}
        </div>
      </div>
    </div>
  );
}
