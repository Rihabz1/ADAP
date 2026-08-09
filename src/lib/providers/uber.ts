import { CsvProviderAdapter } from "./base";
export const uberAdapter = new CsvProviderAdapter("uber");
export const getUserActivities = uberAdapter.getActivities.bind(uberAdapter);
export const getLatestActivity =
  uberAdapter.getLatestActivity.bind(uberAdapter);
export const getActivitiesByDateRange =
  uberAdapter.getActivitiesByDateRange.bind(uberAdapter);
