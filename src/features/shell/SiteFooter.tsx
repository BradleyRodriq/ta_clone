import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card px-4 py-10 text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:justify-between">
        <div>
          <p className="font-semibold text-foreground">HarborList</p>
          <p className="mt-1 max-w-sm">Peer-to-peer boat rentals. Owners set their own rules and pricing.</p>
        </div>
        <div className="flex flex-wrap gap-6">
          <Link href="/terms" className="text-accent hover:text-accent-hover">
            Terms of Service
          </Link>
          <Link href="/listings" className="text-accent hover:text-accent-hover">
            Browse boats
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs">
        Payments processed by Stripe (test mode in development). A platform service fee applies to each
        booking.
      </p>
    </footer>
  );
}
