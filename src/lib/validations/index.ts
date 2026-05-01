import { z } from "zod";
import { BOAT_TYPES } from "@/lib/constants";

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2).max(120),
    phone: z.string().max(40).optional().nullable(),
    becomeOwner: z.boolean().optional(),
    insuranceConfirmed: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.becomeOwner && !val.insuranceConfirmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Owners must confirm they carry appropriate insurance.",
        path: ["insuranceConfirmed"],
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const boatCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(8000),
  pricePerHour: z.coerce.number().positive(),
  pricePerDay: z.coerce.number().positive(),
  city: z.string().min(2).max(120),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  capacity: z.coerce.number().int().min(1).max(200),
  amenities: z.array(z.string().min(1).max(80)).max(40).default([]),
  images: z.array(z.string().url().or(z.string().startsWith("/uploads/"))).max(20).default([]),
  boatType: z.enum(BOAT_TYPES),
});

export const boatUpdateSchema = boatCreateSchema.partial();

export const bookingCreateSchema = z.object({
  boatId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  guestCount: z.coerce.number().int().min(1).max(200),
  pricingMode: z.enum(["HOUR", "DAY"]),
});

export const reviewCreateSchema = z.object({
  boatId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(4).max(2000),
});

export const messageCreateSchema = z.object({
  boatId: z.string().min(1).optional(),
  recipientId: z.string().min(1),
  body: z.string().min(1).max(4000),
});

export const ownerUpgradeSchema = z.object({
  insuranceConfirmed: z.literal(true),
});
