import { toast } from "sonner";
import { syncRecordToIntegrations } from "@/lib/integrations.functions";

type SyncInput = {
  deviceId: string;
  kind: "inspection" | "acoustic";
  recordId: string;
  hiveLabel: string;
  title: string;
  summary: string;
  status: string;
  occurredAt: string;
  metrics: Record<string, string | number | boolean>;
};

/**
 * Fire-and-forget push of a saved record to every connected commerce/accounting
 * provider. Silent when nothing is connected; toasts per-provider outcomes.
 */
export async function autoSyncRecord(input: SyncInput) {
  if (!input.deviceId) return;
  try {
    const res = await syncRecordToIntegrations({ data: input });
    if (!res.results.length) return;
    for (const r of res.results) {
      const name = r.provider === "shopify" ? "Shopify" : "QuickBooks";
      if (r.ok) toast.success(`${name} synced`, { description: r.detail });
      else toast.error(`${name} sync failed`, { description: r.detail });
    }
  } catch {
    /* integrations are optional — never block the save flow */
  }
}
