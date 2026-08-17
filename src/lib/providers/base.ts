import { filterActivities, latestActivity } from "@/lib/activity";
import { getRows, getStore } from "@/lib/data/csv-loader";
import { normalizeRecord } from "@/lib/data/normalization";
import type {
  ActivityFilters,
  Provider,
  ProviderAdapter,
  ProviderHealth,
  ProviderRecord,
} from "@/lib/types";

const occurred = (provider: Provider, row: ProviderRecord) =>
  provider === "foodi" || provider === "rokomari"
    ? (row as { order_time: string }).order_time
    : provider === "steadfast"
      ? (row as { booking_time: string }).booking_time
      : (row as { request_time: string }).request_time;

export class CsvProviderAdapter implements ProviderAdapter {
  constructor(public provider: Provider) {}
  async getActivities(identifier: string, filters: ActivityFilters = {}) {
    const rows = getRows(this.provider, identifier);
    return filterActivities(
      rows.map((row) => normalizeRecord(this.provider, row)),
      filters,
    );
  }
  async getLatestActivity(identifier: string) {
    return latestActivity(await this.getActivities(identifier));
  }
  async getActivitiesByDateRange(
    identifier: string,
    from?: string,
    to?: string,
  ) {
    return this.getActivities(identifier, { from, to });
  }
  async getStatus(): Promise<ProviderHealth> {
    const started = performance.now();
    const dataset = getStore()[this.provider];
    const dates = dataset.rows.map((row) => occurred(this.provider, row));
    return {
      provider: this.provider,
      status: "connected",
      records: dataset.rows.length,
      users: dataset.byUserId.size,
      oldestRecord: dates.sort()[0] ?? null,
      latestRecord: dates.sort().at(-1) ?? null,
      validRows: dataset.rows.length,
      invalidRows: dataset.invalidRows,
      responseMs: Math.max(1, Math.round(performance.now() - started)),
    };
  }
}
