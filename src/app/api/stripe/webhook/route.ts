import { NextResponse } from "next/server";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = Buffer.from(await request.arrayBuffer());
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        const pi =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;
        await prisma.payment.updateMany({
          where: { bookingId, status: PaymentStatus.PENDING },
          data: {
            status: PaymentStatus.SUCCEEDED,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: pi,
          },
        });
        await prisma.booking.updateMany({
          where: { id: bookingId, status: BookingStatus.PENDING },
          data: { status: BookingStatus.CONFIRMED },
        });
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await prisma.payment.updateMany({
          where: { bookingId, stripeCheckoutSessionId: session.id, status: PaymentStatus.PENDING },
          data: { status: PaymentStatus.FAILED },
        });
        await prisma.booking.updateMany({
          where: { id: bookingId, status: BookingStatus.PENDING },
          data: { status: BookingStatus.CANCELED },
        });
      }
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
