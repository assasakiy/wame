"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Modal } from "@/shared/components/Modal";
import { Alert } from "@/shared/components/Alert";
import { useApiAction } from "@/shared/hooks/useApiAction";

interface Props {
  deviceId: string;
  status: string;
  qr: string | null;
  simulated: boolean;
  open: boolean;
  onClose: () => void;
}

export function QRCodeModal({ deviceId, status, qr, simulated, open, onClose }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [phone, setPhone] = useState("6281234567890");
  const { run, loading, error } = useApiAction();

  useEffect(() => {
    let cancelled = false;
    if (qr) void QRCode.toDataURL(qr, { width: 256, margin: 1 }).then((url) => !cancelled && setImage(url));
    return () => {
      cancelled = true;
    };
  }, [qr]);

  useEffect(() => {
    if (open && status === "connected") onClose();
  }, [open, status, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="Link WhatsApp device">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          {qr && image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="WhatsApp QR code" width={256} height={256} />
          ) : (
            <span className="text-sm text-slate-500">Generating QR code…</span>
          )}
        </div>
        <p className="text-sm text-slate-600">Open WhatsApp → Settings → Linked devices → Link a device, then scan this code. The code refreshes automatically.</p>
        {simulated && (
          <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-left">
            <Alert tone="info">Simulated driver: no real phone needed. Enter a number and simulate the scan.</Alert>
            {error && <Alert tone="error">{error}</Alert>}
            <div className="flex gap-2">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Phone number" />
              <Button disabled={loading || !qr} onClick={() => void run(`/api/devices/${deviceId}`, "POST", { action: "simulate_scan", phone })}>Simulate scan</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
