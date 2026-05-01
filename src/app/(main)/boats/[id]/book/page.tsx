import { redirect } from "next/navigation";
import { getBoatById } from "@/data/boat";
import { getCurrentUser } from "@/lib/auth/session";
import { BookingForm } from "@/features/booking/BookingForm";
import { AvailabilityHint } from "@/features/booking/AvailabilityHint";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ canceled?: string }>;
};

export default async function BookBoatPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/boats/${id}/book`)}`);
  }

  const boat = await getBoatById(id);
  if (!boat) {
    redirect("/listings");
  }
  if (boat.ownerId === user.id) {
    redirect(`/boats/${id}`);
  }

  const b = {
    id: boat.id,
    title: boat.title,
    pricePerHour: Number(boat.pricePerHour),
    pricePerDay: Number(boat.pricePerDay),
    capacity: boat.capacity,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mx-auto grid max-w-lg gap-6">
        <BookingForm boat={b} canceled={sp.canceled === "1"} />
        <AvailabilityHint boatId={boat.id} />
      </div>
    </div>
  );
}
