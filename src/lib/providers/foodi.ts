import { CsvProviderAdapter } from "./base";

export const foodiAdapter = new CsvProviderAdapter("foodi");
export const getUserActivities = foodiAdapter.getActivities.bind(foodiAdapter);
export const getLatestActivity =
  foodiAdapter.getLatestActivity.bind(foodiAdapter);
export const getActivitiesByDateRange =
  foodiAdapter.getActivitiesByDateRange.bind(foodiAdapter);
