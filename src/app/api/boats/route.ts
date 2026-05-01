import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { boatCreateSchema } from "@/lib/validations";
import { getBoatsForList } from "@/data/boats";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boats = await getBoatsForList({
    city: searchParams.get("city") ?? undefined,
    boatType: searchParams.get("boatType") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    minCapacity: searchParams.get("minCapacity") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    availableFrom: searchParams.get("availableFrom") ?? undefined,
    availableTo: searchParams.get("availableTo") ?? undefined,
  });
  return NextResponse.json({ boats });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "OWNER" || !user.insuranceConfirmed) {
    return NextResponse.json(
      { error: "Only verified boat owners with insurance confirmation can create listings." },
      { status: 403 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = boatCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const boat = await prisma.boat.create({
    data: {
      title: data.title,
      description: data.description,
      pricePerHour: data.pricePerHour,
      pricePerDay: data.pricePerDay,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      capacity: data.capacity,
      amenities: data.amenities,
      images: data.images,
      boatType: data.boatType,
      ownerId: user.id,
    },
  });

  return NextResponse.json({ boat }, { status: 201 });
}
