import { NextResponse } from "next/server";
import { z } from "zod";
import { providers, type ActivityFilters, type Provider } from "./types";

export const identifierSchema = z
  .string()
  .trim()
  .regex(
    /^(USR\d{3}|\d{11})$/i,
    "Use a valid User ID or 11-digit phone number",
  );
export const phoneSearchSchema = z
  .string()
  .trim()
  .regex(/^\d{11}$/, "Use an exact 11-digit phone number");
export const filterSchema = z.object({
  provider: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").filter(Boolean) : undefined))
    .pipe(z.array(z.enum(providers)).optional()),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  status: z.string().trim().max(40).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(["asc", "desc"]).default("desc"),
  simulateProviderFailure: z.enum(providers).optional(),
});

export function parseFilters(request: Request) {
  const url = new URL(request.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const parsed = filterSchema.safeParse(raw);
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid query parameters",
    } as const;
  const {
    provider,
    from,
    to,
    status,
    sort,
    limit,
    page,
    simulateProviderFailure,
  } = parsed.data;
  if (from && to && from > to)
    return { error: "The from date must be before the to date" } as const;
  return {
    filters: {
      providers: provider as Provider[] | undefined,
      from,
      to,
      status,
      sort,
    } satisfies ActivityFilters,
    limit,
    page,
    simulateProviderFailure,
  } as const;
}
export const ok = (data: unknown, meta: Record<string, unknown> = {}) =>
  NextResponse.json({ success: true, data, meta });
export const fail = (message: string, status = 400) =>
  NextResponse.json({ success: false, error: { message } }, { status });
export function safeError(error: unknown) {
  console.error("ADAP server error", error);
  return fail("The requested data could not be processed.", 500);
}
