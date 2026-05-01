import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getStripe } from "@/lib/stripe";
import { platformServiceFeeRate } from "@/lib/constants";
import { z } from "zod";

const bodySchema = z.object({ bookingId: z.string().min(1) });

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

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: {
      boat: { select: { title: true } },
      payment: true,
    },
  });

  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (!booking.payment) {
    return NextResponse.json({ error: "Payment record missing" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();
  const amountCents = Math.round(Number(booking.totalPrice) * 100);
  if (amountCents < 50) {
    return NextResponse.json({ error: "Amount too small for checkout" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `Boat rental — ${booking.boat.title}`,
              description: `Booking ${booking.id}. Platform service fee: ${(platformServiceFeeRate() * 100).toFixed(0)}%.`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/boats/${booking.boatId}/book?canceled=1`,
      metadata: { bookingId: booking.id },
      payment_intent_data: {
        metadata: { bookingId: booking.id },
      },
    });

    await prisma.payment.update({
      where: { bookingId: booking.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 502 });
  }
}
