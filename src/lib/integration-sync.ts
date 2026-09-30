import { toast } from "sonner";
import { syncRecordToIntegrations } from "@/lib/integrations.functions";

export type SyncRecordInput = {
  deviceId: string;
  kind: "inspection" | "acoustic" | "task" | "harvest";
  recordId: string;
  hiveLabel: string;
  title: string;
  summary: string;
  status: string;
  occurredAt: string;
  metrics?: Record<string, string | number | boolean>;
};

export type SyncModuleInput = {
  module: string;
  recordId: string;
  action?: string;
  data?: any;
  deviceId?: string;
};

export type SyncInput = SyncRecordInput | SyncModuleInput;

/**
 * Fire-and-forget push of a saved record to every connected commerce/accounting
 * provider. Silent when nothing is connected; toasts per-provider outcomes.
 */
export async function autoSyncRecord(input: SyncInput) {
  if ("module" in input) {
    const deviceId = input.deviceId || input.data?.deviceId || input.data?.device_id;
    if (!deviceId) return;
    try {
      const res = await syncRecordToIntegrations({
        data: {
          deviceId,
          kind: (input.module === "sound" ? "acoustic" : "inspection") as "inspection" | "acoustic",
          recordId: input.recordId,
          hiveLabel: input.data?.hive_label || input.data?.hiveLabel || "Hive",
          title: `${input.module}: ${input.action || "record"}`,
          summary: input.data?.content || input.data?.notes || "Module sync record",
          status: input.data?.status || "completed",
          occurredAt: input.data?.date || input.data?.created_at || new Date().toISOString(),
          metrics: {},
        },
      });
      if (!res.results.length) return;
      for (const r of res.results) {
        const name = r.provider === "shopify" ? "Shopify" : "QuickBooks";
        if (r.ok) toast.success(`${name} synced`, { description: r.detail });
        else toast.error(`${name} sync failed`, { description: r.detail });
      }
    } catch {
      /* integrations are optional — never block the save flow */
    }
    return;
  }

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
