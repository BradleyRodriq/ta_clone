import Link from "next/link";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function BookingSuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Thank you</h1>
      <p className="mt-3 text-sm text-muted">
        Your payment is processing. When Stripe confirms the session, your booking will show as confirmed in
        your profile. Session: {sp.session_id ? <code className="text-xs">{sp.session_id}</code> : "—"}
      </p>
      <Link href="/profile" className="mt-8 inline-block text-sm font-medium text-accent hover:text-accent-hover">
        View my bookings
      </Link>
    </div>
  );
}
