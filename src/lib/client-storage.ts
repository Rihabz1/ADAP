"use client";
import type { AuditEvent } from "./types";
export const keys = {
  audit: "adap:audit",
  cases: "adap:cases",
  notes: "adap:notes",
  bookmarks: "adap:bookmarks",
  geofences: "adap:geofences",
};
export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}
export function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
export function audit(action: string, target: string) {
  const items = readLocal<AuditEvent[]>(keys.audit, []);
  items.unshift({
    id: crypto.randomUUID(),
    action,
    target: target.slice(0, 200),
    author: "System Admin",
    createdAt: new Date().toISOString(),
  });
  writeLocal(keys.audit, items.slice(0, 500));
}
