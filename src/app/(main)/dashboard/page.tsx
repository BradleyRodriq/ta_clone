import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }
  if (user.role !== "OWNER" || !user.insuranceConfirmed) {
    redirect("/profile");
  }

  const boats = await prisma.boat.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Your listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          New listing
        </Link>
      </div>
      <ul className="mt-8 space-y-3">
        {boats.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-medium">{b.title}</p>
              <p className="text-sm text-muted">
                {b.city} · {b._count.bookings} bookings
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/listings/${b.id}/edit`} className="text-sm text-accent hover:text-accent-hover">
                Edit
              </Link>
              <Link href={`/boats/${b.id}`} className="text-sm text-muted hover:text-foreground">
                View
              </Link>
            </div>
          </li>
        ))}
        {boats.length === 0 && <p className="text-sm text-muted">You have no listings yet.</p>}
      </ul>
    </div>
  );
}
