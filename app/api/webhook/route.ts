// Webhook handler at /api/webhook (fallback)
// Clerk Dashboard → Webhooks → Endpoint URL: https://marketplace.nxtdotx.online/api/webhooks/clerk
// Subscribe to: user.created, user.updated

export { POST } from "../webhooks/clerk/route";

