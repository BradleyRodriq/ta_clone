import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { boatUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const boat = await prisma.boat.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, createdAt: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
        take: 50,
      },
    },
  });
  if (!boat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ratings = boat.reviews.map((r) => r.rating);
  const averageRating = ratings.length ? ratings.reduce((a, c) => a + c, 0) / ratings.length : null;

  return NextResponse.json({
    boat: {
      ...boat,
      pricePerHour: Number(boat.pricePerHour),
      pricePerDay: Number(boat.pricePerDay),
      averageRating: averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
    },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.boat.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = boatUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const boat = await prisma.boat.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ boat });
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.boat.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.boat.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
