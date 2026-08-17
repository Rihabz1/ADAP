import { CsvProviderAdapter } from "./base";

export const rokomariAdapter = new CsvProviderAdapter("rokomari");
export const getUserActivities =
  rokomariAdapter.getActivities.bind(rokomariAdapter);
export const getLatestActivity =
  rokomariAdapter.getLatestActivity.bind(rokomariAdapter);
export const getActivitiesByDateRange =
  rokomariAdapter.getActivitiesByDateRange.bind(rokomariAdapter);
