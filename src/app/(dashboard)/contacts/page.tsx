import type { Metadata } from "next";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/DataTable";
import { DeleteButton } from "@/shared/components/DeleteButton";
import { PageHeader } from "@/shared/components/PageHeader";
import { UsageMeter } from "@/shared/components/UsageMeter";
import { formatDate } from "@/shared/utils/format";
import { ContactForm } from "@/features/contacts/components/ContactForm";
import { ContactImport } from "@/features/contacts/components/ContactImport";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { listContacts } from "@/modules/messages/application/contact.service";
import { getUsage } from "@/modules/subscription/application/limits";
import { getSubscription } from "@/modules/subscription/application/subscription.service";

export const metadata: Metadata = { title: "Contacts" };
export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const user = await requirePagePermission("contacts.manage");
  const [rows, sub, usage] = await Promise.all([listContacts(user.tenantId), getSubscription(user.tenantId), getUsage(user.tenantId)]);
  return (
    <>
      <PageHeader title="Contacts" description="Your audience. New inbound senders are added automatically. Tags create broadcast segments." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:order-2">
          <Card title="Add contact"><ContactForm /></Card>
          <Card title="Bulk import"><ContactImport /></Card>
          <Card><UsageMeter label="Contacts" used={usage.contacts} limit={sub.limits.contacts} /></Card>
        </div>
        <Card title={`All contacts (${rows.length})`} padded={false} className="lg:order-1 lg:col-span-2">
          <DataTable
            rows={rows}
            rowKey={(c) => c.id}
            emptyTitle="No contacts yet"
            columns={[
              { header: "Name", cell: (c) => <span className="font-medium text-slate-900">{c.name}</span> },
              { header: "Phone", cell: (c) => <span className="font-mono text-xs">{c.phone}</span> },
              { header: "Tags", cell: (c) => <div className="flex flex-wrap gap-1">{c.tags.map((t) => <Badge key={t} tone="blue">{t}</Badge>)}</div> },
              { header: "Added", cell: (c) => <span className="text-xs text-slate-500">{formatDate(c.createdAt)}</span> },
              { header: "", cell: (c) => <DeleteButton path={`/api/contacts/${c.id}`} confirm="Delete this contact?" label="" /> },
            ]}
          />
        </Card>
      </div>
    </>
  );
}
