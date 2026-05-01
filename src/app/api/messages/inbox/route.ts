import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: user.id }, { recipientId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 400,
    include: {
      sender: { select: { id: true, name: true } },
      recipient: { select: { id: true, name: true } },
      boat: { select: { id: true, title: true } },
    },
  });

  type Thread = {
    userId: string;
    name: string;
    lastMessage: string;
    lastAt: string;
    boatTitle?: string;
  };

  const threads = new Map<string, Thread>();
  for (const m of messages) {
    const other = m.senderId === user.id ? m.recipient : m.sender;
    if (threads.has(other.id)) continue;
    threads.set(other.id, {
      userId: other.id,
      name: other.name,
      lastMessage: m.body,
      lastAt: m.createdAt.toISOString(),
      boatTitle: m.boat?.title,
    });
  }

  return NextResponse.json({ threads: [...threads.values()] });
}
