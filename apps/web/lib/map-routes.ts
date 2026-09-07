import type { MapRoute } from "@/components/marketing/world-map";

/** Illustrative creator locations — not live user data. */
export const CREATOR_ROUTES: MapRoute[] = [
  { start: { lat: 40.7128, lng: -74.006, label: "New York" }, end: { lat: 51.5074, lng: -0.1278, label: "London" } },
  { start: { lat: 51.5074, lng: -0.1278, label: "London" }, end: { lat: 28.6139, lng: 77.209, label: "New Delhi" } },
  { start: { lat: 28.6139, lng: 77.209, label: "New Delhi" }, end: { lat: 35.6762, lng: 139.6503, label: "Tokyo" } },
  { start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" }, end: { lat: 40.7128, lng: -74.006, label: "New York" } },
  { start: { lat: 1.3521, lng: 103.8198, label: "Singapore" }, end: { lat: -33.8688, lng: 151.2093, label: "Sydney" } },
  { start: { lat: 6.5244, lng: 3.3792, label: "Lagos" }, end: { lat: 51.5074, lng: -0.1278, label: "London" } },
];
