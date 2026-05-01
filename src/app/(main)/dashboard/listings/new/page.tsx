import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { BoatForm } from "@/features/dashboard/BoatForm";

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard/listings/new");
  }
  if (user.role !== "OWNER" || !user.insuranceConfirmed) {
    redirect("/profile");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">New listing</h1>
      <p className="mt-1 text-sm text-muted">You are responsible for accurate safety and insurance information.</p>
      <div className="mt-8">
        <BoatForm />
      </div>
    </div>
  );
}
