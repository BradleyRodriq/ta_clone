import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ThreadClient } from "@/features/messages/ThreadClient";

type Props = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ boatId?: string }>;
};

export default async function MessageThreadPage({ params, searchParams }: Props) {
  const { userId } = await params;
  const sp = await searchParams;
  const me = await getCurrentUser();
  if (!me) {
    redirect(`/login?next=${encodeURIComponent(`/messages/${userId}`)}`);
  }
  if (userId === me.id) {
    redirect("/messages");
  }

  const other = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } });
  if (!other) {
    notFound();
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: me.id, recipientId: userId },
        { senderId: userId, recipientId: me.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 py-10">
      <Link href="/messages" className="text-sm text-accent hover:text-accent-hover">
        All messages
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Chat with {other.name}</h1>
      <ThreadClient
        otherUserId={userId}
        initialBoatId={sp.boatId}
        initialMessages={messages.map((m) => ({
          id: m.id,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
          senderId: m.senderId,
          senderName: m.sender.name,
        }))}
      />
    </div>
  );
}
