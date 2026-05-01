import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function getSessionFromCookies() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyAuthToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      insuranceConfirmed: true,
      createdAt: true,
    },
  });
  return user;
}
