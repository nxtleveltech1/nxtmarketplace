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
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Database Schema

### Users Table

The `users` table syncs with Clerk authentication:

- `id` - Primary key (nanoid)
- `clerk_id` - Clerk user ID (unique)
- `email` - User email (unique)
- `first_name` - User first name
- `last_name` - User last name
- `image_url` - Profile image URL
- `created_at` - Timestamp
- `updated_at` - Timestamp

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

## Adding New Tables

1. Create schema file in `db/schema/`:
```typescript
// db/schema/posts.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
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

