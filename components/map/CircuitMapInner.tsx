"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  GeoJSON,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "./leaflet-styles.css";
import {
  MADAGASCAR_REGIONS,
  getMadagascarGeoJSON,
} from "@/lib/data/madagascar-regions";
import {
  NATIONAL_PARKS,
  FEATURED_HOTELS,
  getCoordinatesForCity,
  PointOfInterest,
} from "@/lib/data/madagascar-pois";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Hotel,
  Trees,
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  EyeOff,
  Navigation,
} from "lucide-react";

// Types pour les données du circuit
export interface CircuitMapProps {
  circuit: {
    id: number;
    titre: string;
    description?: string | null;
    region?: { id: number; nom: string } | null;
    etapes?: Array<{
      id: number;
      ordre: number;
      ville?: string | null;
      description?: string | null;
      hebergement?: {
        id: number;
        nom: string;
        type?: string | null;
        etoiles?: number | null;
        adresse?: string | null;
      } | null;
      activites?: Array<{
        id: number;
        nom: string;
        description?: string | null;
      }>;
    }>;
  };
  height?: string;
}

// Fonction utilitaire pour générer un DivIcon Leaflet HTML personnalisé avec Lucide/Emoji
function createCustomIcon(
  type: "step" | "hotel" | "park" | "city",
  label: string | number,
  title?: string,
) {
  const pinClass =
    type === "step"
      ? "marker-pin-step"
      : type === "hotel"
        ? "marker-pin-hotel"
        : type === "park"
          ? "marker-pin-park"
          : "marker-pin-city";

  const iconHtml = `
    <div class="custom-leaflet-marker" title="${title || ""}">
      <div class="marker-pin ${pinClass}">
        ${label}
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: "custom-leaflet-div-icon",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

// Composant interne pour recadrer la vue de la carte
function FitBoundsController({
  bounds,
  trigger,
}: {
  bounds: L.LatLngBoundsExpression | null;
  trigger: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }
  }, [bounds, map, trigger]);

  return null;
}

export default function CircuitMapInner({
  circuit,
  height = "540px",
}: CircuitMapProps) {
  const [showRegions, setShowRegions] = useState(true);
  const [showHotels, setShowHotels] = useState(true);
  const [showParks, setShowParks] = useState(true);
  const [showItinerary, setShowItinerary] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fitTrigger, setFitTrigger] = useState(0);

  // GeoJSON des 24 régions
  const geoJsonData = useMemo(() => getMadagascarGeoJSON(), []);

  // Déterminer la région du circuit
  const currentRegionName = circuit.region?.nom?.toLowerCase() || "";
  const circuitRegion = useMemo(() => {
    return MADAGASCAR_REGIONS.find(
      (r) =>
        r.name.toLowerCase().includes(currentRegionName) ||
        currentRegionName.includes(r.name.toLowerCase()) ||
        r.id === currentRegionName,
    );
  }, [currentRegionName]);

  // Calcul des coordonnées pour chaque étape du circuit
  const etapePoints = useMemo(() => {
    if (!circuit.etapes || circuit.etapes.length === 0) return [];

    return circuit.etapes.map((etape) => {
      const coords = getCoordinatesForCity(etape.ville);
      return {
        ...etape,
        lat: coords.lat,
        lng: coords.lng,
        regionId: coords.regionId,
      };
    });
  }, [circuit.etapes]);

  // Coordonnées pour la ligne de l'itinéraire (Polyline)
  const itineraryPath = useMemo(() => {
    return etapePoints.map((pt) => [pt.lat, pt.lng] as [number, number]);
  }, [etapePoints]);

  // Calcul des limites géographiques (Bounds) pour la carte
  const initialBounds = useMemo(() => {
    if (itineraryPath.length > 0) {
      return L.latLngBounds(itineraryPath);
    }
    if (circuitRegion) {
      const [lat, lng] = circuitRegion.center;
      return L.latLngBounds([
        [lat - 1.2, lng - 1.2],
        [lat + 1.2, lng + 1.2],
      ]);
    }
    // Vue globale de Madagascar par défaut
    return L.latLngBounds([
      [-25.6, 43.0],
      [-11.8, 50.8],
    ]);
  }, [itineraryPath, circuitRegion]);

  // Réinitialiser la vue
  const handleRecenter = () => {
    setFitTrigger((prev) => prev + 1);
  };

  // Filtrer les hôtels & parcs en lien avec les régions du circuit ou l'ensemble si demandé
  const filteredHotels = useMemo(() => {
    // Si la région du circuit existe, mettre en avant les hôtels de cette région + généraux
    return FEATURED_HOTELS;
  }, []);

  const filteredParks = useMemo(() => {
    return NATIONAL_PARKS;
  }, []);

  // Style personnalisé pour les 24 régions dans la couche GeoJSON
  const getRegionStyle = (feature: any) => {
    const isSelected =
      circuitRegion && feature.properties.id === circuitRegion.id;
    return {
      fillColor: feature.properties.color || "#3b82f6",
      weight: isSelected ? 3 : 1,
      opacity: 0.8,
      color: isSelected ? "#e11d48" : "#94a3b8",
      dashArray: isSelected ? "" : "3",
      fillOpacity: isSelected ? 0.35 : 0.12,
    };
  };

  // Interactions sur les régions (survol / clic)
  const onEachRegion = (feature: any, layer: L.Layer) => {
    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          fillOpacity: 0.45,
          weight: 2,
        });
      },
      mouseout: (e) => {
        const target = e.target;
        const isSelected =
          circuitRegion && feature.properties.id === circuitRegion.id;
        target.setStyle({
          fillOpacity: isSelected ? 0.35 : 0.12,
          weight: isSelected ? 3 : 1,
        });
      },
    });
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border bg-background shadow-md transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : ""
      }`}
    >
      {/* En-tête de la carte avec contrôles de calques */}
      <div className="p-4 bg-card border-b flex flex-wrap items-center justify-between gap-3 z-10 relative shadow-sm">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
            Carte Interactive — Madagascar &amp; 24 Régions
          </h3>
          {circuit.region && (
            <Badge
              variant="default"
              className="hidden sm:inline-flex bg-primary text-primary-foreground"
            >
              {circuit.region.nom}
            </Badge>
          )}
        </div>

        {/* Boutons d'action et Filtres de calques */}
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
          {/* Toggle Régions */}
          <Button
            variant={showRegions ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRegions(!showRegions)}
            className="h-8 gap-1.5 text-xs"
          >
            <MapPin className="w-3.5 h-3.5" />
            24 Régions
          </Button>

          {/* Toggle Itinéraire */}
          <Button
            variant={showItinerary ? "default" : "outline"}
            size="sm"
            onClick={() => setShowItinerary(!showItinerary)}
            className="h-8 gap-1.5 text-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            Itinéraire ({etapePoints.length})
          </Button>

          {/* Toggle Hôtels */}
          <Button
            variant={showHotels ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHotels(!showHotels)}
            className="h-8 gap-1.5 text-xs"
          >
            <Hotel className="w-3.5 h-3.5 text-emerald-500" />
            Hôtels
          </Button>

          {/* Toggle Parcs */}
          <Button
            variant={showParks ? "default" : "outline"}
            size="sm"
            onClick={() => setShowParks(!showParks)}
            className="h-8 gap-1.5 text-xs"
          >
            <Trees className="w-3.5 h-3.5 text-amber-500" />
            Parcs
          </Button>

          {/* Recentrer */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRecenter}
            title="Recentrer la vue"
            className="h-8 w-8"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* Plein Écran */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Réduire" : "Plein écran"}
            className="h-8 w-8"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Rendu de la carte Leaflet */}
      <div
        style={{ height: isFullscreen ? "calc(100vh - 65px)" : height }}
        className="w-full relative"
      >
        <MapContainer
          center={[-18.8792, 47.5079]}
          zoom={6}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="madagascar-map-container"
        >
          <FitBoundsController bounds={initialBounds} trigger={fitTrigger} />

          {/* Couche de Fond de carte TileLayer (OpenStreetMap) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Couche 1 : Les 24 Régions de Madagascar (GeoJSON) */}
          {showRegions && (
            <GeoJSON
              data={geoJsonData}
              style={getRegionStyle}
              onEachFeature={(feature, layer) => {
                onEachRegion(feature, layer);
                layer.bindTooltip(
                  `<div><strong>${feature.properties.name}</strong><br/><span style="font-size: 11px;">Capitale: ${feature.properties.capital}</span></div>`,
                  { className: "region-tooltip", sticky: true },
                );
              }}
            />
          )}

          {/* Couche 2 : Tracé Polyline de l'Itinéraire */}
          {showItinerary && itineraryPath.length > 1 && (
            <Polyline
              positions={itineraryPath}
              pathOptions={{
                color: "#2563eb",
                weight: 4,
                opacity: 0.85,
                dashArray: "8, 6",
              }}
            />
          )}

          {/* Couche 3 : Marqueurs des Étapes de l'Itinéraire */}
          {showItinerary &&
            etapePoints.map((etape) => (
              <Marker
                key={`etape-${etape.id}`}
                position={[etape.lat, etape.lng]}
                icon={createCustomIcon(
                  "step",
                  etape.ordre,
                  `Étape ${etape.ordre}: ${etape.ville}`,
                )}
              >
                <Popup>
                  <div className="space-y-2 p-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                        {etape.ordre}
                      </span>
                      <h4 className="font-bold text-sm">
                        {etape.ville || `Étape ${etape.ordre}`}
                      </h4>
                    </div>
                    {etape.description && (
                      <p className="text-xs text-muted-foreground">
                        {etape.description}
                      </p>
                    )}

                    {etape.hebergement && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg text-xs space-y-1 border border-emerald-200">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300 block">
                          🏨 {etape.hebergement.nom}
                        </span>
                        {etape.hebergement.etoiles && (
                          <span className="text-amber-500 font-bold">
                            {"★".repeat(etape.hebergement.etoiles)}
                          </span>
                        )}
                      </div>
                    )}

                    {etape.activites && etape.activites.length > 0 && (
                      <div className="text-xs space-y-1">
                        <span className="font-semibold block">
                          🎯 Activités :
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                          {etape.activites.map((act) => (
                            <li key={act.id}>{act.nom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Couche 4 : Marqueurs des Hôtels Phares */}
          {showHotels &&
            filteredHotels.map((hotel) => (
              <Marker
                key={hotel.id}
                position={[hotel.lat, hotel.lng]}
                icon={createCustomIcon("hotel", "🏨", hotel.name)}
              >
                <Popup>
                  <div className="space-y-2 p-1 min-w-[220px]">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-[10px] border-emerald-500 text-emerald-600"
                      >
                        Hôtel &amp; Lodge
                      </Badge>
                      {hotel.rating && (
                        <span className="text-amber-500 text-xs font-bold">
                          {"★".repeat(hotel.rating)}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-foreground">
                      {hotel.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {hotel.description}
                    </p>
                    {hotel.address && (
                      <p className="text-[11px] font-medium text-slate-500">
                        📍 {hotel.address}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Couche 5 : Marqueurs des Parcs Nationaux & Réserves */}
          {showParks &&
            filteredParks.map((park) => (
              <Marker
                key={park.id}
                position={[park.lat, park.lng]}
                icon={createCustomIcon("park", "🏞️", park.name)}
              >
                <Popup>
                  <div className="space-y-2 p-1 min-w-[230px]">
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-amber-100 text-amber-800"
                    >
                      {park.category === "landmark"
                        ? "Site Emblématique"
                        : "Parc National / Réserve"}
                    </Badge>
                    <h4 className="font-bold text-sm text-foreground">
                      {park.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {park.description}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* Légende rapide en bas de la carte */}
      <div className="p-3 bg-muted/40 border-t flex flex-wrap items-center justify-around gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
          <span>Étapes de l&apos;itinéraire</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
          <span>Hôtels &amp; Hébergements</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-600 inline-block"></span>
          <span>Parcs Nationaux &amp; Nature</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-sky-400/50 border border-sky-500 inline-block"></span>
          <span>24 Régions de Madagascar</span>
        </div>
      </div>
    </div>
  );
}
