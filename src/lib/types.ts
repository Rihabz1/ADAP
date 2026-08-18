export const providers = ["foodi", "pathao", "rokomari", "steadfast"] as const;
export type Provider = (typeof providers)[number];

export interface FoodiRecord {
  user_id: string;
  phone: string;
  customer_name: string;
  order_id: string;
  order_time: string;
  restaurant_name: string;
  restaurant_category: string;
  delivery_area: string;
  delivery_lat: string;
  delivery_lon: string;
  order_amount_bdt: string;
  payment_method: string;
  order_status: string;
  source_updated_at: string;
  synthetic: string;
}
export interface RokomariRecord {
  user_id: string;
  phone: string;
  customer_name: string;
  order_id: string;
  order_time: string;
  seller_name: string;
  product_category: string;
  item_count: string;
  delivery_area: string;
  delivery_lat: string;
  delivery_lon: string;
  order_amount_bdt: string;
  payment_method: string;
  order_status: string;
  source_updated_at: string;
  synthetic: string;
}
export interface SteadfastRecord {
  user_id: string;
  phone: string;
  customer_name: string;
  parcel_id: string;
  user_role: string;
  booking_time: string;
  parcel_type: string;
  pickup_area: string;
  pickup_lat: string;
  pickup_lon: string;
  delivery_area: string;
  delivery_lat: string;
  delivery_lon: string;
  delivery_charge_bdt: string;
  parcel_status: string;
  source_updated_at: string;
  synthetic: string;
}
export interface PathaoRecord {
  user_id: string;
  phone: string;
  customer_name: string;
  trip_id: string;
  request_time: string;
  vehicle_type: string;
  pickup_area: string;
  pickup_lat: string;
  pickup_lon: string;
  dropoff_area: string;
  dropoff_lat: string;
  dropoff_lon: string;
  distance_km: string;
  duration_min: string;
  fare_bdt: string;
  trip_status: string;
  source_updated_at: string;
  synthetic: string;
}
export type ProviderRecord =
  FoodiRecord | PathaoRecord | RokomariRecord | SteadfastRecord;

export interface ActivityLocation {
  area: string;
  latitude: number;
  longitude: number;
}
export interface NormalizedActivity {
  id: string;
  provider: Provider;
  userId: string;
  phone: string;
  customerName: string;
  activityType: "food_order" | "ecommerce_order" | "courier_delivery" | "ride";
  occurredAt: string;
  sourceUpdatedAt: string;
  status: string;
  origin?: ActivityLocation;
  destination?: ActivityLocation;
  amount?: number;
  title: string;
  description: string;
  metadata: Record<string, string | number>;
}
export interface NormalizedUser {
  userId: string;
  phone: string;
  customerName: string;
  totalActivities: number;
  latestActivity: string | null;
  activeProviders: number;
}
export interface ActivityFilters {
  providers?: Provider[];
  from?: string;
  to?: string;
  status?: string;
  sort?: "asc" | "desc";
}
export interface ProviderHealth {
  provider: Provider;
  status: "connected" | "unavailable";
  records: number;
  users: number;
  oldestRecord: string | null;
  latestRecord: string | null;
  validRows: number;
  invalidRows: number;
  responseMs: number;
}
export interface LocationEvent {
  activityId: string;
  provider: Provider;
  role: "origin" | "destination";
  area: string;
  latitude: number;
  longitude: number;
  occurredAt: string;
  status: string;
  title: string;
}
export interface GeofencePoint {
  latitude: number;
  longitude: number;
}
export interface CircleGeofence {
  id: string;
  name: string;
  shape?: "circle";
  latitude: number;
  longitude: number;
  radiusKm: number;
}
export interface PolygonGeofence {
  id: string;
  name: string;
  shape: "polygon";
  points: GeofencePoint[];
}
export type Geofence = CircleGeofence | PolygonGeofence;
export interface GeofenceEvent extends LocationEvent {
  distanceKm: number;
  state: "inside" | "outside";
  transition?: "entered" | "exited";
}
export interface CaseNote {
  id: string;
  author: string;
  createdAt: string;
  text: string;
}
export interface DemoCase {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  status: "Open" | "Review" | "Closed";
  createdAt: string;
  notes: CaseNote[];
  bookmarks: string[];
}
export interface AuditEvent {
  id: string;
  action: string;
  target: string;
  author: string;
  createdAt: string;
}

export interface ProviderAdapter {
  provider: Provider;
  getActivities(
    identifier: string,
    filters?: ActivityFilters,
  ): Promise<NormalizedActivity[]>;
  getLatestActivity(identifier: string): Promise<NormalizedActivity | null>;
  getActivitiesByDateRange(
    identifier: string,
    from?: string,
    to?: string,
  ): Promise<NormalizedActivity[]>;
  getStatus(): Promise<ProviderHealth>;
}
