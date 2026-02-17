import { createUser, updateUser, getUserByClerkId } from "@/lib/db/users";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { WebhookEvent } from "@clerk/backend/webhooks";

export async function POST(req: Request) {
  const signingSecret =
    process.env.CLERK_WEBHOOK_SIGNING_SECRET || process.env.CLERK_WEBHOOK_SECRET;

  if (!signingSecret) {
    console.error("[Webhook] CLERK_WEBHOOK_SIGNING_SECRET is missing");
    return new Response(
      JSON.stringify({ error: "Webhook secret not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const evt = (await verifyWebhook(req, { signingSecret })) as WebhookEvent;
    const eventType = evt.type;
    console.log(`[Webhook] Received event: ${eventType}`);

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data as {
          id: string;
          email_addresses?: Array<{ email_address: string }>;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
        };
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

      const existingUser = await getUserByClerkId(id);
      if (existingUser) {
        console.warn(
          `[Webhook] user.created: User already exists (${id}), skipping`
        );
        return new Response("User already exists", { status: 200 });
      }

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
          role: "BUYER",
        });

        console.log(`[Webhook] Successfully created user: ${id} (${email})`);
        return new Response(
          JSON.stringify({ success: true, message: "User created" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("[Webhook] Error creating user:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return new Response(
          JSON.stringify({
            error: "Failed to create user",
            details: errorMessage,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data as {
          id: string;
          email_addresses?: Array<{ email_address: string }>;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string | null;
        };
      const email = email_addresses?.[0]?.email_address;

      const existingUser = await getUserByClerkId(id);
      if (!existingUser) {
        console.warn(
          `[Webhook] user.updated: User not found (${id}), creating instead`
        );
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
            : first_name ||
              last_name ||
              fallbackEmail.split("@")[0] ||
              "User";

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
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return new Response(
          JSON.stringify({
            error: "Failed to update user",
            details: errorMessage,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`[Webhook] Unhandled event type: ${eventType}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: `Event ${eventType} received but not handled`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Webhook] Verification failed:", err);
    return new Response(
      JSON.stringify({ error: "Invalid webhook signature" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
