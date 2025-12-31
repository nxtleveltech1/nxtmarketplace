import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000),
  priceCents: z
    .number()
    .int("Price must be a whole number")
    .positive("Price must be positive")
    .min(100, "Price must be at least $1.00"),
  sellerLocation: z.string().optional(),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
});

export const updateListingSchema = createListingSchema.partial();

export const createReviewSchema = z.object({
  saleId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const createMessageSchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  saleId: z.string().uuid().optional(),
});

export const approveListingSchema = z.object({
  listingId: z.string().uuid(),
});

export const rejectListingSchema = z.object({
  listingId: z.string().uuid(),
  feedback: z.string().optional(),
});

export const verifyItemSchema = z.object({
  verificationId: z.string().uuid(),
  inspectorNotes: z.string().max(2000).optional(),
});

export const failVerificationSchema = z.object({
  verificationId: z.string().uuid(),
  inspectorNotes: z.string().max(2000).optional(),
});

export const createSaleSchema = z.object({
  listingId: z.string().uuid(),
  courierCostsCents: z.number().int().min(0).optional(),
});

export const updateSaleStatusSchema = z.object({
  status: z.enum([
    "INITIATED",
    "PENDING_VERIFICATION",
    "CONFIRMED",
    "DISPATCHED",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
  ]),
  financialStatus: z
    .enum(["PENDING", "HELD_IN_ESCROW", "SETTLED", "PAID_OUT", "REFUNDED"])
    .optional(),
});

export const createCourierShipmentSchema = z.object({
  saleId: z.string().uuid(),
  direction: z.enum(["SELLER_TO_NXT", "NXT_TO_BUYER"]),
  status: z.string().optional(),
  trackingReference: z.string().optional(),
  costCents: z.number().int().min(0).optional(),
});

export const updateCourierShipmentSchema = z.object({
  status: z.string(),
  trackingReference: z.string().optional(),
});

