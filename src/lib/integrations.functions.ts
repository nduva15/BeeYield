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
