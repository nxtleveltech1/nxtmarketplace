// Webhook handler at /api/webhook
// This matches the endpoint URL: https://nxtdotx.co.za/webhook
// Note: Clerk Dashboard should be configured with: https://nxtdotx.co.za/api/webhooks/clerk
// But this route exists as a fallback if configured incorrectly

export { POST } from "../webhooks/clerk/route";

