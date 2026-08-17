import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { foodiSchema } from "../data/schemas";
import { getRows, getStore, parseCsvRows } from "../data/csv-loader";
import { normalizeRecord } from "../data/normalization";
import type { FoodiRecord } from "../types";
describe("CSV data and normalization", () => {
  it("parses and validates CSV rows", () => {
    const csv = fs.readFileSync(
      path.join(process.cwd(), "data", "foodi_demo_100_users_6_months_english.csv"),
      "utf8",
    );
    const result = parseCsvRows<FoodiRecord>(csv, foodiSchema);
    expect(result.rows).toHaveLength(1054);
    expect(result.invalidRows).toBe(0);
  });
  it("loads every provider dataset without invalid rows", () => {
    const store = getStore();
    expect({
      foodi: store.foodi.rows.length,
      pathao: store.pathao.rows.length,
      rokomari: store.rokomari.rows.length,
      steadfast: store.steadfast.rows.length,
    }).toEqual({ foodi: 1054, pathao: 1189, rokomari: 896, steadfast: 887 });
    expect(
      Object.values(store).every((dataset) => dataset.invalidRows === 0),
    ).toBe(true);
  });
  it("looks up the same user by phone and case-insensitive ID", () => {
    const rows = getRows<FoodiRecord>("foodi", "usr001");
    expect(rows.length).toBeGreaterThan(0);
    expect(getRows("foodi", rows[0].phone)).toHaveLength(rows.length);
  });
  it("normalizes Foodi event-time and destination", () => {
    const row = getRows<FoodiRecord>("foodi", "USR001")[0];
    const item = normalizeRecord("foodi", row);
    expect(item.occurredAt).toBe(row.order_time);
    expect(item.activityType).toBe("food_order");
    expect(item.destination?.area).toBe(row.delivery_area);
    expect(item.customerName.toLowerCase()).not.toContain("demo");
    expect(item.title.toLowerCase()).not.toContain("demo");
  });
});
