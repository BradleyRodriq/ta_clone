import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { messageCreateSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const otherId = new URL(request.url).searchParams.get("with");
  if (!otherId) {
    return NextResponse.json({ error: "Query param 'with' (user id) is required" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, recipientId: otherId },
        { senderId: otherId, recipientId: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true } },
      recipient: { select: { id: true, name: true } },
      boat: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ messages });
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

  const parsed = messageCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { recipientId, body, boatId } = parsed.data;
  if (recipientId === user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  if (boatId) {
    const boat = await prisma.boat.findUnique({ where: { id: boatId } });
    if (!boat) {
      return NextResponse.json({ error: "Boat not found" }, { status: 404 });
    }
    const involvesOwner = user.id === boat.ownerId || recipientId === boat.ownerId;
    if (!involvesOwner) {
      return NextResponse.json({ error: "Messages about a boat must include the boat owner" }, { status: 403 });
    }
  }

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      recipientId,
      body,
      boatId: boatId ?? null,
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
