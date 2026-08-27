"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { CircuitRouteMapPickerProps } from "./CircuitRouteMapPicker";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Navigation } from "lucide-react";

// Dynamic import to avoid SSR issues with Leaflet
const CircuitRouteMapPicker = dynamic(
  () => import("./CircuitRouteMapPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] rounded-xl border bg-muted/20 flex flex-col items-center justify-center space-y-3 p-6 text-center">
        <div className="flex items-center gap-2">
          <MapPin className="w-7 h-7 text-emerald-500 animate-bounce" />
          <Navigation className="w-6 h-6 text-primary animate-pulse" />
          <MapPin className="w-7 h-7 text-rose-500 animate-bounce" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-sm">Chargement de la carte interactive...</p>
          <p className="text-xs text-muted-foreground">
            Préparation du sélecteur d&apos;itinéraire (Départ / Arrivée)
          </p>
        </div>
        <Skeleton className="w-48 h-3 rounded-full mt-2" />
      </div>
    ),
  }
);

export function CircuitRouteMapPickerWrapper(
  props: CircuitRouteMapPickerProps
) {
  return <CircuitRouteMapPicker {...props} />;
}
