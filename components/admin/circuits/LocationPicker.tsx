"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "@/components/map/leaflet-styles.css";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LocationValue {
  nom: string;
  lat: number | null;
  lng: number | null;
}

export interface LocationPickerProps {
  /** Prefix for hidden input names (e.g. "lieuDepart" → lieuDepartNom, lieuDepartLat, lieuDepartLng) */
  prefix: string;
  /** Label displayed above the picker */
  label: string;
  /** Initial values when editing an existing circuit */
  initialValue?: LocationValue;
}

// ─── Marker icon ─────────────────────────────────────────────────────────────

function createPickerIcon(type: "depart" | "arrivee") {
  const color = type === "depart" ? "#059669" : "#dc2626";
  const emoji = type === "depart" ? "🟢" : "🔴";
  return L.divIcon({
    html: `
      <div class="custom-leaflet-marker" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <div class="marker-pin" style="background: ${color}; width: 36px; height: 36px; font-size: 16px;">
          ${emoji}
        </div>
      </div>
    `,
    className: "custom-leaflet-div-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

// ─── Nominatim geocoding ─────────────────────────────────────────────────────

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=mg&accept-language=fr`;
  const res = await fetch(url, {
    headers: { "User-Agent": "VoyageSurMesure/1.0" },
  });
  if (!res.ok) return [];
  return res.json();
}

async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`;
  const res = await fetch(url, {
    headers: { "User-Agent": "VoyageSurMesure/1.0" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  // Build a readable name from address components
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

// ─── Map click handler ──────────────────────────────────────────────────────

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Map view updater ────────────────────────────────────────────────────────

function MapViewUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { duration: 1 });
    }
  }, [center, map]);
  return null;
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function LocationPicker({
  prefix,
  label,
  initialValue,
}: LocationPickerProps) {
  const type = prefix.includes("Depart") ? "depart" : "arrivee";
  const markerIcon = createPickerIcon(type);

  const [nom, setNom] = useState(initialValue?.nom || "");
  const [lat, setLat] = useState<number | null>(initialValue?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initialValue?.lng ?? null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fly-to trigger
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  // Close results dropdown when clicking outside
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

  // Handle map click
  const handleLocationSelect = useCallback(
    async (newLat: number, newLng: number) => {
      setLat(newLat);
      setLng(newLng);
      // Reverse geocode to get a name
      const name = await reverseGeocode(newLat, newLng);
      if (name) {
        setNom(name);
      }
    },
    []
  );

  // Handle search
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

  // Debounced search on typing
  const handleSearchInputChange = useCallback(
    (value: string) => {
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
        }, 600);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    },
    []
  );

  // Select a search result
  const handleSelectResult = useCallback((result: NominatimResult) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    setLat(newLat);
    setLng(newLng);
    // Build a clean name
    const nameParts = result.display_name.split(",").slice(0, 2);
    setNom(nameParts.join(",").trim());
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setFlyTarget([newLat, newLng]);
  }, []);

  // Clear selection
  const handleClear = useCallback(() => {
    setLat(null);
    setLng(null);
    setNom("");
  }, []);

  // Initial fly-to for existing values
  const hasInitialFlown = useRef(false);
  useEffect(() => {
    if (!hasInitialFlown.current && initialValue?.lat && initialValue?.lng) {
      setFlyTarget([initialValue.lat, initialValue.lng]);
      hasInitialFlown.current = true;
    }
  }, [initialValue]);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {label}
      </Label>

      {/* Search bar */}
      <div className="relative" ref={resultsRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un lieu à Madagascar..."
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="pl-9 h-9"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="h-9"
          >
            Chercher
          </Button>
        </div>

        {/* Search results dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1.5 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl max-h-56 overflow-y-auto p-1 divide-y divide-border/30">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full text-left px-3 py-2 text-xs font-medium text-popover-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors flex items-start gap-2.5 cursor-pointer outline-hidden"
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

      {/* Map */}
      <div className="rounded-xl overflow-hidden border h-[280px] relative">
        <MapContainer
          center={
            lat && lng
              ? [lat, lng]
              : [-18.8792, 47.5079] // Centre de Madagascar
          }
          zoom={lat && lng ? 12 : 6}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="madagascar-map-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <MapViewUpdater center={flyTarget} />

          {lat !== null && lng !== null && (
            <Marker
              position={[lat, lng]}
              icon={markerIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  handleLocationSelect(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>

        {/* Hint overlay */}
        {lat === null && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]">
            <div className="bg-background/80 backdrop-blur-sm text-sm text-muted-foreground px-4 py-2 rounded-full border shadow-sm">
              Cliquez sur la carte pour placer le marqueur
            </div>
          </div>
        )}
      </div>

      {/* Selected location info */}
      {lat !== null && lng !== null && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border text-sm">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor={`${prefix}Nom`} className="text-xs text-muted-foreground whitespace-nowrap">
                Nom du lieu
              </Label>
              <Input
                id={`${prefix}Nom`}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom du lieu..."
                className="h-7 text-sm"
              />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>
                📍 Lat: <strong className="text-foreground">{lat.toFixed(6)}</strong>
              </span>
              <span>
                Lng: <strong className="text-foreground">{lng.toFixed(6)}</strong>
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 shrink-0"
            title="Effacer la sélection"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Hidden form inputs for Server Actions / standard form submission */}
      <input type="hidden" name={`${prefix}Nom`} value={nom} />
      <input
        type="hidden"
        name={`${prefix}Lat`}
        value={lat !== null ? lat.toString() : ""}
      />
      <input
        type="hidden"
        name={`${prefix}Lng`}
        value={lng !== null ? lng.toString() : ""}
      />
    </div>
  );
}
