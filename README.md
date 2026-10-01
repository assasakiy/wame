# WAME — WhatsApp Gateway SaaS

Multi-tenant WhatsApp gateway with dashboard, REST API, automation, broadcast, AI agents, RBAC and subscriptions.
One repository · one Node.js process · one port · one container.

## Quick start

```bash
cp .env.example .env        # edit secrets
docker compose up -d        # wame-app + postgres + redis → http://localhost:3000
```

Local development (PostgreSQL required):

```bash
npm install
npx drizzle-kit push        # create tables
npm run dev
```

First login: `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (default `admin@wame.local` / `ChangeMe123!` — **change it**). The seed (permissions, roles, plans, admin) runs automatically at server start.

## Architecture

```
Browser ─► Next.js server (single port)
            ├─ src/app/            presentation: pages, REST route handlers, SSE stream
            ├─ src/modules/<m>/    domain · application (services) · infrastructure · presentation
            ├─ src/features/<f>/   UI components per feature
            ├─ src/shared/         config, lib (http, crypto, logger, events), components, hooks
            ├─ src/db/             Drizzle schema + client
            └─ src/instrumentation.ts → background worker (queue, scheduler, health, expiry)
```

Modules: `auth`, `rbac`, `subscription`, `whatsapp`, `messages`, `automation`, `ai-agent`, `api`, `users`.
Route handlers only parse/authorize and delegate to services; business logic lives in `modules/*/application`.

### Deviations from the original brief (and why)

| Brief | This build | Reason |
|---|---|---|
| Fastify + Vite | Next.js (React, TS strict, Tailwind) | Runs as one Node server on one port in the managed runtime |
| Prisma | Drizzle ORM | Already provisioned; same relational model |
| Socket.IO | Server-Sent Events (`GET /api/realtime`) | Socket.IO needs a custom HTTP server; same event names |
| Redis + BullMQ | Postgres-backed queue (atomic claim, retries with backoff, per-device rate limit, `scheduled_at`) | Zero extra infra; Redis is in compose for the BullMQ swap |
| Baileys | `WhatsAppDriver` port + **simulated** driver | Baileys needs a real WhatsApp account; see below |

### WhatsApp engine and Baileys

`src/modules/whatsapp/domain/driver.ts` defines the transport contract (`start`, `stop`, `send`, callbacks for QR, connect, disconnect, inbound and delivery). The engine (device lifecycle, auto-reconnect with backoff, health heartbeat, session restore on boot) only talks to this interface. The default `SimulatedDriver` emits QR codes, lets you scan from the UI, delivers messages and can inject inbound ones — enough to exercise every feature end to end.

To go live with real WhatsApp: `npm i @whiskeysockets/baileys`, implement `WhatsAppDriver` (persist auth state in the DB or a volume), return it from `driver-factory.ts` for `WA_DRIVER=baileys`.

### Realtime events

`device.connected`, `device.disconnected`, `qr.updated`, `message.received`, `message.sent`, `message.delivered`, `message.failed`, `automation.executed`, `subscription.updated`. Delivered to the browser over SSE and to customers over signed webhooks (`x-wame-signature` = HMAC-SHA256 of the body).

### Queue

Messages are rows with status `pending → sending → sent → delivered | failed`. The worker (1 s tick) claims due rows atomically, enforces max 2 messages/device/tick, retries 3× with backoff, and honours `scheduled_at` (scheduled messages, reminders, broadcasts spread by `ratePerMinute`).

### Automation

Auto-reply and workflow share one engine: **trigger** (any / contains / exact / starts-with / regex) → **conditions** (tag, text, time window) → **actions** (send message, add tag, call webhook, AI reply). Variables: `{{name}} {{phone}} {{text}}`.

### AI agents

Customer Service, Automation, Marketing and Admin agents call **tools** (`src/modules/ai-agent/application/tools.ts`) scoped to the caller's tenant: usage, devices, knowledge search, automations, create auto-reply, segments, customer analysis, message reports, system health.
With `OPENAI_API_KEY` (any OpenAI-compatible endpoint) a tool-calling LLM drives them; without it a deterministic rules engine routes to the same tools. The Customer Service agent can auto-answer unmatched inbound chats using the knowledge base and conversation history.

### RBAC & subscriptions

Dynamic roles with granular permissions (`users.manage`, `devices.manage`, `messages.send`, …) editable at `/admin/roles`. System roles: `SUPER_ADMIN` (everything) and `USER`. Plans FREE / PRO / PLUS define limits (devices, messages/month, contacts, automations, AI requests, webhooks) and features (API, broadcast, workflows, advanced automation), enforced server-side. Upgrades create invoices through a `PaymentProvider` port (sandbox provider included — plug in Midtrans/Xendit/Stripe). Expired plans auto-downgrade to FREE.

## Developer API

```bash
curl -X POST http://localhost:3000/api/v1/messages/send \
  -H "x-api-key: wame_…" -H "Content-Type: application/json" \
  -d '{"to":"6281234567890","type":"text","text":"Hello!"}'
```

Endpoints: `POST /api/v1/messages/send`, `POST /api/v1/messages/media`, `GET /api/v1/devices`, `GET /api/v1/messages`. Full docs at `/docs`. Rate limits per plan (Pro 120/min, Plus 600/min).

## Security

scrypt password hashing · opaque, hashed, rotating session tokens in HttpOnly cookies · login/register/reset rate limits · zod validation on every input · tenant-scoped queries · API keys stored as SHA-256 · signed webhooks · audit log. Set `COOKIE_SECURE=true` behind HTTPS and `EXPOSE_RESET_LINK=false` once a mail transport exists (password-reset emails are not implemented yet).

## Scaling notes

Rate limiting and the event bus are in-process; for several instances move them to Redis (pub/sub for SSE, BullMQ for the queue). The queue claim is already atomic in Postgres, so multiple workers will not double-send.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run typecheck`
