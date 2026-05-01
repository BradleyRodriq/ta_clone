export function SearchHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 px-4 py-16 text-white md:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,#5eead4_0%,transparent_50%)]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Find your next day on the water</h1>
        <p className="mt-3 text-lg text-teal-100 md:text-xl">
          Browse verified listings, compare prices, and book with secure Stripe checkout.
        </p>

        <form
          action="/listings"
          method="get"
          className="mx-auto mt-10 grid max-w-3xl gap-3 rounded-2xl bg-white/95 p-4 text-left text-foreground shadow-xl md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-muted">Location</label>
            <input
              name="city"
              placeholder="City or region"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">From</label>
            <input
              type="date"
              name="availableFrom"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">To</label>
            <input
              type="date"
              name="availableTo"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Max $ / day</label>
            <input
              name="maxPrice"
              type="number"
              min={0}
              placeholder="e.g. 800"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Min capacity</label>
            <input
              name="minCapacity"
              type="number"
              min={1}
              placeholder="Guests"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Search boats
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
