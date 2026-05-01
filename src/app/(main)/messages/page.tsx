import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/messages");
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

  const threads = new Map<
    string,
    { userId: string; name: string; lastMessage: string; lastAt: Date; boatTitle?: string }
  >();
  for (const m of messages) {
    const other = m.senderId === user.id ? m.recipient : m.sender;
    if (threads.has(other.id)) continue;
    threads.set(other.id, {
      userId: other.id,
      name: other.name,
      lastMessage: m.body,
      lastAt: m.createdAt,
      boatTitle: m.boat?.title,
    });
  }

  const list = [...threads.values()];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Messages</h1>
      <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
        {list.map((t) => (
          <li key={t.userId}>
            <Link href={`/messages/${t.userId}`} className="block px-4 py-4 hover:bg-background">
              <p className="font-medium">{t.name}</p>
              {t.boatTitle && <p className="text-xs text-muted">Re: {t.boatTitle}</p>}
              <p className="mt-1 line-clamp-2 text-sm text-muted">{t.lastMessage}</p>
              <p className="mt-1 text-xs text-muted">{t.lastAt.toLocaleString()}</p>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-6 text-sm text-muted">No conversations yet.</p>}
    </div>
  );
}
