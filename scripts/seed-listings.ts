import { listings, users, verifications } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

const audioVisualProducts = [
  {
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    description: "Premium over-ear headphones with industry-leading noise cancellation, 30-hour battery life, and exceptional sound quality. Perfect for music lovers and professionals. Includes carrying case and charging cable.",
    priceCents: 39900, // $399.00
    sellerLocation: "Cape Town, South Africa",
  },
  {
    title: "Bose QuietComfort 45 Bluetooth Headphones",
    description: "Comfortable noise-cancelling headphones with balanced audio performance. Great for travel and daily use. Lightweight design with plush ear cushions.",
    priceCents: 32900, // $329.00
    sellerLocation: "Johannesburg, South Africa",
  },
  {
    title: "Apple AirPods Pro (2nd Generation)",
    description: "Active Noise Cancellation, Spatial Audio, and Adaptive Transparency. MagSafe charging case included. Perfect condition, barely used.",
    priceCents: 24900, // $249.00
    sellerLocation: "Durban, South Africa",
  },
  {
    title: "Samsung 55\" QLED 4K Smart TV (2023 Model)",
    description: "Crystal clear 4K resolution, Quantum HDR, and built-in Smart Hub. Includes wall mount bracket. Excellent condition, original packaging.",
    priceCents: 89900, // $899.00
    sellerLocation: "Pretoria, South Africa",
  },
  {
    title: "LG 65\" OLED 4K Smart TV",
    description: "Perfect black levels, infinite contrast, and Dolby Vision IQ. WebOS smart platform. Like new condition with all accessories.",
    priceCents: 129900, // $1,299.00
    sellerLocation: "Cape Town, South Africa",
  },
  {
    title: "Sony A7 III Mirrorless Camera Body",
    description: "24.2MP full-frame sensor, 4K video recording, and 693-point autofocus system. Professional-grade camera in excellent condition. Includes battery and charger.",
    priceCents: 179900, // $1,799.00
    sellerLocation: "Johannesburg, South Africa",
  },
  {
    title: "Canon EOS R6 Mark II Mirrorless Camera",
    description: "24.2MP full-frame sensor, 40fps continuous shooting, and advanced autofocus. Perfect for photography and videography. Includes original box and accessories.",
    priceCents: 249900, // $2,499.00
    sellerLocation: "Cape Town, South Africa",
  },
  {
    title: "JBL Flip 6 Portable Bluetooth Speaker",
    description: "Waterproof portable speaker with powerful bass and 12-hour battery life. IPX7 rated. Great for outdoor adventures and parties.",
    priceCents: 12900, // $129.00
    sellerLocation: "Durban, South Africa",
  },
  {
    title: "Sonos Beam Gen 2 Soundbar",
    description: "Compact smart soundbar with Dolby Atmos, voice control, and room-filling sound. Perfect for enhancing TV audio. Includes all cables.",
    priceCents: 44900, // $449.00
    sellerLocation: "Pretoria, South Africa",
  },
  {
    title: "DJI Mini 3 Pro Drone with 4K Camera",
    description: "Compact drone with 4K HDR video, 48MP photos, and 34-minute flight time. Includes remote controller, batteries, and carrying case.",
    priceCents: 89900, // $899.00
    sellerLocation: "Johannesburg, South Africa",
  },
  {
    title: "GoPro HERO 11 Black Action Camera",
    description: "5.3K video, 27MP photos, and HyperSmooth 5.0 stabilization. Waterproof up to 33ft. Includes mounts, batteries, and accessories.",
    priceCents: 39900, // $399.00
    sellerLocation: "Cape Town, South Africa",
  },
  {
    title: "Audio-Technica AT2020USB+ USB Microphone",
    description: "Professional USB condenser microphone perfect for streaming, podcasting, and recording. Includes stand mount and USB cable.",
    priceCents: 14900, // $149.00
    sellerLocation: "Durban, South Africa",
  },
  {
    title: "Yamaha HS8 Studio Monitor Speakers (Pair)",
    description: "8-inch powered studio monitors with exceptional accuracy. Perfect for music production and mixing. Professional grade equipment.",
    priceCents: 69900, // $699.00
    sellerLocation: "Johannesburg, South Africa",
  },
  {
    title: "Focusrite Scarlett 2i2 (3rd Gen) Audio Interface",
    description: "2-in/2-out USB audio interface with high-quality preamps. Perfect for home recording studios. Includes USB cable and software.",
    priceCents: 16900, // $169.00
    sellerLocation: "Cape Town, South Africa",
  },
  {
    title: "Sennheiser HD 660S Open-Back Headphones",
    description: "Reference-class headphones with exceptional detail and clarity. Open-back design for natural soundstage. Perfect for audiophiles.",
    priceCents: 49900, // $499.00
    sellerLocation: "Pretoria, South Africa",
  },
];

async function seedListings() {
  console.log("🌱 Starting seed process...");

  try {
    // Get or create a test seller user
    let seller = await db
      .select()
      .from(users)
      .where(eq(users.email, "seller@nxtmarketplace.com"))
      .limit(1);

    if (seller.length === 0) {
      console.log("Creating test seller user...");
      const [newSeller] = await db
        .insert(users)
        .values({
          clerkId: "seed_seller_001",
          email: "seller@nxtmarketplace.com",
          displayName: "Audio Visual Pro",
          role: "SELLER",
          location: "South Africa",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      seller = [newSeller];
      console.log("✅ Created seller user");
    } else {
      console.log("✅ Using existing seller user");
    }

    const sellerId = seller[0].id;
    console.log(`📦 Creating ${audioVisualProducts.length} listings...`);

    // Create listings
    const createdListings = [];
    for (const product of audioVisualProducts) {
      const [listing] = await db
        .insert(listings)
        .values({
          sellerId,
          title: product.title,
          description: product.description,
          priceCents: product.priceCents,
          sellerLocation: product.sellerLocation,
          status: "LIVE", // Set directly to LIVE for seed data
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      createdListings.push(listing);

      // Create verification for some listings (every other one)
      if (createdListings.length % 2 === 0) {
        await db.insert(verifications).values({
          listingId: listing.id,
          status: "VERIFIED",
          verifiedAt: new Date(),
          createdAt: new Date(),
        });
      }
    }

    console.log(`✅ Successfully created ${createdListings.length} listings`);
    console.log(`✅ Created ${Math.floor(createdListings.length / 2)} verified listings`);
    console.log("🎉 Seed process completed!");

    return {
      success: true,
      listingsCreated: createdListings.length,
      verifiedListings: Math.floor(createdListings.length / 2),
    };
  } catch (error) {
    console.error("❌ Error seeding listings:", error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedListings()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

export { seedListings };

