import { createUser, updateUser, getUserByClerkId } from "@/lib/db/users";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[Webhook] CLERK_WEBHOOK_SECRET is missing");
    return new Response(
      JSON.stringify({ error: "Webhook secret not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("[Webhook] Missing svix headers", {
        has_svix_id: !!svix_id,
        has_svix_timestamp: !!svix_timestamp,
        has_svix_signature: !!svix_signature,
      });
      return new Response(
        JSON.stringify({ error: "Missing required svix headers" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the body
    let payload: unknown;
    try {
      payload = await req.json();
    } catch (err) {
      console.error("[Webhook] Failed to parse JSON body:", err);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log(`[Webhook] Received event: ${eventType}`);

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses?.[0]?.email_address || "";

      if (!email) {
        console.error("[Webhook] user.created: No email address provided", {
          clerkId: id,
          email_addresses,
        });
        return new Response(
          JSON.stringify({ error: "No email address provided" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check if user already exists
      const existingUser = await getUserByClerkId(id);
      if (existingUser) {
        console.warn(`[Webhook] user.created: User already exists (${id}), skipping`);
        return new Response("User already exists", { status: 200 });
      }

      // Generate displayName from firstName/lastName or use email
      const displayName =
        first_name && last_name
          ? `${first_name} ${last_name}`.trim()
          : first_name || last_name || email.split("@")[0] || "User";

      try {
        await createUser({
          clerkId: id,
          email,
          displayName,
          firstName: first_name || undefined,
          lastName: last_name || undefined,
          imageUrl: image_url || undefined,
          role: "BUYER", // Default role
        });

        console.log(`[Webhook] Successfully created user: ${id} (${email})`);
        return new Response(
          JSON.stringify({ success: true, message: "User created" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("[Webhook] Error creating user:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
          JSON.stringify({ error: "Failed to create user", details: errorMessage }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses?.[0]?.email_address;

      // Check if user exists
      const existingUser = await getUserByClerkId(id);
      if (!existingUser) {
        console.warn(`[Webhook] user.updated: User not found (${id}), creating instead`);
        // Fallback to creating user if update fails
        const fallbackEmail = email || "";
        if (!fallbackEmail) {
          return new Response(
            JSON.stringify({ error: "User not found and no email provided" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        const displayName =
          first_name && last_name
            ? `${first_name} ${last_name}`.trim()
            : first_name || last_name || fallbackEmail.split("@")[0] || "User";

        try {
          await createUser({
            clerkId: id,
            email: fallbackEmail,
            displayName,
            firstName: first_name || undefined,
            lastName: last_name || undefined,
            imageUrl: image_url || undefined,
            role: "BUYER",
          });
          return new Response(
            JSON.stringify({ success: true, message: "User created (fallback)" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          console.error("[Webhook] Error creating user (fallback):", error);
          return new Response(
            JSON.stringify({ error: "Failed to create user" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      // Generate displayName from firstName/lastName or use email
      const displayName =
        first_name && last_name
          ? `${first_name} ${last_name}`.trim()
          : first_name ||
            last_name ||
            (email ? email.split("@")[0] : existingUser.displayName) ||
            "User";

      try {
        await updateUser(id, {
          email,
          displayName,
          firstName: first_name || undefined,
          lastName: last_name || undefined,
          imageUrl: image_url || undefined,
        });

        console.log(`[Webhook] Successfully updated user: ${id}`);
        return new Response(
          JSON.stringify({ success: true, message: "User updated" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("[Webhook] Error updating user:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
          JSON.stringify({ error: "Failed to update user", details: errorMessage }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Unhandled event type
    console.log(`[Webhook] Unhandled event type: ${eventType}`);
    return new Response(
      JSON.stringify({ success: true, message: `Event ${eventType} received but not handled` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Webhook] Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

