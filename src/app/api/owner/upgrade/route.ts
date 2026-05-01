import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ownerUpgradeSchema } from "@/lib/validations";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookie-options";

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

  const parsed = ownerUpgradeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      role: UserRole.OWNER,
      insuranceConfirmed: true,
    },
    select: { id: true, email: true, name: true, role: true, insuranceConfirmed: true },
  });

  const token = await signAuthToken({
    sub: updated.id,
    email: updated.email,
    role: updated.role,
  });

  const res = NextResponse.json({ user: updated });
  setAuthCookie(res, token);
  return res;
}
