import { z } from "zod";

const common = {
  user_id: z.string().regex(/^USR\d{3}$/i),
  phone: z.string().regex(/^\d{11}$/),
  customer_name: z.string().min(1),
  source_updated_at: z.iso.datetime({ offset: true }),
  synthetic: z.string().transform((value) => value.toLowerCase() === "true"),
};
const coordinate = z.string().refine((value) => Number.isFinite(Number(value)));
const numeric = z.string().refine((value) => Number.isFinite(Number(value)));

export const foodpandaSchema = z.object({
  ...common,
  order_id: z.string(),
  order_time: z.iso.datetime({ offset: true }),
  restaurant_name: z.string(),
  restaurant_category: z.string(),
  delivery_area: z.string(),
  delivery_lat: coordinate,
  delivery_lon: coordinate,
  order_amount_bdt: numeric,
  payment_method: z.string(),
  order_status: z.string(),
});
export const darazSchema = z.object({
  ...common,
  order_id: z.string(),
  order_time: z.iso.datetime({ offset: true }),
  seller_name: z.string(),
  product_category: z.string(),
  item_count: numeric,
  delivery_area: z.string(),
  delivery_lat: coordinate,
  delivery_lon: coordinate,
  order_amount_bdt: numeric,
  payment_method: z.string(),
  order_status: z.string(),
});
export const pathaoSchema = z.object({
  ...common,
  parcel_id: z.string(),
  user_role: z.string(),
  booking_time: z.iso.datetime({ offset: true }),
  parcel_type: z.string(),
  pickup_area: z.string(),
  pickup_lat: coordinate,
  pickup_lon: coordinate,
  delivery_area: z.string(),
  delivery_lat: coordinate,
  delivery_lon: coordinate,
  delivery_charge_bdt: numeric,
  parcel_status: z.string(),
});
export const uberSchema = z.object({
  ...common,
  trip_id: z.string(),
  request_time: z.iso.datetime({ offset: true }),
  vehicle_type: z.string(),
  pickup_area: z.string(),
  pickup_lat: coordinate,
  pickup_lon: coordinate,
  dropoff_area: z.string(),
  dropoff_lat: coordinate,
  dropoff_lon: coordinate,
  distance_km: numeric,
  duration_min: numeric,
  fare_bdt: numeric,
  trip_status: z.string(),
});
