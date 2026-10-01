import type { Metadata } from "next";
import { headers } from "next/headers";
import { CodeBlock } from "@/shared/components/CodeBlock";
import { EVENT_TYPES } from "@/shared/lib/events";
import { listExample, sendMediaExample, sendTextExample, webhookExample } from "@/features/developer/api-examples";

export const metadata: Metadata = { title: "Documentation" };
export const dynamic = "force-dynamic";

const ENDPOINTS = [
  ["POST", "/api/v1/messages/send", "Send text, location or contact messages (202 Accepted, queued)."],
  ["POST", "/api/v1/messages/media", "Send image, video, document or audio by URL."],
  ["GET", "/api/v1/devices", "List your WhatsApp devices with status and health."],
  ["GET", "/api/v1/messages", "List messages. Query: limit, status, direction."],
];

export default async function DocsPage() {
  const h = await headers();
  const base = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`;
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-16 sm:px-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">WAME API documentation</h1>
        <p className="mt-3 text-lg text-slate-600">Send WhatsApp messages and receive events from your own applications.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Authentication</h2>
        <p className="text-slate-600">Create an API key in the dashboard (Pro and Plus plans) and send it in the <code className="rounded bg-slate-100 px-1">x-api-key</code> header, or as <code className="rounded bg-slate-100 px-1">Authorization: Bearer &lt;key&gt;</code>. Keys are shown once and stored hashed.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Endpoints</h2>
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {ENDPOINTS.map(([method, path, desc]) => (
            <div key={path} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:gap-4">
              <span className={`w-14 rounded px-2 py-0.5 text-center text-xs font-bold ${method === "POST" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>{method}</span>
              <code className="text-sm">{path}</code>
              <span className="text-sm text-slate-500 sm:ml-auto">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Examples</h2>
        <CodeBlock title="Send a text" code={sendTextExample(base)} />
        <CodeBlock title="Send media" code={sendMediaExample(base)} />
        <CodeBlock title="Read data" code={listExample(base)} />
        <p className="text-sm text-slate-600">Message fields: <code>deviceId</code> (optional — defaults to a connected device), <code>to</code>, <code>type</code> (text, image, video, document, audio, location, contact), <code>text</code>, <code>mediaUrl</code>, <code>fileName</code>, <code>latitude</code>, <code>longitude</code>, <code>contactName</code>, <code>contactPhone</code>, <code>scheduledAt</code> (ISO 8601). Status lifecycle: <code>pending → sent → delivered | failed</code>.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Webhooks</h2>
        <p className="text-slate-600">Register an HTTPS endpoint and choose events. Each delivery is signed with your webhook secret.</p>
        <div className="flex flex-wrap gap-2">{EVENT_TYPES.map((e) => <code key={e} className="rounded bg-slate-100 px-2 py-1 text-xs">{e}</code>)}</div>
        <CodeBlock title="Payload" code={webhookExample} />
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Errors & limits</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-600">
          <li><code>401</code> missing/invalid key · <code>402</code> plan limit reached · <code>403</code> feature not in plan · <code>422</code> validation error · <code>429</code> rate limited.</li>
          <li>Errors return <code>{`{ "error": "message", "code": "machine_code" }`}</code>.</li>
          <li>Rate limits per key: Pro 120 req/min, Plus 600 req/min.</li>
        </ul>
      </section>
    </div>
  );
}
