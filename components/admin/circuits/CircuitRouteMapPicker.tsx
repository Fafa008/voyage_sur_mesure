"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Search,
  X,
  Loader2,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import "@/components/map/leaflet-styles.css";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LocationPoint {
  nom: string;
  lat: number | null;
  lng: number | null;
}

export interface CircuitRouteMapPickerProps {
  initialDepart?: LocationPoint;
  initialArrivee?: LocationPoint;
}

// ─── Marker Icons ─────────────────────────────────────────────────────────────

function createMarkerIcon(type: "depart" | "arrivee") {
  const isDepart = type === "depart";
  const bg = isDepart
    ? "linear-gradient(135deg, #10b981, #047857)"
    : "linear-gradient(135deg, #ef4444, #b91c1c)";
  const label = isDepart ? "🟢 Départ" : "🔴 Arrivée";
  const iconEmoji = isDepart ? "📍" : "🏁";

  return L.divIcon({
    html: `
      <div class="custom-leaflet-marker" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35)); cursor: grab;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div class="marker-pin" style="background: ${bg}; width: 38px; height: 38px; font-size: 18px; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
            ${iconEmoji}
          </div>
          <div style="background: rgba(15, 23, 42, 0.88); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-top: 2px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);">
            ${label}
          </div>
        </div>
      </div>
    `,
    className: "custom-leaflet-div-icon",
    iconSize: [60, 60],
    iconAnchor: [30, 20],
    popupAnchor: [0, -20],
  });
}

const DEPART_ICON = createMarkerIcon("depart");
const ARRIVEE_ICON = createMarkerIcon("arrivee");

// ─── Nominatim Geocoding Services ───────────────────────────────────────────

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=5&countrycodes=mg&accept-language=fr`;
  const res = await fetch(url, {
    headers: { "User-Agent": "VoyageSurMesure/1.0" },
  });
  if (!res.ok) return [];
  return res.json();
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`;
  const res = await fetch(url, {
    headers: { "User-Agent": "VoyageSurMesure/1.0" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const addr = data.address;
  if (addr) {
    const parts = [
      addr.village || addr.town || addr.city || addr.hamlet,
      addr.county || addr.state,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  return data.display_name?.split(",").slice(0, 2).join(",") || null;
}

// ─── Map Event Handlers & View Controllers ───────────────────────────────────

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapViewController({
  bounds,
  flyTarget,
  triggerRecenter,
}: {
  bounds: L.LatLngBounds | null;
  flyTarget: [number, number] | null;
  triggerRecenter: number;
}) {
  const map = useMap();

  // Fly to single point when searched or selected
  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget, 12, { duration: 1 });
    }
  }, [flyTarget, map]);

  // Fit bounds when recentering or when both points exist
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else if (!bounds && triggerRecenter > 0) {
      map.setView([-18.8792, 47.5079], 6);
    }
  }, [bounds, triggerRecenter, map]);

  return null;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CircuitRouteMapPicker({
  initialDepart,
  initialArrivee,
}: CircuitRouteMapPickerProps) {
  // Mode selection state: "depart" | "arrivee"
  const [activeMode, setActiveMode] = useState<"depart" | "arrivee">("depart");

  // Depart location state
  const [departNom, setDepartNom] = useState(initialDepart?.nom || "");
  const [departLat, setDepartLat] = useState<number | null>(
    initialDepart?.lat ?? null
  );
  const [departLng, setDepartLng] = useState<number | null>(
    initialDepart?.lng ?? null
  );

  // Arrivee location state
  const [arriveeNom, setArriveeNom] = useState(initialArrivee?.nom || "");
  const [arriveeLat, setArriveeLat] = useState<number | null>(
    initialArrivee?.lat ?? null
  );
  const [arriveeLng, setArriveeLng] = useState<number | null>(
    initialArrivee?.lng ?? null
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // View controllers
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set location for the currently active mode
  const setPointLocation = useCallback(
    async (mode: "depart" | "arrivee", lat: number, lng: number, customName?: string) => {
      if (mode === "depart") {
        setDepartLat(lat);
        setDepartLng(lng);
        if (customName) {
          setDepartNom(customName);
        } else {
          const name = await reverseGeocode(lat, lng);
          if (name) setDepartNom(name);
        }
      } else {
        setArriveeLat(lat);
        setArriveeLng(lng);
        if (customName) {
          setArriveeNom(customName);
        } else {
          const name = await reverseGeocode(lat, lng);
          if (name) setArriveeNom(name);
        }
      }
    },
    []
  );

  // Map click handler
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setPointLocation(activeMode, lat, lng);
    },
    [activeMode, setPointLocation]
  );

  // Search handler
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchNominatim(searchQuery);
      setSearchResults(results);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Debounced live search
  const handleSearchInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (value.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchNominatim(value);
          setSearchResults(results);
          setShowResults(true);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, []);

  // Select search result
  const handleSelectSearchResult = useCallback(
    (result: NominatimResult) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const cleanName = result.display_name.split(",").slice(0, 2).join(",").trim();

      setPointLocation(activeMode, lat, lng, cleanName);
      setSearchQuery("");
      setSearchResults([]);
      setShowResults(false);
      setFlyTarget([lat, lng]);
    },
    [activeMode, setPointLocation]
  );

  // Clear single location
  const handleClearDepart = () => {
    setDepartLat(null);
    setDepartLng(null);
    setDepartNom("");
  };

  const handleClearArrivee = () => {
    setArriveeLat(null);
    setArriveeLng(null);
    setArriveeNom("");
  };

  // Compute bounding box for map view
  const mapBounds = useMemo(() => {
    const hasDepart = departLat !== null && departLng !== null;
    const hasArrivee = arriveeLat !== null && arriveeLng !== null;

    if (hasDepart && hasArrivee) {
      return L.latLngBounds([
        [departLat!, departLng!],
        [arriveeLat!, arriveeLng!],
      ]);
    }
    if (hasDepart) {
      return L.latLngBounds([
        [departLat! - 0.5, departLng! - 0.5],
        [departLat! + 0.5, departLng! + 0.5],
      ]);
    }
    if (hasArrivee) {
      return L.latLngBounds([
        [arriveeLat! - 0.5, arriveeLng! - 0.5],
        [arriveeLat! + 0.5, arriveeLng! + 0.5],
      ]);
    }
    return null;
  }, [departLat, departLng, arriveeLat, arriveeLng]);

  // Initial bounds setup on mount for edit mode
  const hasInitializedBounds = useRef(false);
  useEffect(() => {
    if (!hasInitializedBounds.current) {
      if (mapBounds) {
        setRecenterTrigger((prev) => prev + 1);
        hasInitializedBounds.current = true;
      }
    }
  }, [mapBounds]);

  const hasBothPoints =
    departLat !== null &&
    departLng !== null &&
    arriveeLat !== null &&
    arriveeLng !== null;

  return (
    <div className="space-y-4">
      {/* ─── Mode Selection & Actions Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Mode sélection :
          </span>
          <div className="inline-flex rounded-lg p-1 bg-background border shadow-xs">
            <button
              type="button"
              onClick={() => setActiveMode("depart")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === "depart"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              <span>📍 Départ</span>
              {departLat !== null && (
                <CheckCircle2 className="w-3 h-3 text-emerald-200 ml-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("arrivee")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === "arrivee"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping" />
              <span>🏁 Arrivée</span>
              {arriveeLat !== null && (
                <CheckCircle2 className="w-3 h-3 text-rose-200 ml-0.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mapBounds && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRecenterTrigger((prev) => prev + 1)}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Recentrer
            </Button>
          )}
          <span className="text-xs text-muted-foreground hidden md:inline-block">
            {activeMode === "depart"
              ? "👉 Cliquez sur la carte ou recherchez pour définir le départ"
              : "👉 Cliquez sur la carte ou recherchez pour définir l'arrivée"}
          </span>
        </div>
      </div>

      {/* ─── Search Bar ────────────────────────────────────────────────────── */}
      <div className="relative" ref={resultsRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Rechercher le lieu pour ${
                activeMode === "depart" ? "le Départ (🟢)" : "l'Arrivée (🔴)"
              }...`}
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="pl-9 h-10 text-sm bg-card"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="h-10 px-4 cursor-pointer"
          >
            Rechercher
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1.5 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl max-h-56 overflow-y-auto p-1 divide-y divide-border/30">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors flex items-start gap-2.5 cursor-pointer outline-hidden"
              >
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <span className="line-clamp-2 leading-relaxed">
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Single Interactive Leaflet Map ─────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden border h-[380px] sm:h-[420px] relative shadow-sm">
        <MapContainer
          center={[-18.8792, 47.5079]}
          zoom={6}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="madagascar-map-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onMapClick={handleMapClick} />
          <MapViewController
            bounds={mapBounds}
            flyTarget={flyTarget}
            triggerRecenter={recenterTrigger}
          />

          {/* Departure Marker 🟢 */}
          {departLat !== null && departLng !== null && (
            <Marker
              position={[departLat, departLng]}
              icon={DEPART_ICON}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  setPointLocation("depart", pos.lat, pos.lng);
                },
              }}
            >
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <strong className="text-emerald-600 block text-sm">
                    📍 Point de départ
                  </strong>
                  <p className="font-medium text-foreground">{departNom || "Non nommé"}</p>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    Lat: {departLat.toFixed(6)}, Lng: {departLng.toFixed(6)}
                  </p>
                  <span className="text-[10px] text-muted-foreground block italic">
                    Glissez le marqueur pour ajuster
                  </span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Arrival Marker 🔴 */}
          {arriveeLat !== null && arriveeLng !== null && (
            <Marker
              position={[arriveeLat, arriveeLng]}
              icon={ARRIVEE_ICON}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  setPointLocation("arrivee", pos.lat, pos.lng);
                },
              }}
            >
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <strong className="text-rose-600 block text-sm">
                    🏁 Point d&apos;arrivée
                  </strong>
                  <p className="font-medium text-foreground">{arriveeNom || "Non nommé"}</p>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    Lat: {arriveeLat.toFixed(6)}, Lng: {arriveeLng.toFixed(6)}
                  </p>
                  <span className="text-[10px] text-muted-foreground block italic">
                    Glissez le marqueur pour ajuster
                  </span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Visual Polyline connecting Départ and Arrivée */}
          {hasBothPoints && (
            <Polyline
              positions={[
                [departLat!, departLng!],
                [arriveeLat!, arriveeLng!],
              ]}
              pathOptions={{
                color: "#2563eb",
                weight: 3.5,
                opacity: 0.85,
                dashArray: "8, 8",
              }}
            />
          )}
        </MapContainer>

        {/* Dynamic Map Helper Overlay */}
        {departLat === null && arriveeLat === null && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none z-[400] px-4">
            <div className="bg-background/90 backdrop-blur-md text-xs text-foreground px-4 py-2 rounded-full border shadow-md flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Cliquez sur la carte pour définir le <strong>point de départ</strong>
            </div>
          </div>
        )}
      </div>

      {/* ─── Location Summary & Inputs Grid ─────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 pt-1">
        {/* Departure Summary Card */}
        <div
          onClick={() => setActiveMode("depart")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeMode === "depart"
              ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-xs"
              : "bg-card border-border/80 hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 py-1">
                📍 Point de départ
              </Badge>
              {activeMode === "depart" && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  (Actif)
                </span>
              )}
            </div>
            {departLat !== null && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearDepart();
                }}
                className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                title="Effacer le départ"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <Label
                htmlFor="lieuDepartNom"
                className="text-xs text-muted-foreground font-medium"
              >
                Nom du lieu de départ
              </Label>
              <Input
                id="lieuDepartNom"
                value={departNom}
                onChange={(e) => setDepartNom(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Ex: Antananarivo, Aéroport Ivato..."
                className="h-9 mt-1 text-sm bg-background"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
              <span>
                Lat :{" "}
                <strong className="text-foreground font-mono">
                  {departLat !== null ? departLat.toFixed(6) : "Non défini"}
                </strong>
              </span>
              <span>
                Lng :{" "}
                <strong className="text-foreground font-mono">
                  {departLng !== null ? departLng.toFixed(6) : "Non défini"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Arrival Summary Card */}
        <div
          onClick={() => setActiveMode("arrivee")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeMode === "arrivee"
              ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-500/60 ring-2 ring-rose-500/20 shadow-xs"
              : "bg-card border-border/80 hover:border-rose-500/40"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1 py-1">
                🏁 Point d&apos;arrivée
              </Badge>
              {activeMode === "arrivee" && (
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  (Actif)
                </span>
              )}
            </div>
            {arriveeLat !== null && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearArrivee();
                }}
                className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                title="Effacer l'arrivée"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <Label
                htmlFor="lieuArriveeNom"
                className="text-xs text-muted-foreground font-medium"
              >
                Nom du lieu d&apos;arrivée
              </Label>
              <Input
                id="lieuArriveeNom"
                value={arriveeNom}
                onChange={(e) => setArriveeNom(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Ex: Nosy Be, Tuléar, Sainte-Marie..."
                className="h-9 mt-1 text-sm bg-background"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
              <span>
                Lat :{" "}
                <strong className="text-foreground font-mono">
                  {arriveeLat !== null ? arriveeLat.toFixed(6) : "Non défini"}
                </strong>
              </span>
              <span>
                Lng :{" "}
                <strong className="text-foreground font-mono">
                  {arriveeLng !== null ? arriveeLng.toFixed(6) : "Non défini"}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Hidden Inputs for Server Actions / FormData ────────────────────── */}
      <input type="hidden" name="lieuDepartNom" value={departNom} />
      <input
        type="hidden"
        name="lieuDepartLat"
        value={departLat !== null ? departLat.toString() : ""}
      />
      <input
        type="hidden"
        name="lieuDepartLng"
        value={departLng !== null ? departLng.toString() : ""}
      />

      <input type="hidden" name="lieuArriveeNom" value={arriveeNom} />
      <input
        type="hidden"
        name="lieuArriveeLat"
        value={arriveeLat !== null ? arriveeLat.toString() : ""}
      />
      <input
        type="hidden"
        name="lieuArriveeLng"
        value={arriveeLng !== null ? arriveeLng.toString() : ""}
      />
    </div>
  );
}
