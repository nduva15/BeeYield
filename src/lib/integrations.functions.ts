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

async function log(
  deviceId: string,
  provider: string,
  event: string,
  status: string,
  detail?: string,
  ref?: { recordId?: string; recordKind?: string; hiveLabel?: string },
) {
  const db = await admin();
  await db.from("integration_sync_logs").insert({
    device_id: deviceId,
    provider,
    event,
    status,
    detail: detail ?? null,
    record_id: ref?.recordId ?? null,
    record_kind: ref?.recordKind ?? null,
    hive_label: ref?.hiveLabel ?? null,
  });
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

/* --------------------------------------------- credential validation ---- */

export type Check = { label: string; ok: boolean; detail: string; critical: boolean };

const ok = (label: string, detail: string, critical = true): Check => ({ label, ok: true, detail, critical });
const bad = (label: string, detail: string, critical = true): Check => ({ label, ok: false, detail, critical });

async function validateShopify(config: Config, secrets: Secrets) {
  const checks: Check[] = [];
  const shop = normalizeShopDomain(config.storeUrl ?? "");
  const token = secrets.accessToken ?? "";
  const version = config.apiVersion || "2024-10";

  checks.push(
    /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop) || /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(shop)
      ? ok("Store domain", shop)
      : bad("Store domain", "Enter your store domain, e.g. your-apiary.myshopify.com (no https://, no trailing path)"),
  );
  checks.push(
    token
      ? token.startsWith("shpat_")
        ? ok("Admin API token format", "Custom-app token (shpat_…) recognised")
        : ok("Admin API token format", "Token accepted, but custom-app tokens normally start with shpat_", false)
      : bad("Admin API token format", "Admin API access token is required"),
  );
  checks.push(
    /^\d{4}-\d{2}$/.test(version) ? ok("API version", version) : bad("API version", "Use a dated version such as 2024-10", false),
  );
  if (checks.some((c) => !c.ok && c.critical)) return { checks, account: "", detail: "Credential fields incomplete" };

  const headers = { "X-Shopify-Access-Token": token, Accept: "application/json" };
  const shopRes = await fetch(`https://${shop}/admin/api/${version}/shop.json`, { headers });
  const shopBody = await shopRes.text();
  if (!shopRes.ok) {
    checks.push(
      bad(
        "Admin API authentication",
        shopRes.status === 401 || shopRes.status === 403
          ? "Shopify rejected the token (401/403). Re-install the custom app and copy a fresh Admin API access token."
          : `Shopify responded ${shopRes.status}: ${shopBody.slice(0, 200)}`,
      ),
    );
    return { checks, account: "", detail: "Authentication failed" };
  }
  const info = JSON.parse(shopBody).shop as { name: string; myshopify_domain: string; currency: string };
  checks.push(ok("Admin API authentication", `${info.name} · ${info.myshopify_domain} · ${info.currency}`));

  const scopeRes = await fetch(`https://${shop}/admin/oauth/access_scopes.json`, { headers });
  if (scopeRes.ok) {
    const scopes = ((await scopeRes.json()).access_scopes ?? []).map((s: { handle: string }) => s.handle) as string[];
    const need = ["read_orders", "write_orders", "read_products"];
    const missing = need.filter((s) => !scopes.includes(s));
    checks.push(
      missing.length === 0
        ? ok("Order write scopes", need.join(", "))
        : bad(
            "Order write scopes",
            `Missing ${missing.join(", ")} — records will fall back to tagging an existing order instead of creating one.`,
            false,
          ),
    );
  } else {
    checks.push(bad("Order write scopes", "Could not read granted scopes for this token", false));
  }

  const ordersRes = await fetch(`https://${shop}/admin/api/${version}/orders/count.json?status=any`, { headers });
  checks.push(
    ordersRes.ok
      ? ok("Orders endpoint", `${(await ordersRes.json()).count} order(s) visible`)
      : bad("Orders endpoint", `Responded ${ordersRes.status} — grant read_orders to this app`),
  );

  return { checks, account: info.name, detail: `${info.myshopify_domain} · ${info.currency}` };
}

async function validateQuickBooks(config: Config, secrets: Secrets) {
  const checks: Check[] = [];
  const realmId = config.realmId ?? "";
  const token = secrets.accessToken ?? "";
  const env = (config.environment || "production").toLowerCase();
  const base = env === "sandbox" ? "https://sandbox-quickbooks.api.intuit.com" : "https://quickbooks.api.intuit.com";

  checks.push(/^\d{6,}$/.test(realmId) ? ok("Realm / Company ID", realmId) : bad("Realm / Company ID", "The Realm ID is the numeric company id from the Intuit dashboard"));
  checks.push(env === "sandbox" || env === "production" ? ok("Environment", env) : bad("Environment", "Use production or sandbox"));
  checks.push(
    token
      ? token.split(".").length === 3
        ? ok("Access token format", "OAuth 2.0 bearer token recognised")
        : ok("Access token format", "Token accepted, but it does not look like an Intuit OAuth 2.0 token", false)
      : bad("Access token format", "OAuth 2.0 access token is required"),
  );
  checks.push(secrets.refreshToken ? ok("Refresh token stored", "Available for token renewal", false) : bad("Refresh token stored", "Add a refresh token so syncs survive the 1-hour access-token expiry", false));
  if (checks.some((c) => !c.ok && c.critical)) return { checks, account: "", detail: "Credential fields incomplete" };

  const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
  const infoRes = await fetch(`${base}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=70`, { headers });
  const infoBody = await infoRes.text();
  if (!infoRes.ok) {
    checks.push(
      bad(
        "Company authentication",
        infoRes.status === 401
          ? "QuickBooks rejected the access token (401). Access tokens expire after 1 hour — refresh it and save again."
          : `QuickBooks responded ${infoRes.status}: ${infoBody.slice(0, 200)}`,
      ),
    );
    return { checks, account: "", detail: "Authentication failed" };
  }
  const company = JSON.parse(infoBody).CompanyInfo as { CompanyName: string; Country?: string };
  checks.push(ok("Company authentication", `${company.CompanyName}${company.Country ? ` · ${company.Country}` : ""}`));

  const accountName = config.accountName || "BeeYield Hive Operations";
  const q = `SELECT Id, Name FROM Account WHERE Name = '${accountName.replace(/'/g, "''")}'`;
  const accRes = await fetch(`${base}/v3/company/${realmId}/query?minorversion=70&query=${encodeURIComponent(q)}`, { headers });
  if (accRes.ok) {
    const found = (await accRes.json()).QueryResponse?.Account?.[0] as { Id: string } | undefined;
    checks.push(
      ok("Sync account", found ? `"${accountName}" found (id ${found.Id})` : `"${accountName}" will be created on the first sync`),
    );
  } else {
    checks.push(bad("Sync account", `Chart of accounts not readable (${accRes.status}) — the accounting scope is required`));
  }

  return { checks, account: company.CompanyName, detail: company.Country ?? "—" };
}

async function validateEtims(config: Config, secrets: Secrets) {
  const checks: Check[] = [];
  const tin = config.tin ?? "";
  checks.push(/^[A-Z]\d{9}[A-Z]$/i.test(tin) ? ok("KRA PIN (TIN)", tin.toUpperCase()) : bad("KRA PIN (TIN)", "A KRA PIN looks like P051234567X"));
  checks.push(/^\d{2}$/.test(config.branchId || "00") ? ok("Branch ID", config.branchId || "00") : bad("Branch ID", "Branch ID is two digits, e.g. 00", false));
  checks.push(secrets.deviceSerial ? ok("Device serial", "Stored") : bad("Device serial", "The serial registered on the eTIMS portal is required"));
  if (checks.some((c) => !c.ok && c.critical)) return { checks, account: "", detail: "Credential fields incomplete" };

  const probe = await probeEtims(config, secrets);
  checks.push(ok("Device initialisation", probe.detail));
  return { checks, account: probe.account, detail: probe.detail };
}

/**
 * Test Connection: validates every credential field, then authenticates and
 * probes read/write capability. A connection only reaches "connected" — the
 * state that unlocks syncing — when all critical checks pass.
 */
export const testIntegration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => actionSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { config, secrets } = await loadCreds(data.deviceId, data.provider);
    try {
      const res =
        data.provider === "shopify" ? await validateShopify(config, secrets)
        : data.provider === "quickbooks" ? await validateQuickBooks(config, secrets)
        : await validateEtims(config, secrets);

      const failed = res.checks.filter((c) => !c.ok && c.critical);
      const passed = failed.length === 0;
      const message = passed ? null : failed.map((c) => `${c.label}: ${c.detail}`).join(" | ");

      await db.from("integration_connections").upsert(
        {
          device_id: data.deviceId,
          provider: data.provider,
          config,
          status: passed ? "connected" : "error",
          last_error: message,
        },
        { onConflict: "device_id,provider" },
      );
      await log(
        data.deviceId,
        data.provider,
        "Connection test",
        passed ? "ok" : "error",
        passed ? `${res.account} — ${res.detail}` : message ?? "Validation failed",
      );
      return {
        ok: passed,
        account: res.account,
        detail: res.detail,
        checks: res.checks,
        error: message ?? undefined,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Connection failed";
      await db.from("integration_connections").upsert(
        { device_id: data.deviceId, provider: data.provider, config, status: "error", last_error: message },
        { onConflict: "device_id,provider" },
      );
      await log(data.deviceId, data.provider, "Connection test", "error", message);
      return { ok: false, account: "", detail: "", checks: [] as Check[], error: message };
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

/**
 * Shopify: writes a real order for the service record (line item + tags +
 * note attributes), plus a shop-level metafield holding the full report.
 * Falls back to tagging the most recent order when the app token lacks
 * write_orders.
 */
async function pushToShopify(config: Config, secrets: Secrets, rec: RecordPayload) {
  const p = await probeShopify(config, secrets);
  const headers = {
    "X-Shopify-Access-Token": p.token,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const base = `https://${p.shop}/admin/api/${p.version}`;
  const results: string[] = [];
  const statusTag = `hive-${rec.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const report = recordText(rec);

  // 1. Full report on the shop as a metafield (audit trail, always attempted).
  const metaRes = await fetch(`${base}/metafields.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      metafield: {
        namespace: "beeyield",
        key: `${rec.kind}_${rec.recordId.slice(0, 30)}`,
        type: "multi_line_text_field",
        value: report,
      },
    }),
  });
  if (!metaRes.ok) throw new Error(`Shopify metafield ${metaRes.status}: ${(await metaRes.text()).slice(0, 200)}`);
  results.push("shop metafield created");

  // 2. Real order carrying the record so it shows up in Shopify Orders.
  const price = config.serviceOrderPrice && !Number.isNaN(Number(config.serviceOrderPrice))
    ? Number(config.serviceOrderPrice).toFixed(2)
    : "0.00";
  const orderPayload = {
    order: {
      line_items: [
        {
          title: `${rec.kind === "inspection" ? "Hive inspection" : "Acoustic audit"} — ${rec.hiveLabel}`,
          quantity: 1,
          price,
          requires_shipping: false,
          taxable: false,
        },
      ],
      financial_status: "paid",
      send_receipt: false,
      send_fulfillment_receipt: false,
      inventory_behaviour: "bypass",
      tags: [`beeyield`, `beeyield-${rec.kind}`, statusTag].join(", "),
      note: report.slice(0, 5000),
      note_attributes: [
        { name: "beeyield_record_id", value: rec.recordId },
        { name: "beeyield_kind", value: rec.kind },
        { name: "hive", value: rec.hiveLabel },
        { name: "status", value: rec.status },
        { name: "occurred_at", value: rec.occurredAt },
        ...Object.entries(rec.metrics).slice(0, 15).map(([k, v]) => ({ name: k, value: String(v) })),
      ],
      ...(config.orderEmail ? { email: config.orderEmail } : {}),
    },
  };

  const orderRes = await fetch(`${base}/orders.json`, {
    method: "POST",
    headers,
    body: JSON.stringify(orderPayload),
  });

  if (orderRes.ok) {
    const created = (await orderRes.json()).order as { id: number; name: string };
    results.push(`order ${created.name} created (id ${created.id})`);
    return results.join(" · ");
  }

  const orderErr = (await orderRes.text()).slice(0, 200);
  results.push(`order create failed (${orderRes.status}: ${orderErr}) — falling back to tagging`);

  // 3. Fallback: tag/annotate the most recent existing order.
  const ordersRes = await fetch(`${base}/orders.json?status=any&limit=1&fields=id,name,tags,note`, { headers });
  if (ordersRes.ok) {
    const order = (await ordersRes.json()).orders?.[0] as { id: number; name: string; tags: string; note?: string } | undefined;
    if (order) {
      const tags = Array.from(new Set([...(order.tags ? order.tags.split(/,\s*/) : []), "beeyield", statusTag])).join(", ");
      const note = [order.note, report].filter(Boolean).join("\n---\n").slice(0, 5000);
      const upd = await fetch(`${base}/orders/${order.id}.json`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ order: { id: order.id, tags, note } }),
      });
      results.push(upd.ok ? `order ${order.name} tagged "${statusTag}"` : `order tagging failed (${upd.status})`);
    } else {
      results.push("no existing orders to tag");
    }
  }
  return results.join(" · ");
}

/**
 * QuickBooks: finds (or creates) the BeeYield tracking account in the chart of
 * accounts, stamps the latest record onto its description, and files the full
 * report as an Attachable note against the company.
 */
async function pushToQuickBooks(config: Config, secrets: Secrets, rec: RecordPayload) {
  const p = await probeQuickBooks(config, secrets);
  const headers = {
    Authorization: `Bearer ${p.token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const api = (path: string) => `${p.base}/v3/company/${p.realmId}/${path}${path.includes("?") ? "&" : "?"}minorversion=70`;
  const results: string[] = [];
  const accountName = config.accountName || "BeeYield Hive Operations";
  const report = recordText(rec);

  // 1. Find the tracking account.
  const query = `SELECT Id, Name, SyncToken, Description FROM Account WHERE Name = '${accountName.replace(/'/g, "''")}'`;
  const findRes = await fetch(`${p.base}/v3/company/${p.realmId}/query?minorversion=70&query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${p.token}`, Accept: "application/json" },
  });
  if (!findRes.ok) throw new Error(`QuickBooks account lookup ${findRes.status}: ${(await findRes.text()).slice(0, 200)}`);
  let account = (await findRes.json()).QueryResponse?.Account?.[0] as
    | { Id: string; Name: string; SyncToken: string; Description?: string }
    | undefined;

  // 2. Create it when absent.
  if (!account) {
    const createRes = await fetch(api("account"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        Name: accountName,
        AccountType: config.accountType || "Expense",
        AccountSubType: config.accountSubType || "OtherMiscellaneousServiceCost",
        Description: `Apiary operations tracked by BeeYield. Latest: ${rec.title}`,
      }),
    });
    const createBody = await createRes.text();
    if (!createRes.ok) throw new Error(`QuickBooks account create ${createRes.status}: ${createBody.slice(0, 200)}`);
    account = JSON.parse(createBody).Account;
    results.push(`account "${accountName}" created (id ${account?.Id})`);
  }

  // 3. Sparse-update the account description with the latest record.
  if (account) {
    const updRes = await fetch(api("account"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        Id: account.Id,
        SyncToken: account.SyncToken,
        sparse: true,
        Description: `BeeYield · ${rec.hiveLabel} · ${rec.status} · ${rec.occurredAt} — ${rec.title}`.slice(0, 100),
      }),
    });
    results.push(updRes.ok ? `account "${accountName}" updated` : `account update skipped (${updRes.status})`);
  }

  // 4. File the full report as a company note.
  const noteRes = await fetch(api("attachable"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      Note: report.slice(0, 2000),
      Tag: `BeeYield-${rec.kind}`,
      ...(account ? { AttachableRef: [{ EntityRef: { type: "Account", value: account.Id } }] } : {}),
    }),
  });
  const noteBody = await noteRes.text();
  if (!noteRes.ok) throw new Error(`QuickBooks note ${noteRes.status}: ${noteBody.slice(0, 200)}`);
  let id = "";
  try { id = JSON.parse(noteBody).Attachable?.Id ?? ""; } catch { /* ignore */ }
  results.push(`note filed in ${p.account}${id ? ` (ref ${id})` : ""}`);

  return results.join(" · ");
}


/** Push one record to one provider, logging the outcome against the record. */
async function pushRecord(deviceId: string, provider: "shopify" | "quickbooks", rec: RecordPayload, event: string) {
  const db = await admin();
  const ref = { recordId: rec.recordId, recordKind: rec.kind, hiveLabel: rec.hiveLabel };
  try {
    const { config, secrets } = await loadCreds(deviceId, provider);
    const detail =
      provider === "shopify" ? await pushToShopify(config, secrets, rec) : await pushToQuickBooks(config, secrets, rec);
    await db
      .from("integration_connections")
      .update({ last_sync_at: new Date().toISOString(), status: "connected", last_error: null })
      .eq("device_id", deviceId)
      .eq("provider", provider);
    await log(deviceId, provider, event, "ok", detail, ref);
    return { provider, ok: true, detail };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    await db
      .from("integration_connections")
      .update({ status: "error", last_error: message })
      .eq("device_id", deviceId)
      .eq("provider", provider);
    await log(deviceId, provider, event, "error", message, ref);
    return { provider, ok: false, detail: message };
  }
}

/**
 * Auto-sync a saved inspection or acoustic audit to every verified provider.
 * Only connections that passed a Test Connection ("connected") are eligible, so
 * unvalidated credentials never reach a live store or ledger. Never throws.
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

    const targets = (conns ?? []).filter((c) => c.sync_enabled !== false && c.status === "connected");
    const results: { provider: string; ok: boolean; detail: string }[] = [];

    const unverified = (conns ?? []).filter((c) => c.sync_enabled !== false && c.status === "configured");
    for (const conn of unverified) {
      await log(
        data.deviceId,
        conn.provider,
        `${data.kind} auto-sync`,
        "skipped",
        "Credentials not verified yet — run Test connection before syncing.",
        { recordId: data.recordId, recordKind: data.kind, hiveLabel: data.hiveLabel },
      );
      results.push({ provider: conn.provider, ok: false, detail: "Not verified — run Test connection first" });
    }

    for (const conn of targets) {
      results.push(await pushRecord(data.deviceId, conn.provider as "shopify" | "quickbooks", data, `${data.kind} auto-sync`));
    }
    return { ok: true as const, results };
  });

/* ------------------------------------------------------- re-sync one ---- */

const resyncSchema = z.object({
  deviceId: z.string().min(4),
  provider: z.enum(["shopify", "quickbooks"]),
  kind: z.enum(["inspection", "acoustic"]),
  recordId: z.string().min(1),
});

/** Rebuilds the record payload from the database so a failed sync can be retried. */
async function buildPayload(deviceId: string, kind: "inspection" | "acoustic", recordId: string): Promise<RecordPayload> {
  const db = await admin();
  if (kind === "inspection") {
    const { data: r } = await db
      .from("inspections").select("*").eq("device_id", deviceId).eq("id", recordId).maybeSingle();
    if (!r) throw new Error("Inspection no longer exists");
    return recordSchema.parse({
      deviceId,
      kind,
      recordId,
      hiveLabel: r.hive_label,
      title: `Hive inspection — ${r.colony_health}`,
      summary: [
        r.issues?.length ? `Issues: ${r.issues.join(", ")}` : "No issues recorded",
        r.actions?.length ? `Actions: ${r.actions.join(", ")}` : "",
        r.notes ?? "",
      ].filter(Boolean).join("\n"),
      status: r.colony_health,
      occurredAt: r.inspected_on,
      metrics: {
        broodFrames: r.brood_frames,
        honeyFrames: r.honey_frames,
        varroaPer300: r.varroa_count,
        queenCells: r.queen_cells,
        queenSeen: r.queen_seen,
        temperament: r.temperament,
        location: r.location,
      },
    });
  }
  const { data: r } = await db
    .from("sound_analyses").select("*").eq("device_id", deviceId).eq("id", recordId).maybeSingle();
  if (!r) throw new Error("Acoustic audit no longer exists");
  const diseases = Array.isArray(r.disease_predictions)
    ? (r.disease_predictions as { name?: string; score?: number }[])
    : [];
  return recordSchema.parse({
    deviceId,
    kind,
    recordId,
    hiveLabel: r.hive_label,
    title: `Acoustic audit — ${r.health_state} (${Math.round(Number(r.health_confidence) * 100)}% confidence)`,
    summary:
      diseases.slice(0, 3).map((d) => `${d.name ?? "indicator"} ${Math.round((d.score ?? 0) * 100)}%`).join("; ") ||
      "No acoustic disease indicators above threshold",
    status: r.health_state,
    occurredAt: (r.recorded_at ?? r.created_at ?? new Date().toISOString()).slice(0, 10),
    metrics: {
      durationSec: Number(r.duration_sec),
      windows: r.segments,
      pipingDetected: r.piping_detected,
      confidencePct: Math.round(Number(r.health_confidence) * 100),
    },
  });
}

/** One-click retry for a record that failed (or was skipped) on a provider. */
export const resyncRecord = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => resyncSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: conn } = await db
      .from("integration_connections")
      .select("status")
      .eq("device_id", data.deviceId)
      .eq("provider", data.provider)
      .maybeSingle();
    if (conn?.status !== "connected") {
      return { ok: false as const, detail: "Run Test connection for this provider before re-syncing." };
    }
    try {
      const payload = await buildPayload(data.deviceId, data.kind, data.recordId);
      const res = await pushRecord(data.deviceId, data.provider, payload, `${data.kind} re-sync`);
      return { ok: res.ok, detail: res.detail };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Re-sync failed";
      await log(data.deviceId, data.provider, `${data.kind} re-sync`, "error", message, {
        recordId: data.recordId,
        recordKind: data.kind,
      });
      return { ok: false as const, detail: message };
    }
  });
