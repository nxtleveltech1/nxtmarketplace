# NXT Marketplace – Core Database Schema (Neon / PostgreSQL)

> **Scope**: Core, production-ready database schema for the NXT Marketplace platform.
>
> **Database**: Neon (Serverless PostgreSQL)
>
> **Out of scope**: API layer, auth provider implementation, payment processor specifics.

---

## 1. Users & Roles

```sql
CREATE TYPE user_role AS ENUM (
  'SELLER',
  'BUYER',
  'ADMIN'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role user_role NOT NULL,
  location TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 2. Seller Profiles & Reputation

```sql
CREATE TYPE seller_tier AS ENUM (
  'STANDARD',
  'VERIFIED_SELLER',
  'GOLD_SELLER'
);

CREATE TABLE seller_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  tier seller_tier DEFAULT 'STANDARD',
  rating NUMERIC(3,2) DEFAULT 0.0,
  total_sales INT DEFAULT 0,
  failed_verifications INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 3. Listings

```sql
CREATE TYPE listing_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'UNDER_ADMIN_REVIEW',
  'REJECTED',
  'APPROVED',
  'LIVE'
);

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INT NOT NULL,
  status listing_status DEFAULT 'SUBMITTED',
  seller_location TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 4. Listing Images

```sql
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0
);
```

---

## 5. Verification & Inspection

```sql
CREATE TYPE verification_status AS ENUM (
  'NOT_REQUESTED',
  'AWAITING_ITEM',
  'IN_INSPECTION',
  'VERIFIED',
  'FAILED'
);

CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  status verification_status DEFAULT 'NOT_REQUESTED',
  inspector_notes TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 6. Sales & Transactions

```sql
CREATE TYPE sale_status AS ENUM (
  'INITIATED',
  'PENDING_VERIFICATION',
  'CONFIRMED',
  'DISPATCHED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  status sale_status DEFAULT 'INITIATED',
  sale_price_cents INT NOT NULL,
  commission_cents INT NOT NULL,
  seller_payout_cents INT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);
```

---

## 7. Courier & Logistics

```sql
CREATE TYPE courier_status AS ENUM (
  'NOT_REQUIRED',
  'AWAITING_PICKUP',
  'IN_TRANSIT',
  'RECEIVED_AT_NXT',
  'DISPATCHED_TO_BUYER',
  'DELIVERED'
);

CREATE TABLE courier_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  direction TEXT CHECK (direction IN ('SELLER_TO_NXT', 'NXT_TO_BUYER')),
  status courier_status,
  tracking_reference TEXT,
  cost_cents INT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 8. Reviews & Ratings

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  reviewer_id UUID REFERENCES users(id),
  reviewee_id UUID REFERENCES users(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 9. Messaging & Notifications

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  sale_id UUID REFERENCES sales(id),
  content TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 10. Notes & Design Principles

* All monetary values are stored in **cents** to avoid floating-point errors
* Status enums are designed to support deterministic state transitions
* Verification and logistics are decoupled for auditability
* Schema is compatible with REST, GraphQL, and event-driven architectures
* Designed for Neon branching, migrations, and read replicas

---

**Next planned documents**:

* API Contracts (OpenAPI)
* State transition guards & invariants
* ORM models (Prisma / Drizzle)
* Disputes & escrow extensions
