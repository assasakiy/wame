"use client";

import { Building2, FlaskConical, LogOut, Plug, QrCode, Smartphone, Trash2, Unplug } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/shared/components/Alert";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useApiAction } from "@/shared/hooks/useApiAction";
import { timeAgo } from "@/shared/utils/format";
import { QRCodeModal } from "@/features/whatsapp/components/QRCodeModal";
import { SimulateIncomingModal } from "@/features/whatsapp/components/SimulateIncomingModal";

export interface DeviceView {
  id: string;
  name: string;
  type: string;
  phone: string | null;
  status: string;
  qr: string | null;
  health: string;
  lastSeenAt: Date | null;
  reconnectCount: number;
  driver: string;
}

export function DeviceCard({ device }: { device: DeviceView }) {
  const { run, loading, error } = useApiAction();
  const [qrOpen, setQrOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const act = (action: string) => run(`/api/devices/${device.id}`, "POST", { action });
  const simulated = device.driver === "simulated";
  const connecting = device.status === "connecting" || device.status === "qr_pending";

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            {device.type === "business" ? <Building2 size={20} /> : <Smartphone size={20} />}
          </span>
          <div>
            <p className="font-semibold text-slate-900">{device.name}</p>
            <p className="text-xs text-slate-500">{device.phone ? `+${device.phone}` : "Not linked"}</p>
          </div>
        </div>
        <StatusBadge status={device.status} />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div><dt className="text-slate-500">Type</dt><dd className="mt-0.5 font-medium capitalize">{device.type}</dd></div>
        <div><dt className="text-slate-500">Health</dt><dd className="mt-0.5"><StatusBadge status={device.health} /></dd></div>
        <div><dt className="text-slate-500">Last seen</dt><dd className="mt-0.5 font-medium">{timeAgo(device.lastSeenAt)}</dd></div>
      </dl>
      {device.reconnectCount > 0 && <p className="mt-2 text-xs text-slate-500">Auto-reconnects: {device.reconnectCount}</p>}
      {simulated && <div className="mt-2"><Badge tone="purple"><FlaskConical size={12} className="mr-1" /> simulated driver</Badge></div>}
      {error && <div className="mt-3"><Alert tone="error">{error}</Alert></div>}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        {device.status === "connected" ? (
          <>
            {simulated && <Button size="sm" variant="secondary" onClick={() => setSimOpen(true)}>Simulate incoming</Button>}
            <Button size="sm" variant="secondary" disabled={loading} onClick={() => void act("disconnect")}><Unplug size={14} /> Disconnect</Button>
            <Button size="sm" variant="ghost" disabled={loading} onClick={() => window.confirm("Log out this device? You will need to scan a new QR code.") && void act("logout")}><LogOut size={14} /> Log out</Button>
          </>
        ) : connecting ? (
          <>
            <Button size="sm" onClick={() => setQrOpen(true)}><QrCode size={14} /> Show QR</Button>
            <Button size="sm" variant="secondary" disabled={loading} onClick={() => void act("disconnect")}>Cancel</Button>
          </>
        ) : (
          <Button size="sm" disabled={loading} onClick={async () => { if (await act("connect")) setQrOpen(true); }}><Plug size={14} /> Connect</Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-red-600 hover:bg-red-50"
          disabled={loading}
          aria-label="Delete device"
          onClick={() => window.confirm(`Delete device "${device.name}"? Its messages will be removed.`) && void run(`/api/devices/${device.id}`, "DELETE")}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <QRCodeModal deviceId={device.id} status={device.status} qr={device.qr} simulated={simulated} open={qrOpen} onClose={() => setQrOpen(false)} />
      <SimulateIncomingModal deviceId={device.id} open={simOpen} onClose={() => setSimOpen(false)} />
    </div>
  );
}
