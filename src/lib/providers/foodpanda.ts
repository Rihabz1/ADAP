import { CsvProviderAdapter } from "./base";
export const foodpandaAdapter = new CsvProviderAdapter("foodpanda");
export const getUserActivities =
  foodpandaAdapter.getActivities.bind(foodpandaAdapter);
export const getLatestActivity =
  foodpandaAdapter.getLatestActivity.bind(foodpandaAdapter);
export const getActivitiesByDateRange =
  foodpandaAdapter.getActivitiesByDateRange.bind(foodpandaAdapter);
