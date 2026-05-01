import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be set to a strong value (16+ characters)");
  }
  return new TextEncoder().encode(secret);
};

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export async function signAuthToken(payload: SessionPayload) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  const sub = payload.sub;
  if (!sub || typeof sub !== "string") return null;
  const email = typeof payload.email === "string" ? payload.email : null;
  const role = payload.role === "OWNER" || payload.role === "CUSTOMER" ? payload.role : null;
  if (!email || !role) return null;
  return { userId: sub, email, role };
}
