import { CsvProviderAdapter } from "./base";
export const darazAdapter = new CsvProviderAdapter("daraz");
export const getUserActivities = darazAdapter.getActivities.bind(darazAdapter);
export const getLatestActivity =
  darazAdapter.getLatestActivity.bind(darazAdapter);
export const getActivitiesByDateRange =
  darazAdapter.getActivitiesByDateRange.bind(darazAdapter);
