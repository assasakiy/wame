import Link from "next/link";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { ButtonLink } from "@/shared/components/ButtonLink";

interface Props {
  devices: { id: string; name: string; phone: string | null; status: string; health: string }[];
}

export function DeviceWidget({ devices }: Props) {
  if (!devices.length) {
    return <EmptyState title="No devices linked" description="Connect your first WhatsApp number." action={<ButtonLink href="/devices" size="sm">Add device</ButtonLink>} />;
  }
  return (
    <ul className="divide-y divide-slate-100">
      {devices.slice(0, 5).map((d) => (
        <li key={d.id}>
          <Link href="/devices" className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{d.name}</p>
              <p className="text-xs text-slate-500">{d.phone ? `+${d.phone}` : "Not linked"}</p>
            </div>
            <StatusBadge status={d.status === "connected" ? d.health : d.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
