import { PrismaClient, UserRole, BookingStatus, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const imgs = (slug: string) => [
  `https://images.unsplash.com/photo-${slug}?w=1200&q=80`,
  `https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80`,
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.message.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.boat.deleteMany();
  await prisma.user.deleteMany();

  const owner = await prisma.user.create({
    data: {
      email: "owner@example.com",
      passwordHash,
      name: "Alex Rivera",
      phone: "+1 555 0100",
      role: UserRole.OWNER,
      insuranceConfirmed: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      passwordHash,
      name: "Jordan Lee",
      phone: "+1 555 0200",
      role: UserRole.CUSTOMER,
    },
  });

  const dual = await prisma.user.create({
    data: {
      email: "both@example.com",
      passwordHash,
      name: "Sam Chen",
      role: UserRole.OWNER,
      insuranceConfirmed: true,
    },
  });

  await prisma.boat.createMany({
    data: [
      {
        title: "Sunrise 22′ Center Console",
        description:
          "Spacious center console ideal for bay fishing and coastal day trips. Garmin GPS, live well, and shade bimini included.",
        pricePerHour: 95,
        pricePerDay: 650,
        city: "Miami",
        latitude: 25.7617,
        longitude: -80.1918,
        capacity: 6,
        amenities: ["GPS", "Live well", "Cooler", "Bluetooth audio", "Rod holders"],
        images: imgs("1567891377874-43f0ea997cfd"),
        boatType: "motor",
        ownerId: owner.id,
      },
      {
        title: "Classic Daysailer 26′",
        description:
          "Easy-handling daysailer with updated rigging. Perfect for lessons or relaxed sailing with friends.",
        pricePerHour: 110,
        pricePerDay: 720,
        city: "San Diego",
        latitude: 32.7157,
        longitude: -117.1611,
        capacity: 5,
        amenities: ["Life jackets", "Cooler", "Dry bag", "Swim ladder"],
        images: imgs("1504274062240-24f42e0be0a8"),
        boatType: "sail",
        ownerId: owner.id,
      },
      {
        title: "Luxury Cruiser 34′",
        description:
          "Flybridge cruiser with galley, AC below deck, and generous cockpit seating for entertaining.",
        pricePerHour: 195,
        pricePerDay: 1400,
        city: "Seattle",
        latitude: 47.6062,
        longitude: -122.3321,
        capacity: 10,
        amenities: ["Galley", "AC", "Generator", "Wi‑Fi", "BBQ"],
        images: imgs("1540942291391-7f2c946d2a10"),
        boatType: "yacht",
        ownerId: dual.id,
      },
      {
        title: "Rigid Inflatable 18′",
        description:
          "Lightweight RIB for quick hops, snorkeling, and exploring coves. Honda outboard, easy beach launch.",
        pricePerHour: 65,
        pricePerDay: 420,
        city: "Key West",
        latitude: 24.5551,
        longitude: -81.78,
        capacity: 4,
        amenities: ["Snorkel gear", "Anchor", "Dry storage"],
        images: imgs("1534447676-8f4094b56a0c"),
        boatType: "motor",
        ownerId: dual.id,
      },
    ],
  });

  const allBoats = await prisma.boat.findMany();

  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment: "Spotless boat, great communication. Would book again.",
        userId: customer.id,
        boatId: allBoats[0].id,
      },
      {
        rating: 4,
        comment: "Beautiful sail — a bit windy but the owner was helpful.",
        userId: customer.id,
        boatId: allBoats[1].id,
      },
    ],
  });

  const booking = await prisma.booking.create({
    data: {
      userId: customer.id,
      boatId: allBoats[2].id,
      startDate: new Date(Date.now() + 86400000 * 7),
      endDate: new Date(Date.now() + 86400000 * 7 + 3600000 * 8),
      guestCount: 6,
      pricingMode: "DAY",
      totalPrice: 1400,
      status: BookingStatus.CONFIRMED,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      stripeCheckoutSessionId: "seed_session",
      amountSubtotal: 1400,
      serviceFeeAmount: 140,
      ownerAmount: 1260,
      status: PaymentStatus.SUCCEEDED,
    },
  });

  await prisma.favorite.create({
    data: { userId: customer.id, boatId: allBoats[0].id },
  });

  await prisma.message.create({
    data: {
      boatId: allBoats[0].id,
      senderId: customer.id,
      recipientId: owner.id,
      body: "Hi Alex — is Saturday morning still available for a 4‑hour trip?",
    },
  });

  console.log("Seed complete.");
  console.log("Log in: owner@example.com / password123");
  console.log("Log in: customer@example.com / password123");
  console.log(`Created ${allBoats.length} boats, reviews, booking, favorite, and sample message.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
