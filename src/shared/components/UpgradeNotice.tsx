import Link from "next/link";
import { Alert } from "@/shared/components/Alert";

export function UpgradeNotice({ feature }: { feature: string }) {
  return (
    <Alert tone="warning">
      {feature} is not included in your current plan.{" "}
      <Link href="/subscription" className="font-semibold underline">Upgrade your plan</Link> to unlock it.
    </Alert>
  );
}
