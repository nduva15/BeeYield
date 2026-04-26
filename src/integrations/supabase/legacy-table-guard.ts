type QueryShape = "multi" | "single";
type QueryOp = "select" | "insert" | "update" | "delete" | "upsert";

type GuardContext = {
  op: QueryOp;
  shape: QueryShape;
};

const OPTIONAL_TABLES = new Set([
  "florage_plants",
  "alert_rules",
  "alert_events",
  "forecast_snapshots",
  "harvest_runs",
  "bee_flight_logs",
  "bloom_observations",
]);

const missingTables = new Set<string>();
const warnedTables = new Set<string>();

function normalizeText(input: unknown) {
  return String(input ?? "").toLowerCase();
}

function isMissingTableError(error: unknown) {
  const message = normalizeText((error as { message?: string })?.message);
  const details = normalizeText((error as { details?: string })?.details);
  const code = normalizeText((error as { code?: string })?.code);
  const hint = normalizeText((error as { hint?: string })?.hint);

  return (
    code === "pgrst205" ||
    message.includes("could not find the table") ||
    message.includes("relation") && message.includes("does not exist") ||
    details.includes("could not find the table") ||
    details.includes("relation") && details.includes("does not exist") ||
    hint.includes("perhaps you meant") ||
    details.includes("searched for the table")
  );
}

function noteMissingTable(table: string) {
  missingTables.add(table);
  if (warnedTables.has(table)) return;
  warnedTables.add(table);
  console.warn(`[BeeYield] Supabase table "${table}" is unavailable. Falling back without direct table access.`);
}

function makeReadFallback(shape: QueryShape) {
  return shape === "single" ? null : [];
}

function makeMutationError(table: string, error: unknown) {
  const base = typeof error === "object" && error !== null ? error as Record<string, unknown> : {};
  return {
    ...base,
    code: "BEEYIELD_LEGACY_TABLE_MISSING",
    message: `Supabase table "${table}" is unavailable until migrations are applied.`,
    suppressed: true,
  };
}

function normalizeResult(table: string, context: GuardContext, result: any) {
  if (!OPTIONAL_TABLES.has(table) || !result?.error || !isMissingTableError(result.error)) {
    return result;
  }

  noteMissingTable(table);

  if (context.op === "select") {
    return {
      ...result,
      data: makeReadFallback(context.shape),
      error: null,
      status: 200,
      statusText: "OK",
    };
  }

  return {
    ...result,
    error: makeMutationError(table, result.error),
  };
}

function wrapBuilder(builder: any, table: string, context: GuardContext = { op: "select", shape: "multi" }): any {
  return new Proxy(builder, {
    get(target, prop, receiver) {
      if (prop === "then") {
        return (onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) =>
          Promise.resolve(target).then(
            (value) => {
              const normalized = normalizeResult(table, context, value);
              return onFulfilled ? onFulfilled(normalized) : normalized;
            },
            onRejected,
          );
      }

      if (prop === "catch") {
        return (onRejected?: (reason: unknown) => unknown) =>
          Promise.resolve(target)
            .then((value) => normalizeResult(table, context, value))
            .catch(onRejected);
      }

      if (prop === "finally") {
        return (onFinally?: () => void) =>
          Promise.resolve(target)
            .then((value) => normalizeResult(table, context, value))
            .finally(onFinally);
      }

      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;

      return (...args: unknown[]) => {
        const next = value.apply(target, args);

        let nextContext = context;
        if (prop === "select") nextContext = { ...context, op: "select" };
        if (prop === "insert" || prop === "update" || prop === "delete" || prop === "upsert") {
          nextContext = { ...context, op: prop };
        }
        if (prop === "single" || prop === "maybeSingle") nextContext = { ...nextContext, shape: "single" };

        return wrapBuilder(next, table, nextContext);
      };
    },
  });
}

function createMissingBuilder(table: string, context: GuardContext = { op: "select", shape: "multi" }): any {
  const nextContextFor = (prop: string, current: GuardContext): GuardContext => {
    let next = current;
    if (prop === "select") next = { ...next, op: "select" };
    if (prop === "insert" || prop === "update" || prop === "delete" || prop === "upsert") {
      next = { ...next, op: prop };
    }
    if (prop === "single" || prop === "maybeSingle") next = { ...next, shape: "single" };
    return next;
  };

  const response =
    context.op === "select"
      ? {
          data: makeReadFallback(context.shape),
          error: null,
          status: 200,
          statusText: "OK",
        }
      : {
          data: null,
          error: makeMutationError(table, null),
          status: 200,
          statusText: "OK",
        };

  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") {
          return (onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) =>
            Promise.resolve(response).then(onFulfilled, onRejected);
        }

        if (prop === "catch") {
          return (onRejected?: (reason: unknown) => unknown) => Promise.resolve(response).catch(onRejected);
        }

        if (prop === "finally") {
          return (onFinally?: () => void) => Promise.resolve(response).finally(onFinally);
        }

        return (..._args: unknown[]) => createMissingBuilder(table, nextContextFor(String(prop), context));
      },
    },
  );
}

export function wrapSupabaseClient<T extends { from: (table: string) => any }>(client: T): T {
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop !== "from") return Reflect.get(target, prop, receiver);

      return (table: string) => {
        if (missingTables.has(table)) {
          return createMissingBuilder(table);
        }

        return wrapBuilder(target.from(table), table);
      };
    },
  });
}

export function isOptionalSupabaseTableMissing(table: string) {
  return missingTables.has(table);
}
