import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const providerSchema = z.enum(["shopify", "quickbooks", "etims"]);

const saveSchema = z.object({
  deviceId: z.string().min(4),
  provider: providerSchema,
  config: z.record(z.string(), z.string()).default({}),
  secrets: z.record(z.string(), z.string()).default({}),
});

const actionSchema = z.object({
  deviceId: z.string().min(4),
  provider: providerSchema,
});

type Secrets = Record<string, string>;
type Config = Record<string, string>;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function log(deviceId: string, provider: string, event: string, status: string, detail?: string) {
  const db = await admin();
  await db.from("integration_sync_logs").insert({ device_id: deviceId, provider, event, status, detail: detail ?? null });
}

async function loadCreds(deviceId: string, provider: string): Promise<{ config: Config; secrets: Secrets }> {
  const db = await admin();
  const [{ data: conn }, { data: sec }] = await Promise.all([
    db.from("integration_connections").select("config").eq("device_id", deviceId).eq("provider", provider).maybeSingle(),
    db.from("integration_secrets").select("secrets").eq("device_id", deviceId).eq("provider", provider).maybeSingle(),
  ]);
  return {
    config: ((conn?.config ?? {}) as Config),
    secrets: ((sec?.secrets ?? {}) as Secrets),
  };
}

function normalizeShopDomain(raw: string) {
  return raw.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

/* --------------------------------------------------- provider probes ---- */

async function probeShopify(config: Config, secrets: Secrets) {
  const shop = normalizeShopDomain(config.storeUrl ?? "");
  const token = secrets.accessToken ?? "";
  if (!shop || !token) throw new Error("Shopify store URL and Admin API access token are required.");
  const version = config.apiVersion || "2024-10";
  const res = await fetch(`https://${shop}/admin/api/${version}/shop.json`, {
    headers: { "X-Shopify-Access-Token": token, Accept: "application/json" },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Shopify responded ${res.status}: ${body.slice(0, 300)}`);
  const shopInfo = JSON.parse(body).shop as { name: string; myshopify_domain: string; currency: string; plan_name?: string };
  return {
    account: shopInfo.name,
    detail: `${shopInfo.myshopify_domain} · ${shopInfo.currency}${shopInfo.plan_name ? ` · ${shopInfo.plan_name}` : ""}`,
    version,
    shop,
    token,
  };
}

async function probeQuickBooks(config: Config, secrets: Secrets) {
  const realmId = config.realmId ?? "";
  const token = secrets.accessToken ?? "";
  if (!realmId || !token) throw new Error("QuickBooks Realm (Company) ID and OAuth access token are required.");
  const base = config.environment === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";
  const res = await fetch(`${base}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=70`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`QuickBooks responded ${res.status}: ${body.slice(0, 300)}`);
  const info = JSON.parse(body).CompanyInfo as { CompanyName: string; Country?: string; FiscalYearStartMonth?: string };
  return {
    account: info.CompanyName,
    detail: `${info.Country ?? "—"} · FY starts ${info.FiscalYearStartMonth ?? "Jan"}`,
    base,
    realmId,
    token,
  };
}

async function probeEtims(config: Config, secrets: Secrets) {
  const baseUrl = (config.baseUrl || "https://etims.kra.go.ke/etims-api").replace(/\/+$/, "");
  const tin = config.tin ?? "";
  const bhfId = config.branchId || "00";
  const dvcSrlNo = secrets.deviceSerial ?? "";
  if (!tin || !dvcSrlNo) throw new Error("KRA PIN (TIN) and device serial number are required.");
  const res = await fetch(`${baseUrl}/selectInitOsdcInfo`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ tin, bhfId, dvcSrlNo }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`eTIMS responded ${res.status}: ${body.slice(0, 300)}`);
  let parsed: { resultCd?: string; resultMsg?: string } = {};
  try { parsed = JSON.parse(body); } catch { throw new Error(`eTIMS returned a non-JSON response: ${body.slice(0, 200)}`); }
  if (parsed.resultCd && parsed.resultCd !== "000" && parsed.resultCd !== "001") {
    throw new Error(`eTIMS ${parsed.resultCd}: ${parsed.resultMsg ?? "initialisation refused"}`);
  }
  return {
    account: `KRA ${tin} / branch ${bhfId}`,
    detail: parsed.resultMsg ?? "Device initialised",
    baseUrl,
    tin,
    bhfId,
  };
}

/* ------------------------------------------------------- server fns ---- */

export const saveIntegration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    await db.from("integration_connections").upsert(
      { device_id: data.deviceId, provider: data.provider, config: data.config, status: "configured", last_error: null },
      { onConflict: "device_id,provider" },
    );
    const filled = Object.fromEntries(Object.entries(data.secrets).filter(([, v]) => v.trim().length > 0));
    if (Object.keys(filled).length > 0) {
      const { data: existing } = await db
        .from("integration_secrets").select("secrets")
        .eq("device_id", data.deviceId).eq("provider", data.provider).maybeSingle();
      await db.from("integration_secrets").upsert(
        { device_id: data.deviceId, provider: data.provider, secrets: { ...((existing?.secrets ?? {}) as Secrets), ...filled } },
        { onConflict: "device_id,provider" },
      );
    }
    await log(data.deviceId, data.provider, "Parameters updated", "ok", `${Object.keys(data.config).length} settings saved`);
    return { ok: true as const };
  });

export const testIntegration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => actionSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { config, secrets } = await loadCreds(data.deviceId, data.provider);
    try {
      const probe =
        data.provider === "shopify" ? await probeShopify(config, secrets)
        : data.provider === "quickbooks" ? await probeQuickBooks(config, secrets)
        : await probeEtims(config, secrets);
      await db.from("integration_connections").upsert(
        { device_id: data.deviceId, provider: data.provider, config, status: "connected", last_error: null },
        { onConflict: "device_id,provider" },
      );
      await log(data.deviceId, data.provider, "Connection verified", "ok", `${probe.account} — ${probe.detail}`);
      return { ok: true as const, account: probe.account, detail: probe.detail };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Connection failed";
      await db.from("integration_connections").upsert(
        { device_id: data.deviceId, provider: data.provider, config, status: "error", last_error: message },
        { onConflict: "device_id,provider" },
      );
      await log(data.deviceId, data.provider, "Connection verified", "error", message);
      return { ok: false as const, error: message };
    }
  });

export const syncIntegration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => actionSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { config, secrets } = await loadCreds(data.deviceId, data.provider);
    try {
      const summary: Record<string, string | number> = {};

      if (data.provider === "shopify") {
        const p = await probeShopify(config, secrets);
        const headers = { "X-Shopify-Access-Token": p.token, Accept: "application/json" };
        const [products, orders, inventory] = await Promise.all([
          fetch(`https://${p.shop}/admin/api/${p.version}/products/count.json`, { headers }),
          fetch(`https://${p.shop}/admin/api/${p.version}/orders/count.json?status=any`, { headers }),
          fetch(`https://${p.shop}/admin/api/${p.version}/locations.json`, { headers }),
        ]);
        summary.store = p.account;
        summary.products = products.ok ? (await products.json()).count : "n/a";
        summary.orders = orders.ok ? (await orders.json()).count : "n/a";
        summary.locations = inventory.ok ? ((await inventory.json()).locations?.length ?? 0) : "n/a";
      }

      if (data.provider === "quickbooks") {
        const p = await probeQuickBooks(config, secrets);
        const headers = { Authorization: `Bearer ${p.token}`, Accept: "application/json" };
        const q = (sql: string) => `${p.base}/v3/company/${p.realmId}/query?minorversion=70&query=${encodeURIComponent(sql)}`;
        const [accounts, items, invoices] = await Promise.all([
          fetch(q("SELECT COUNT(*) FROM Account"), { headers }),
          fetch(q("SELECT COUNT(*) FROM Item"), { headers }),
          fetch(q("SELECT COUNT(*) FROM Invoice"), { headers }),
        ]);
        const count = async (r: Response) => (r.ok ? (await r.json()).QueryResponse?.totalCount ?? 0 : "n/a");
        summary.company = p.account;
        summary.accounts = await count(accounts);
        summary.items = await count(items);
        summary.invoices = await count(invoices);
      }

      if (data.provider === "etims") {
        const p = await probeEtims(config, secrets);
        const since = config.lastRequestDate || "20240101000000";
        const codesRes = await fetch(`${p.baseUrl}/selectCodeList`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ tin: p.tin, bhfId: p.bhfId, lastReqDt: since }),
        });
        summary.device = p.account;
        summary.initStatus = p.detail;
        summary.codeLists = codesRes.ok ? ((await codesRes.json()).data?.clsList?.length ?? 0) : "n/a";
      }

      const detail = Object.entries(summary).map(([k, v]) => `${k}: ${v}`).join(" · ");
      await db.from("integration_connections").upsert(
        { device_id: data.deviceId, provider: data.provider, config, status: "connected", last_error: null, last_sync_at: new Date().toISOString() },
        { onConflict: "device_id,provider" },
      );
      await log(data.deviceId, data.provider, "Sync completed", "ok", detail);
      return { ok: true as const, summary };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sync failed";
      await db.from("integration_connections").upsert(
        { device_id: data.deviceId, provider: data.provider, config, status: "error", last_error: message },
        { onConflict: "device_id,provider" },
      );
      await log(data.deviceId, data.provider, "Sync completed", "error", message);
      return { ok: false as const, error: message };
    }
  });

export const disconnectIntegration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => actionSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    await db.from("integration_secrets").delete().eq("device_id", data.deviceId).eq("provider", data.provider);
    await db.from("integration_connections")
      .update({ status: "disconnected", last_error: null })
      .eq("device_id", data.deviceId).eq("provider", data.provider);
    await log(data.deviceId, data.provider, "Disconnected", "ok", "Credentials removed from secure storage");
    return { ok: true as const };
  });

/* --------------------------------------------- automatic record sync ---- */

const recordSchema = z.object({
  deviceId: z.string().min(4),
  kind: z.enum(["inspection", "acoustic"]),
  recordId: z.string().min(1),
  hiveLabel: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  status: z.string().min(1),
  occurredAt: z.string().min(4),
  metrics: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});

type RecordPayload = z.infer<typeof recordSchema>;

function recordText(rec: RecordPayload) {
  const metrics = Object.entries(rec.metrics)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
  return [
    `BeeYield ${rec.kind === "inspection" ? "hive inspection" : "acoustic audit"} — ${rec.hiveLabel}`,
    rec.title,
    `Status: ${rec.status}`,
    `Recorded: ${rec.occurredAt}`,
    metrics,
    rec.summary,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Shopify: shop-level metafield + tag/note on the most recent order. */
async function pushToShopify(config: Config, secrets: Secrets, rec: RecordPayload) {
  const p = await probeShopify(config, secrets);
  const headers = {
    "X-Shopify-Access-Token": p.token,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const base = `https://${p.shop}/admin/api/${p.version}`;
  const results: string[] = [];

  const metaRes = await fetch(`${base}/metafields.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      metafield: {
        namespace: "beeyield",
        key: `${rec.kind}_${rec.recordId.slice(0, 30)}`,
        type: "multi_line_text_field",
        value: recordText(rec),
      },
    }),
  });
  if (!metaRes.ok) throw new Error(`Shopify metafield ${metaRes.status}: ${(await metaRes.text()).slice(0, 200)}`);
  results.push("shop metafield created");

  if (config.tagOrders !== "off") {
    const ordersRes = await fetch(`${base}/orders.json?status=any&limit=1&fields=id,tags,note`, { headers });
    if (ordersRes.ok) {
      const order = (await ordersRes.json()).orders?.[0] as { id: number; tags: string; note?: string } | undefined;
      if (order) {
        const tag = `hive-${rec.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        const tags = Array.from(new Set([...(order.tags ? order.tags.split(/,\s*/) : []), tag])).join(", ");
        const note = [order.note, recordText(rec)].filter(Boolean).join("\n---\n").slice(0, 5000);
        const upd = await fetch(`${base}/orders/${order.id}.json`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ order: { id: order.id, tags, note } }),
        });
        results.push(upd.ok ? `order #${order.id} tagged "${tag}"` : `order tagging failed (${upd.status})`);
      } else {
        results.push("no orders to tag yet");
      }
    }
  }
  return results.join(" · ");
}

/** QuickBooks: attach the report as a company note (Attachable). */
async function pushToQuickBooks(config: Config, secrets: Secrets, rec: RecordPayload) {
  const p = await probeQuickBooks(config, secrets);
  const res = await fetch(`${p.base}/v3/company/${p.realmId}/attachable?minorversion=70`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${p.token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Note: recordText(rec).slice(0, 2000),
      Tag: `BeeYield-${rec.kind}`,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`QuickBooks ${res.status}: ${body.slice(0, 200)}`);
  let id = "";
  try { id = JSON.parse(body).Attachable?.Id ?? ""; } catch { /* ignore */ }
  return `note logged in ${p.account}${id ? ` (ref ${id})` : ""}`;
}

/**
 * Auto-sync a saved inspection or acoustic audit to every connected provider.
 * Never throws — each provider result is logged and returned so the UI can
 * report partial success.
 */
export const syncRecordToIntegrations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => recordSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: conns } = await db
      .from("integration_connections")
      .select("provider, sync_enabled, status")
      .eq("device_id", data.deviceId)
      .in("provider", ["shopify", "quickbooks"]);

    const targets = (conns ?? []).filter((c) => c.sync_enabled !== false && c.status !== "disconnected");
    if (targets.length === 0) return { ok: true as const, results: [] as { provider: string; ok: boolean; detail: string }[] };

    const results: { provider: string; ok: boolean; detail: string }[] = [];
    for (const conn of targets) {
      const provider = conn.provider as "shopify" | "quickbooks";
      try {
        const { config, secrets } = await loadCreds(data.deviceId, provider);
        const detail =
          provider === "shopify"
            ? await pushToShopify(config, secrets, data)
            : await pushToQuickBooks(config, secrets, data);
        await db
          .from("integration_connections")
          .update({ last_sync_at: new Date().toISOString(), status: "connected", last_error: null })
          .eq("device_id", data.deviceId)
          .eq("provider", provider);
        await log(data.deviceId, provider, `${data.kind} auto-sync`, "ok", detail);
        results.push({ provider, ok: true, detail });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Sync failed";
        await db
          .from("integration_connections")
          .update({ status: "error", last_error: message })
          .eq("device_id", data.deviceId)
          .eq("provider", provider);
        await log(data.deviceId, provider, `${data.kind} auto-sync`, "error", message);
        results.push({ provider, ok: false, detail: message });
      }
    }
    return { ok: true as const, results };
  });
