import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { foodpandaSchema } from "../data/schemas";
import { getRows, parseCsvRows } from "../data/csv-loader";
import { normalizeRecord } from "../data/normalization";
import type { FoodpandaRecord } from "../types";
describe("CSV data and normalization", () => {
  it("parses and validates CSV rows", () => {
    const csv = fs.readFileSync(
      path.join(process.cwd(), "data", "foodpanda_demo_100_users_6_months.csv"),
      "utf8",
    );
    const result = parseCsvRows<FoodpandaRecord>(csv, foodpandaSchema);
    expect(result.rows).toHaveLength(1637);
    expect(result.invalidRows).toBe(0);
  });
  it("looks up the same user by phone and case-insensitive ID", () => {
    expect(getRows("foodpanda", "01000000001").length).toBeGreaterThan(0);
    expect(getRows("foodpanda", "usr001")).toHaveLength(
      getRows("foodpanda", "01000000001").length,
    );
  });
  it("normalizes Foodpanda event-time and destination", () => {
    const row = getRows<FoodpandaRecord>("foodpanda", "USR001")[0];
    const item = normalizeRecord("foodpanda", row);
    expect(item.occurredAt).toBe(row.order_time);
    expect(item.activityType).toBe("food_order");
    expect(item.destination?.area).toBe(row.delivery_area);
    expect(item.customerName.toLowerCase()).not.toContain("demo");
    expect(item.title.toLowerCase()).not.toContain("demo");
  });
});
