import { NextResponse } from "next/server";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { bookingCreateSchema } from "@/lib/validations";
import { computeRentalTotal, splitPayment } from "@/lib/money";

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

  const parsed = bookingCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { boatId, startDate, endDate, guestCount, pricingMode } = parsed.data;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const boat = await prisma.boat.findUnique({ where: { id: boatId } });
  if (!boat) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 });
  }
  if (boat.ownerId === user.id) {
    return NextResponse.json({ error: "You cannot book your own boat" }, { status: 400 });
  }
  if (guestCount > boat.capacity) {
    return NextResponse.json({ error: "Guest count exceeds boat capacity" }, { status: 400 });
  }

  const overlap = await prisma.booking.findFirst({
    where: {
      boatId,
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
    },
  });
  if (overlap) {
    return NextResponse.json({ error: "Selected dates are not available" }, { status: 409 });
  }

  const total = computeRentalTotal({
    pricingMode,
    pricePerHour: Number(boat.pricePerHour),
    pricePerDay: Number(boat.pricePerDay),
    start,
    end,
  });
  if (total <= 0) {
    return NextResponse.json({ error: "Could not compute price for this range" }, { status: 400 });
  }

  const split = splitPayment(total);

  const booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        userId: user.id,
        boatId,
        startDate: start,
        endDate: end,
        guestCount,
        pricingMode,
        totalPrice: total,
        status: BookingStatus.PENDING,
      },
    });
    await tx.payment.create({
      data: {
        bookingId: b.id,
        amountSubtotal: split.amountSubtotal,
        serviceFeeAmount: split.serviceFeeAmount,
        ownerAmount: split.ownerAmount,
        status: PaymentStatus.PENDING,
      },
    });
    return b;
  });

  return NextResponse.json({
    booking: {
      id: booking.id,
      totalPrice: total,
      serviceFeeAmount: split.serviceFeeAmount,
      ownerAmount: split.ownerAmount,
    },
  });
}
