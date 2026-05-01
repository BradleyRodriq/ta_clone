import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

const postSchema = z.object({ boatId: z.string().min(1) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      boat: {
        include: {
          owner: { select: { id: true, name: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const boats = favorites.map((f) => {
    const b = f.boat;
    const ratings = b.reviews.map((r) => r.rating);
    const avg = ratings.length ? ratings.reduce((a, c) => a + c, 0) / ratings.length : null;
    return {
      favoriteId: f.id,
      id: b.id,
      title: b.title,
      description: b.description,
      pricePerHour: Number(b.pricePerHour),
      pricePerDay: Number(b.pricePerDay),
      city: b.city,
      latitude: b.latitude,
      longitude: b.longitude,
      capacity: b.capacity,
      amenities: b.amenities,
      images: b.images,
      boatType: b.boatType,
      owner: b.owner,
      reviewCount: ratings.length,
      averageRating: avg !== null ? Math.round(avg * 10) / 10 : null,
    };
  });

  return NextResponse.json({ boats });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const boat = await prisma.boat.findUnique({ where: { id: parsed.data.boatId } });
  if (!boat) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 });
  }

  try {
    const fav = await prisma.favorite.create({
      data: { userId: user.id, boatId: boat.id },
    });
    return NextResponse.json({ favorite: fav }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already favorited" }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boatId = new URL(request.url).searchParams.get("boatId");
  if (!boatId) {
    return NextResponse.json({ error: "boatId required" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { userId: user.id, boatId },
  });

  return NextResponse.json({ ok: true });
}
