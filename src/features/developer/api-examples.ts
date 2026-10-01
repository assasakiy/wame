export const sendTextExample = (base: string) => `curl -X POST ${base}/api/v1/messages/send \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "6281234567890",
    "type": "text",
    "text": "Hello from WAME!"
  }'`;

export const sendMediaExample = (base: string) => `curl -X POST ${base}/api/v1/messages/media \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "6281234567890",
    "type": "image",
    "mediaUrl": "https://example.com/promo.jpg",
    "text": "Weekend promo!"
  }'`;

export const listExample = (base: string) => `curl ${base}/api/v1/devices -H "x-api-key: YOUR_API_KEY"
curl "${base}/api/v1/messages?limit=20&status=failed" -H "x-api-key: YOUR_API_KEY"`;

export const webhookExample = `{
  "event": "message.received",
  "data": { "deviceId": "…", "from": "6281234567890", "text": "Halo" },
  "timestamp": "2026-01-01T10:00:00.000Z"
}
// Header: x-wame-signature = HMAC-SHA256(secret, rawBody) (hex)`;
