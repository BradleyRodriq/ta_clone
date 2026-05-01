import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { OwnerUpgradeForm } from "@/features/profile/OwnerUpgradeForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
    include: {
      boat: { select: { id: true, title: true, city: true, images: true } },
      payment: { select: { status: true, serviceFeeAmount: true } },
    },
    take: 40,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-medium">Personal info</h2>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          {user.phone && (
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="font-medium">{user.phone}</dd>
            </div>
          )}
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="font-medium capitalize">{user.role.toLowerCase()}</dd>
          </div>
          {user.role === "OWNER" && (
            <div>
              <dt className="text-muted">Insurance attested</dt>
              <dd className="font-medium">{user.insuranceConfirmed ? "Yes" : "No"}</dd>
            </div>
          )}
        </dl>
      </section>

      {(user.role !== "OWNER" || !user.insuranceConfirmed) && (
        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium">List your boat</h2>
          <p className="mt-2 text-sm text-muted">
            Upgrade to an owner account after confirming you maintain appropriate insurance for commercial or
            peer-to-peer rentals as applicable in your jurisdiction.
          </p>
          <OwnerUpgradeForm />
        </section>
      )}

      {user.role === "OWNER" && user.insuranceConfirmed && (
        <p className="mt-6">
          <Link href="/dashboard" className="text-sm font-medium text-accent hover:text-accent-hover">
            Open owner dashboard
          </Link>
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-medium">My bookings</h2>
        <ul className="mt-4 space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="rounded-xl border border-border bg-card p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-medium">{b.boat.title}</p>
                  <p className="text-muted">
                    {b.startDate.toLocaleString()} – {b.endDate.toLocaleString()}
                  </p>
                  <p className="text-muted">
                    {b.guestCount} guests · ${Number(b.totalPrice)} · {b.status.toLowerCase()}
                  </p>
                  {b.payment && (
                    <p className="text-xs text-muted">
                      Payment: {b.payment.status.toLowerCase()} (incl. ${Number(b.payment.serviceFeeAmount)}{" "}
                      platform fee)
                    </p>
                  )}
                </div>
                <Link href={`/boats/${b.boat.id}`} className="text-accent hover:text-accent-hover">
                  View boat
                </Link>
              </div>
            </li>
          ))}
          {bookings.length === 0 && <p className="text-sm text-muted">No bookings yet.</p>}
        </ul>
      </section>
    </div>
  );
}
