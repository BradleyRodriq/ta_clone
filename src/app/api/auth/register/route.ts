import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookie-options";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name, phone, becomeOwner, insuranceConfirmed } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const role = becomeOwner ? UserRole.OWNER : UserRole.CUSTOMER;
  const insurance = Boolean(becomeOwner && insuranceConfirmed);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone: phone ?? undefined,
      role,
      insuranceConfirmed: insurance,
    },
    select: { id: true, email: true, role: true, name: true },
  });

  const token = await signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  setAuthCookie(res, token);
  return res;
}
