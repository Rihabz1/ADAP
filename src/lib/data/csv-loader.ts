import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { normalizeIdentifier } from "@/lib/activity";
import type {
  FoodiRecord,
  PathaoRecord,
  Provider,
  ProviderRecord,
  RokomariRecord,
  SteadfastRecord,
} from "@/lib/types";
import {
  foodiSchema,
  pathaoSchema,
  rokomariSchema,
  steadfastSchema,
} from "./schemas";

const files: Record<Provider, string> = {
  foodi: "foodi_demo_100_users_6_months_english.csv",
  pathao: "pathao_ride_demo_100_users_6_months_english.csv",
  rokomari: "rokomari_demo_100_users_6_months_english.csv",
  steadfast: "steadfast_demo_100_users_6_months_english.csv",
};

const schemas: Record<Provider, z.ZodType> = {
  foodi: foodiSchema,
  pathao: pathaoSchema,
  rokomari: rokomariSchema,
  steadfast: steadfastSchema,
};

export interface Dataset<T extends ProviderRecord = ProviderRecord> {
  rows: T[];
  invalidRows: number;
  byUserId: Map<string, T[]>;
  byPhone: Map<string, T[]>;
}
type Store = {
  foodi: Dataset<FoodiRecord>;
  pathao: Dataset<PathaoRecord>;
  rokomari: Dataset<RokomariRecord>;
  steadfast: Dataset<SteadfastRecord>;
};

declare global {
  var __sentinelStore: Store | undefined;
}

export function parseCsvRows<T extends ProviderRecord>(
  csv: string,
  schema: z.ZodType,
): { rows: T[]; invalidRows: number } {
  const raw = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_column_count: false,
  }) as Record<string, string>[];
  const rows: T[] = [];
  let invalidRows = 0;
  for (const row of raw) {
    const parsed = schema.safeParse(row);
    if (!parsed.success) {
      invalidRows += 1;
      continue;
    }
    rows.push(row as unknown as T);
  }
  return { rows, invalidRows };
}

function index<T extends ProviderRecord>(rows: T[]) {
  const byUserId = new Map<string, T[]>();
  const byPhone = new Map<string, T[]>();
  for (const row of rows) {
    const uid = row.user_id.toUpperCase();
    byUserId.set(uid, [...(byUserId.get(uid) ?? []), row]);
    const phone = normalizeIdentifier(row.phone);
    byPhone.set(phone, [...(byPhone.get(phone) ?? []), row]);
  }
  return { byUserId, byPhone };
}

function load<T extends ProviderRecord>(provider: Provider): Dataset<T> {
  // CSV files stay outside public/. Next output tracing includes them in serverless deployments.
  const filePath = path.join(process.cwd(), "data", files[provider]);
  const { rows, invalidRows } = parseCsvRows<T>(
    fs.readFileSync(filePath, "utf8"),
    schemas[provider],
  );
  return { rows, invalidRows, ...index(rows) };
}

export function getStore(): Store {
  // A process-global cache prevents repeated parsing during warm Vercel invocations and local HMR.
  if (!globalThis.__sentinelStore) {
    globalThis.__sentinelStore = {
      foodi: load("foodi"),
      pathao: load("pathao"),
      rokomari: load("rokomari"),
      steadfast: load("steadfast"),
    } as Store;
  }
  return globalThis.__sentinelStore;
}

export function getRows<T extends ProviderRecord>(
  provider: Provider,
  identifier: string,
): T[] {
  const dataset = getStore()[provider] as Dataset<T>;
  const normalized = normalizeIdentifier(identifier);
  return normalized.toUpperCase().startsWith("USR")
    ? (dataset.byUserId.get(normalized.toUpperCase()) ?? [])
    : (dataset.byPhone.get(normalized) ?? []);
}
