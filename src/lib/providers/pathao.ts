import { CsvProviderAdapter } from "./base";
export const pathaoAdapter = new CsvProviderAdapter("pathao");
export const getUserActivities =
  pathaoAdapter.getActivities.bind(pathaoAdapter);
export const getLatestActivity =
  pathaoAdapter.getLatestActivity.bind(pathaoAdapter);
export const getActivitiesByDateRange =
  pathaoAdapter.getActivitiesByDateRange.bind(pathaoAdapter);
