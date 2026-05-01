export const AUTH_COOKIE = "auth_token";

export function platformServiceFeeRate(): number {
  const raw = process.env.PLATFORM_SERVICE_FEE_RATE ?? "0.10";
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n >= 0 && n < 1 ? n : 0.1;
}

export const BOAT_TYPES = ["motor", "sail", "yacht", "rib", "other"] as const;
