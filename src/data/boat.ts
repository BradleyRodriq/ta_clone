import { prisma } from "@/lib/prisma";

export async function getBoatById(id: string) {
  return prisma.boat.findUnique({
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
}
