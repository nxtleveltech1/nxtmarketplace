# Database Setup Guide

This project uses **Neon PostgreSQL** with **Drizzle ORM** for type-safe database operations.

## Database Configuration

- **Database**: Neon PostgreSQL (serverless)
- **ORM**: Drizzle ORM
- **Connection**: Configured via `DATABASE_URL` in `.env.local`

## Environment Variables

Add these to your `.env.local`:

```bash
# Neon Database
DATABASE_URL=postgresql://your-connection-string

# Clerk Webhook (for user sync)
CLERK_WEBHOOK_SIGNING_SECRET=whsec_your_signing_secret
```

## Database Schema

### Users Table

The `users` table syncs with Clerk authentication:

- `id` - Primary key (UUID, auto-generated)
- `clerk_id` - Clerk user ID (unique)
- `email` - User email (unique)
- `display_name` - User display name (required)
- `role` - User role: SELLER, BUYER, ADMIN (default: BUYER)
- `location` - User location (optional)
- `first_name` - User first name (optional, for backward compatibility)
- `last_name` - User last name (optional, for backward compatibility)
- `image_url` - Profile image URL (optional)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Seller Profiles Table

- `user_id` - Primary key, references users(id)
- `tier` - Seller tier: STANDARD, VERIFIED_SELLER, GOLD_SELLER (default: STANDARD)
- `rating` - Average rating (numeric 3,2)
- `total_sales` - Total number of completed sales
- `failed_verifications` - Count of failed verifications
- `created_at` - Timestamp

### Listings Table

- `id` - Primary key (UUID)
- `seller_id` - References users(id)
- `title` - Listing title
- `description` - Listing description
- `price_cents` - Price in cents (integer)
- `status` - Listing status: DRAFT, SUBMITTED, UNDER_ADMIN_REVIEW, REJECTED, APPROVED, LIVE
- `seller_location` - Seller location (optional)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Listing Images Table

- `id` - Primary key (UUID)
- `listing_id` - References listings(id) ON DELETE CASCADE
- `image_url` - Image URL
- `sort_order` - Sort order (integer, default: 0)

### Verifications Table

- `id` - Primary key (UUID)
- `listing_id` - References listings(id)
- `status` - Verification status: NOT_REQUESTED, AWAITING_ITEM, IN_INSPECTION, VERIFIED, FAILED
- `inspector_notes` - Admin inspection notes (optional)
- `verified_at` - Timestamp when verified (optional)
- `created_at` - Timestamp

### Sales Table

- `id` - Primary key (UUID)
- `listing_id` - References listings(id)
- `buyer_id` - References users(id)
- `seller_id` - References users(id)
- `status` - Sale status: INITIATED, PENDING_VERIFICATION, CONFIRMED, DISPATCHED, DELIVERED, COMPLETED, CANCELLED
- `financial_status` - Financial status: PENDING, HELD_IN_ESCROW, SETTLED, PAID_OUT, REFUNDED
- `sale_price_cents` - Sale price in cents
- `commission_cents` - Commission (20% of sale price)
- `seller_payout_cents` - Seller payout (sale_price - commission - courier_costs)
- `created_at` - Timestamp
- `completed_at` - Timestamp when completed (optional)

### Courier Shipments Table

- `id` - Primary key (UUID)
- `sale_id` - References sales(id)
- `direction` - Direction: SELLER_TO_NXT, NXT_TO_BUYER
- `status` - Courier status: NOT_REQUIRED, AWAITING_PICKUP, IN_TRANSIT, RECEIVED_AT_NXT, DISPATCHED_TO_BUYER, DELIVERED
- `tracking_reference` - Tracking reference (optional)
- `cost_cents` - Courier cost in cents (optional)
- `created_at` - Timestamp

### Reviews Table

- `id` - Primary key (UUID)
- `sale_id` - References sales(id)
- `reviewer_id` - References users(id)
- `reviewee_id` - References users(id)
- `rating` - Rating (1-5, integer)
- `comment` - Review comment (optional)
- `created_at` - Timestamp

### Messages Table

- `id` - Primary key (UUID)
- `sender_id` - References users(id)
- `recipient_id` - References users(id)
- `sale_id` - References sales(id) (optional)
- `content` - Message content
- `read` - Read status (boolean, default: false)
- `created_at` - Timestamp

## Available Scripts

```bash
# Generate migration files from schema changes
bun run db:generate

# Push schema changes directly to database (development)
bun run db:push

# Run migrations (production)
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio
```

## Usage Examples

### Query Users

```typescript
import { getUserByClerkId, getUserByEmail } from "@/lib/db/users";

// Get user by Clerk ID
const user = await getUserByClerkId("user_xxx");

// Get user by email
const user = await getUserByEmail("user@example.com");
```

### Direct Database Access

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Query users
const allUsers = await db.select().from(users);

// Query with conditions
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, "user@example.com"))
  .limit(1);
```

### API Route Example

```typescript
// app/api/users/route.ts
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  
  const user = await getUserByClerkId(userId);
  return Response.json(user);
}
```

## Clerk Webhook Integration

The app automatically syncs Clerk users to the database via webhook:

1. **Webhook URL**: `/api/webhooks/clerk`
2. **Events**: `user.created`, `user.updated`
3. **Setup**: Add webhook endpoint in Clerk Dashboard → Webhooks

## Business Workflows

### Listing Submission Flow

1. Seller creates listing → Status: DRAFT
2. Seller submits → Status: SUBMITTED
3. Admin reviews → Status: UNDER_ADMIN_REVIEW
4. Admin decision → Status: APPROVED or REJECTED
5. If APPROVED → Status: LIVE (public visibility)

### Verification Workflow

1. Seller requests verification → Status: AWAITING_ITEM
2. Item arrives at NXT → Status: IN_INSPECTION
3. Admin inspects → Status: VERIFIED or FAILED
4. VERIFIED badge applied to listing

### Sale & Purchase Flow

1. Buyer purchases → Create sale (Status: INITIATED)
2. If listing VERIFIED → Status: CONFIRMED → Initiate outbound courier
3. If NOT VERIFIED → Status: PENDING_VERIFICATION → Notify seller to ship
4. Calculate commission (20%) and seller payout
5. Track courier status → Status: DISPATCHED → DELIVERED
6. On delivery confirmation → Status: COMPLETED → Release payout

### Commission Calculation

- Fixed 20% commission on sale_price_cents
- commission_cents = Math.floor(sale_price_cents * 0.2)
- seller_payout_cents = sale_price_cents - commission_cents - courier_costs

## Adding New Tables

1. Create schema file in `db/schema/`:
```typescript
// db/schema/posts.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

2. Export from `db/schema/index.ts`:
```typescript
export * from "./posts";
```

3. Generate and push migration:
```bash
bun run db:generate
bun run db:push
```

## Database Studio

View and edit your database with Drizzle Studio:

```bash
bun run db:studio
```

This opens a web interface at `http://localhost:4983` where you can browse tables, run queries, and edit data.
