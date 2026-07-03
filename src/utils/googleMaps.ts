import { Place } from "@/features/trips/types";
export function generateDirectionsUrl(places: Place[]): string {
  if (!places || places.length === 0) return "";
  const baseUrl = "https://www.google.com/maps/dir/?api=1";
  const origin = encodeURIComponent(
    places[0].lat !== undefined && places[0].lng !== undefined
      ? `${places[0].lat},${places[0].lng}`
      : places[0].name
  );
  const destination = encodeURIComponent(
    places[places.length - 1].lat !== undefined && places[places.length - 1].lng !== undefined
      ? `${places[places.length - 1].lat},${places[places.length - 1].lng}`
      : places[places.length - 1].name
  );
  const waypointsList = places.slice(1, -1).slice(0, 10);
  const waypoints =
    waypointsList.length > 0
      ? `&waypoints=${waypointsList
          .map((p) =>
            encodeURIComponent(
              p.lat !== undefined && p.lng !== undefined ? `${p.lat},${p.lng}` : p.name
            )
          )
          .join("|")}`
      : "";
  return `${baseUrl}&origin=${origin}&destination=${destination}${waypoints}&travelmode=walking`;
}
