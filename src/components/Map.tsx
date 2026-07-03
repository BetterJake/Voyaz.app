"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Map,
  Marker,
  InfoWindow,
  useMap,
  useMapsLibrary,
  useApiLoadingStatus,
  APILoadingStatus,
} from "@vis.gl/react-google-maps";

import { FaWalking, FaCar, FaMapMarkedAlt } from "react-icons/fa";

function MapUnavailable({ reason }: { reason: string }) {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-3 bg-gray-50 text-center p-8 rounded-2xl border border-gray-100">
      <FaMapMarkedAlt className="text-4xl text-gray-300" />
      <p className="text-sm font-bold text-gray-500">Map preview unavailable</p>
      <p className="text-xs text-gray-400 max-w-xs">{reason}</p>
    </div>
  );
}

function Directions({
  places,
  travelMode = "WALKING",
}: {
  places: any[];
  travelMode?: "WALKING" | "DRIVING";
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(
      new routesLibrary.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#2563EB",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      })
    );
  }, [routesLibrary, map]);

  useEffect(() => {
    const validPlaces = places.filter(
      (p) => p && typeof p.lat === "number" && typeof p.lng === "number"
    );
    if (!directionsService || !directionsRenderer || validPlaces.length < 2) {
      if (directionsRenderer) directionsRenderer.setMap(null);
      return;
    }

    const origin = { lat: validPlaces[0].lat, lng: validPlaces[0].lng };
    const destination = {
      lat: validPlaces[validPlaces.length - 1].lat,
      lng: validPlaces[validPlaces.length - 1].lng,
    };
    const waypoints = validPlaces.slice(1, -1).map((p) => ({
      location: { lat: p.lat, lng: p.lng },
      stopover: true,
    }));

    directionsService
      .route({
        origin,
        destination,
        waypoints,
        travelMode:
          travelMode === "DRIVING"
            ? google.maps.TravelMode.DRIVING
            : google.maps.TravelMode.WALKING,
        optimizeWaypoints: true,
      })
      .then((result) => {
        directionsRenderer.setMap(map);
        directionsRenderer.setDirections(result);
      })
      .catch((e) => console.warn("Directions request failed:", e));
  }, [directionsService, directionsRenderer, places, map, travelMode]);

  return null;
}

function MapHandler({
  places,
  focusedPlaceIndex,
}: {
  places: any[];
  focusedPlaceIndex: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !places || places.length === 0) return;

    const validPlaces = places.filter(
      (p) => p && typeof p.lat === "number" && typeof p.lng === "number"
    );
    if (validPlaces.length === 0) return;

    if (
      focusedPlaceIndex !== null &&
      places[focusedPlaceIndex] &&
      typeof places[focusedPlaceIndex].lat === "number"
    ) {
      const place = places[focusedPlaceIndex];
      map.panTo({ lat: place.lat, lng: place.lng });
      map.setZoom(16);
    } else {
      const bounds = new google.maps.LatLngBounds();
      validPlaces.forEach((place) => {
        bounds.extend({ lat: place.lat, lng: place.lng });
      });
      map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
    }
  }, [map, places, focusedPlaceIndex]);

  return null;
}

interface MapProps {
  places: Array<{
    name: string;
    lat?: number;
    lng?: number;
    rating?: number;
    googleMapsUri?: string;
    price_range?: string;
    image_url?: string;
  }>;
  destinationName?: string;
  focusedPlaceIndex?: number | null;
  onMarkerClick?: (index: number) => void;
  onCoordinatesFetched?: (
    index: number,
    lat: number,
    lng: number,
    website?: string,
    photoUrl?: string
  ) => void;
}

export default function GoogleMapComponent({
  places = [],
  destinationName,
  focusedPlaceIndex = null,
  onMarkerClick,
  onCoordinatesFetched,
}: MapProps) {
  const map = useMap();
  const placesLibrary = useMapsLibrary("places");
  const apiStatus = useApiLoadingStatus();
  const [authFailed, setAuthFailed] = useState(false);
  const [openInfoWindowId, setOpenInfoWindowId] = useState<number | null>(null);
  const [travelMode, setTravelMode] = useState<"WALKING" | "DRIVING">("WALKING");
  const fetchedPlacesRef = useRef<Set<string>>(new Set());

  // Google calls window.gm_authFailure() when the key is invalid or billing is
  // disabled. The library does not hook into it, so it would otherwise render
  // Google's raw "can't load Google Maps" overlay - catch it and show our own.
  useEffect(() => {
    const w = window as unknown as { gm_authFailure?: () => void };
    w.gm_authFailure = () => setAuthFailed(true);
    return () => {
      w.gm_authFailure = undefined;
    };
  }, []);

  useEffect(() => {
    if (focusedPlaceIndex !== null) {
      setOpenInfoWindowId(focusedPlaceIndex);
    }
  }, [focusedPlaceIndex]);

  useEffect(() => {
    if (!map || !placesLibrary || !places || !places.length) return;

    const fetchPlaceDetails = async (placeName: string, idx: number) => {
      if (fetchedPlacesRef.current.has(placeName)) return;
      fetchedPlacesRef.current.add(placeName);

      try {
        console.log(`[Map] Requesting data for: "${placeName}" in "${destinationName}"`);

        const service = new google.maps.places.PlacesService(map);
        // Use destinationName as a bias to find the correct place
        const query = destinationName ? `${placeName}, ${destinationName}` : placeName;

        service.textSearch({ query }, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
            const res = results[0];
            if (res.place_id) {
              service.getDetails(
                {
                  placeId: res.place_id,
                  fields: ["geometry", "name", "website", "url", "photos", "rating"],
                },
                (details, detailStatus) => {
                  if (
                    detailStatus === google.maps.places.PlacesServiceStatus.OK &&
                    details &&
                    details.geometry?.location
                  ) {
                    const loc = details.geometry.location;
                    const website = details.website || details.url;
                    const photoUrl =
                      details.photos && details.photos.length > 0
                        ? details.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 })
                        : undefined;

                    if (onCoordinatesFetched) {
                      onCoordinatesFetched(idx, loc.lat(), loc.lng(), website, photoUrl);
                    }
                  }
                }
              );
            }
          }
        });
      } catch (error) {
        console.error(`[Map] Geocoding error for "${placeName}":`, error);
      }
    };

    places.forEach((place, idx) => {
      if (place && (typeof place.lat !== "number" || isNaN(place.lat))) {
        fetchPlaceDetails(place.name, idx);
      }
    });
  }, [map, placesLibrary, places, onCoordinatesFetched, destinationName]);

  // Degrade gracefully when Google Maps can't load (missing key, disabled
  // billing, or invalid key) instead of showing Google's broken error overlay.
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <MapUnavailable reason="Interactive maps are disabled in this demo. Add a Google Maps API key to enable them." />
    );
  }
  if (
    authFailed ||
    apiStatus === APILoadingStatus.AUTH_FAILURE ||
    apiStatus === APILoadingStatus.FAILED
  ) {
    return (
      <MapUnavailable reason="The Google Maps key is missing billing or the required APIs. Enable them in Google Cloud to show the map." />
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] bg-gray-50 relative">
      {/* Travel Mode Toggle */}
      <div className="absolute top-4 left-4 z-10 flex bg-white/90 backdrop-blur rounded-2xl shadow-xl p-1 border border-gray-100">
        <button
          onClick={() => setTravelMode("WALKING")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${travelMode === "WALKING" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"}`}
        >
          <FaWalking /> Walk
        </button>
        <button
          onClick={() => setTravelMode("DRIVING")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${travelMode === "DRIVING" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"}`}
        >
          <FaCar /> Drive
        </button>
      </div>

      <Map
        defaultCenter={{ lat: 52.237, lng: 21.017 }}
        defaultZoom={12}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        clickableIcons={false}
        style={{ width: "100%", height: "100%" }}
      >
        <MapHandler places={places} focusedPlaceIndex={focusedPlaceIndex} />
        <Directions places={places} travelMode={travelMode} />

        {places &&
          places.map((place, idx) => {
            if (
              place &&
              typeof place.lat === "number" &&
              !isNaN(place.lat) &&
              typeof place.lng === "number" &&
              !isNaN(place.lng)
            ) {
              return (
                <Marker
                  key={`marker-${idx}-${place.lat}-${place.lng}`}
                  position={{ lat: place.lat, lng: place.lng }}
                  onClick={() => {
                    setOpenInfoWindowId(idx);
                    if (onMarkerClick) onMarkerClick(idx);
                  }}
                  label={{
                    text: (idx + 1).toString(),
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                />
              );
            }
            return null;
          })}

        {openInfoWindowId !== null &&
          places[openInfoWindowId] &&
          typeof places[openInfoWindowId].lat === "number" && (
            <InfoWindow
              position={{ lat: places[openInfoWindowId].lat!, lng: places[openInfoWindowId].lng! }}
              onCloseClick={() => setOpenInfoWindowId(null)}
            >
              <div className="p-2 min-w-[150px]">
                <h3 className="font-bold text-sm mb-1 text-gray-900">
                  {openInfoWindowId + 1}. {places[openInfoWindowId].name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  {places[openInfoWindowId].rating && (
                    <span className="text-yellow-600 text-xs font-black">
                      ★ {places[openInfoWindowId].rating}
                    </span>
                  )}
                  {places[openInfoWindowId].price_range && (
                    <span className="text-green-600 text-[9px] font-black px-1.5 py-0.5 bg-green-50 rounded border border-green-100 uppercase">
                      {places[openInfoWindowId].price_range}
                    </span>
                  )}
                </div>
                {places[openInfoWindowId].googleMapsUri && (
                  <a
                    href={places[openInfoWindowId].googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-all block text-center no-underline"
                  >
                    View on Maps
                  </a>
                )}
              </div>
            </InfoWindow>
          )}
      </Map>
    </div>
  );
}
