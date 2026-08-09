import { formatInTimeZone } from "date-fns-tz";
export const formatDateTime = (value: string | Date) =>
  formatInTimeZone(value, "Asia/Dhaka", "d MMM yyyy, h:mm a");
export const formatDate = (value: string | Date) =>
  formatInTimeZone(value, "Asia/Dhaka", "d MMM yyyy");
export const formatTime = (value: string | Date) =>
  formatInTimeZone(value, "Asia/Dhaka", "HH:mm");
export const formatMoney = (value: number) =>
  `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(value)}`;
