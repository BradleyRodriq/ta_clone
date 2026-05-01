import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { BoatForm } from "@/features/dashboard/BoatForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard/listings/" + id + "/edit");
  }
  if (user.role !== "OWNER" || !user.insuranceConfirmed) {
    redirect("/profile");
  }

  const boat = await prisma.boat.findUnique({ where: { id } });
  if (!boat || boat.ownerId !== user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Edit listing</h1>
      <div className="mt-8">
        <BoatForm
          boatId={boat.id}
          initial={{
            title: boat.title,
            description: boat.description,
            pricePerHour: Number(boat.pricePerHour),
            pricePerDay: Number(boat.pricePerDay),
            city: boat.city,
            latitude: boat.latitude,
            longitude: boat.longitude,
            capacity: boat.capacity,
            amenities: boat.amenities,
            images: boat.images,
            boatType: boat.boatType,
          }}
        />
      </div>
    </div>
  );
}
