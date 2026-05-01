import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BOAT_TYPES } from "@/lib/constants";

export type BoatListFilters = {
  city?: string;
  boatType?: string;
  minPrice?: string;
  maxPrice?: string;
  minCapacity?: string;
  q?: string;
  availableFrom?: string;
  availableTo?: string;
};

export async function getBoatsForList(filters: BoatListFilters) {
  const where: Prisma.BoatWhereInput = {};

  if (filters.city?.trim()) {
    where.city = { contains: filters.city.trim(), mode: "insensitive" };
  }
  if (filters.boatType?.trim() && (BOAT_TYPES as readonly string[]).includes(filters.boatType.trim())) {
    where.boatType = filters.boatType.trim();
  }
  if (filters.minCapacity) {
    const n = Number.parseInt(filters.minCapacity, 10);
    if (Number.isFinite(n)) where.capacity = { gte: n };
  }

  const andFilters: Prisma.BoatWhereInput[] = [];
  if (filters.minPrice || filters.maxPrice) {
    const dayFilter: Prisma.DecimalFilter = {};
    if (filters.minPrice) {
      const n = Number.parseFloat(filters.minPrice);
      if (Number.isFinite(n)) dayFilter.gte = n;
    }
    if (filters.maxPrice) {
      const n = Number.parseFloat(filters.maxPrice);
      if (Number.isFinite(n)) dayFilter.lte = n;
    }
    if (Object.keys(dayFilter).length) {
      andFilters.push({ pricePerDay: dayFilter });
    }
  }

  if (filters.availableFrom && filters.availableTo) {
    const from = new Date(filters.availableFrom);
    const to = new Date(filters.availableTo);
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && to > from) {
      andFilters.push({
        NOT: {
          bookings: {
            some: {
              status: { in: ["PENDING", "CONFIRMED"] },
              AND: [{ startDate: { lt: to } }, { endDate: { gt: from } }],
            },
          },
        },
      });
    }
  }

  if (andFilters.length) {
    where.AND = andFilters;
  }

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const boats = await prisma.boat.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, name: true } },
      reviews: { select: { rating: true } },
    },
    take: 60,
  });

  return boats.map((b) => {
    const ratings = b.reviews.map((r) => r.rating);
    const avg = ratings.length ? ratings.reduce((a, c) => a + c, 0) / ratings.length : null;
    return {
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
}
