import type {
  DarazRecord,
  FoodpandaRecord,
  NormalizedActivity,
  PathaoRecord,
  Provider,
  ProviderRecord,
  UberRecord,
} from "@/lib/types";

const location = (area: string, lat: string, lon: string) => ({
  area,
  latitude: Number(lat),
  longitude: Number(lon),
});
const cleanLabel = (value: string) =>
  value
    .replace(/\bdemo\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

export function normalizeRecord(
  provider: Provider,
  record: ProviderRecord,
): NormalizedActivity {
  if (provider === "foodpanda") {
    const r = record as FoodpandaRecord;
    return {
      id: r.order_id,
      provider,
      userId: r.user_id,
      phone: r.phone,
      customerName: cleanLabel(r.customer_name),
      activityType: "food_order",
      occurredAt: r.order_time,
      sourceUpdatedAt: r.source_updated_at,
      status: r.order_status,
      destination: location(r.delivery_area, r.delivery_lat, r.delivery_lon),
      amount: Number(r.order_amount_bdt),
      title: cleanLabel(r.restaurant_name),
      description: `${r.restaurant_category} order delivered to ${r.delivery_area}`,
      metadata: {
        restaurant: cleanLabel(r.restaurant_name),
        category: r.restaurant_category,
        payment: r.payment_method,
      },
    };
  }
  if (provider === "daraz") {
    const r = record as DarazRecord;
    return {
      id: r.order_id,
      provider,
      userId: r.user_id,
      phone: r.phone,
      customerName: cleanLabel(r.customer_name),
      activityType: "ecommerce_order",
      occurredAt: r.order_time,
      sourceUpdatedAt: r.source_updated_at,
      status: r.order_status,
      destination: location(r.delivery_area, r.delivery_lat, r.delivery_lon),
      amount: Number(r.order_amount_bdt),
      title: cleanLabel(r.seller_name),
      description: `${r.item_count} ${r.product_category} item(s) to ${r.delivery_area}`,
      metadata: {
        seller: cleanLabel(r.seller_name),
        category: r.product_category,
        items: Number(r.item_count),
        payment: r.payment_method,
      },
    };
  }
  if (provider === "pathao") {
    const r = record as PathaoRecord;
    return {
      id: r.parcel_id,
      provider,
      userId: r.user_id,
      phone: r.phone,
      customerName: cleanLabel(r.customer_name),
      activityType: "courier_delivery",
      occurredAt: r.booking_time,
      sourceUpdatedAt: r.source_updated_at,
      status: r.parcel_status,
      origin: location(r.pickup_area, r.pickup_lat, r.pickup_lon),
      destination: location(r.delivery_area, r.delivery_lat, r.delivery_lon),
      amount: Number(r.delivery_charge_bdt),
      title: `${r.parcel_type.replaceAll("_", " ")} parcel`,
      description: `${r.pickup_area} to ${r.delivery_area}`,
      metadata: { role: r.user_role, parcelType: r.parcel_type },
    };
  }
  const r = record as UberRecord;
  return {
    id: r.trip_id,
    provider,
    userId: r.user_id,
    phone: r.phone,
    customerName: cleanLabel(r.customer_name),
    activityType: "ride",
    occurredAt: r.request_time,
    sourceUpdatedAt: r.source_updated_at,
    status: r.trip_status,
    origin: location(r.pickup_area, r.pickup_lat, r.pickup_lon),
    destination: location(r.dropoff_area, r.dropoff_lat, r.dropoff_lon),
    amount: Number(r.fare_bdt),
    title: `${r.vehicle_type} ride`,
    description: `${r.pickup_area} to ${r.dropoff_area}`,
    metadata: {
      vehicle: r.vehicle_type,
      distanceKm: Number(r.distance_km),
      durationMin: Number(r.duration_min),
    },
  };
}
