import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const boat = await prisma.boat.findUnique({ where: { id }, select: { id: true } });
  if (!boat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const start = from ? new Date(from) : new Date();
  const end = to ? new Date(to) : new Date(Date.now() + 86400000 * 90);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      boatId: id,
      status: { in: ["PENDING", "CONFIRMED"] },
      startDate: { lt: end },
      endDate: { gt: start },
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      status: true,
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({ blocked: bookings });
}
