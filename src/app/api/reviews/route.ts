import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { reviewCreateSchema } from "@/lib/validations";

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

  const parsed = reviewCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { boatId, rating, comment } = parsed.data;

  const boat = await prisma.boat.findUnique({ where: { id: boatId } });
  if (!boat) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 });
  }

  const stayed = await prisma.booking.findFirst({
    where: {
      userId: user.id,
      boatId,
      status: BookingStatus.CONFIRMED,
    },
  });
  if (!stayed) {
    return NextResponse.json(
      { error: "You can only review boats you have completed bookings for." },
      { status: 403 },
    );
  }

  try {
    const review = await prisma.review.create({
      data: { boatId, userId: user.id, rating, comment },
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "You have already reviewed this boat" }, { status: 409 });
  }
}
