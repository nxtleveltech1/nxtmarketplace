import { listingImages, listings, users, verifications } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

// Sample products with images from marketplaceplatform
const audioVisualProducts = [
  // MICROPHONES
  {
    title: "Professional Studio Condenser Microphone",
    description:
      "High-quality large diaphragm condenser microphone perfect for vocals, podcasts, and streaming. Features XLR connection, cardioid polar pattern, 20Hz-20kHz frequency response. Includes shock mount and pop filter. Ideal for home studios and professional recording.",
    priceCents: 29999, // $299.99
    sellerLocation: "Los Angeles, CA",
    images: ["/studio-condenser-microphone.jpg", "/microphone-with-shock-mount.jpg", "/microphone-pop-filter.png"],
  },
  {
    title: "USB Dynamic Microphone for Podcasting",
    description:
      "Plug-and-play USB dynamic microphone with cardioid pattern. Built-in headphone jack for zero-latency monitoring, mute button, and gain control. Perfect for podcasting, voiceovers, and streaming. No interface needed - works directly with your computer.",
    priceCents: 14999, // $149.99
    sellerLocation: "Austin, TX",
    images: ["/usb-dynamic-podcast-microphone-black.jpg", "/usb-microphone-side-view.jpg", "/microphone-pop-filter.png"],
  },

  // CAMERAS
  {
    title: "Mirrorless Camera 4K Video Recording",
    description:
      "Professional mirrorless camera with 24MP sensor, 4K 60fps video, in-body stabilization, flip-out touchscreen, and dual card slots. Includes 18-55mm kit lens, battery, charger, and camera bag. Perfect for photography and videography.",
    priceCents: 129999, // $1,299.99
    sellerLocation: "New York, NY",
    images: ["/mirrorless-camera-body.jpg", "/camera-with-lens-attached.jpg", "/camera-flip-screen.jpg"],
  },
  {
    title: "4K Webcam Pro with Auto-Focus",
    description:
      "Professional 4K webcam with Sony sensor, auto-focus, dual microphones, and adjustable field of view. Perfect for streaming, video conferencing, and content creation. USB-C connection with universal compatibility. Includes tripod mount and privacy cover.",
    priceCents: 17999, // $179.99
    sellerLocation: "San Francisco, CA",
    images: ["/4k-webcam.jpg", "/webcam-on-monitor.jpg", "/webcam-with-tripod.jpg"],
  },

  // AUDIO INTERFACES
  {
    title: "USB Audio Interface 2-Channel",
    description:
      "Professional 2-channel USB audio interface with 24-bit/192kHz conversion. Two XLR/TRS combo inputs with preamps, phantom power, direct monitoring, MIDI I/O. Compatible with all major DAWs. Perfect for home recording and podcasting.",
    priceCents: 14999, // $149.99
    sellerLocation: "Austin, TX",
    images: ["/usb-audio-interface.jpg", "/audio-interface-back-panel.jpg", "/audio-interface-setup.jpg"],
  },
  {
    title: "Thunderbolt Audio Interface 8-Channel",
    description:
      "High-end 8-channel Thunderbolt audio interface with pristine preamps, 32-bit/192kHz converters, DSP effects processing, and ultra-low latency. Features ADAT expansion, wordclock, and comprehensive I/O. Professional studio quality for recording and mixing.",
    priceCents: 79999, // $799.99
    sellerLocation: "Los Angeles, CA",
    images: ["/professional-audio-interface.jpg", "/audio-interface-rear-connections.jpg", "/studio-desk-with-interface.jpg"],
  },

  // HEADPHONES & MONITORS
  {
    title: "Wireless Bluetooth Headphones - Noise Cancelling",
    description:
      "Premium over-ear headphones with active noise cancellation. 30-hour battery life, premium leather ear cushions, Bluetooth 5.0, built-in microphone for calls. Perfect for music production, gaming, or everyday listening. Comes with carrying case and cables.",
    priceCents: 17999, // $179.99
    sellerLocation: "San Francisco, CA",
    images: ["/wireless-bluetooth-headphones.jpg", "/headphones-carrying-case.jpg", "/headphones-detail.jpg"],
  },
  {
    title: "Studio Monitor Speakers Pair - 5 Inch",
    description:
      "Pair of 5-inch powered studio monitors with bi-amplified design. 50W per speaker, frequency response 52Hz-35kHz, XLR and TRS inputs, front-facing bass port. Excellent for music production, mixing, and mastering. Includes isolation pads and cables.",
    priceCents: 34999, // $349.99
    sellerLocation: "Los Angeles, CA",
    images: ["/studio-monitor-speakers.jpg", "/monitor-speakers-pair.jpg", "/studio-setup-monitors.jpg"],
  },
  {
    title: "Professional Studio Headphones - Closed Back",
    description:
      "Reference-quality closed-back studio headphones with 45mm drivers. Frequency response 5Hz-40kHz, detachable cables, comfortable over-ear design for extended sessions. Perfect for tracking, mixing, and critical listening. Includes straight and coiled cables.",
    priceCents: 24999, // $249.99
    sellerLocation: "New York, NY",
    images: ["/professional-studio-headphones.jpg", "/headphones-with-cables.jpg", "/headphones-on-stand.jpg"],
  },

  // LIGHTING
  {
    title: "LED Ring Light 18 Inch with Stand",
    description:
      "Professional 18-inch LED ring light with adjustable color temperature (3200K-5600K), dimmable brightness, phone holder, and 6ft stand. Perfect for photography, video recording, makeup tutorials, and live streaming. Includes remote control.",
    priceCents: 8999, // $89.99
    sellerLocation: "Los Angeles, CA",
    images: ["/led-ring-light-on-stand.jpg", "/ring-light-with-phone.jpg"],
  },

  // RECORDING EQUIPMENT
  {
    title: "Portable Digital Audio Recorder",
    description:
      "Handheld digital recorder with 4-track recording, built-in stereo mics, XLR/TRS inputs. Records to SD card in WAV/MP3 format. Perfect for field recording, interviews, podcasts, and music. Includes windscreen, 32GB SD card, and batteries.",
    priceCents: 19999, // $199.99
    sellerLocation: "New York, NY",
    images: ["/portable-audio-recorder.jpg", "/digital-recorder-display.jpg", "/recorder-accessories.jpg"],
  },
  {
    title: "MIDI Keyboard Controller 49-Key",
    description:
      "49-key semi-weighted MIDI controller with velocity-sensitive keys, 8 drum pads, 8 knobs, 9 faders. USB powered, plug-and-play with all major DAWs. Perfect for music production and live performance. Includes comprehensive software bundle.",
    priceCents: 12999, // $129.99
    sellerLocation: "Austin, TX",
    images: ["/midi-keyboard-controller.jpg", "/midi-controller-pads.jpg"],
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

    // Create listings with images
    const createdListings = [];
    let totalImagesCreated = 0;

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

      // Create images for the listing
      if (product.images && product.images.length > 0) {
        const imageRecords = product.images.map((imageUrl, index) => ({
          listingId: listing.id,
          imageUrl,
          sortOrder: index,
        }));

        await db.insert(listingImages).values(imageRecords);
        totalImagesCreated += imageRecords.length;
      }

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
    console.log(`✅ Created ${totalImagesCreated} listing images`);
    console.log(`✅ Created ${Math.floor(createdListings.length / 2)} verified listings`);
    console.log("🎉 Seed process completed!");

    return {
      success: true,
      listingsCreated: createdListings.length,
      imagesCreated: totalImagesCreated,
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

