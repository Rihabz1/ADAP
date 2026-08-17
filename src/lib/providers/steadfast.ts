import { CsvProviderAdapter } from "./base";

export const steadfastAdapter = new CsvProviderAdapter("steadfast");
export const getUserActivities =
  steadfastAdapter.getActivities.bind(steadfastAdapter);
export const getLatestActivity =
  steadfastAdapter.getLatestActivity.bind(steadfastAdapter);
export const getActivitiesByDateRange =
  steadfastAdapter.getActivitiesByDateRange.bind(steadfastAdapter);
