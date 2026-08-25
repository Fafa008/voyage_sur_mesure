"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { LocationPickerProps } from "./LocationPicker";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

// Dynamic import to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] rounded-xl border bg-muted/30 flex flex-col items-center justify-center space-y-3 p-6 text-center">
      <MapPin className="w-8 h-8 text-primary animate-bounce" />
      <div className="space-y-1">
        <p className="font-semibold text-sm">Chargement de la carte...</p>
        <p className="text-xs text-muted-foreground">
          Préparation du sélecteur de lieu
        </p>
      </div>
      <Skeleton className="w-32 h-3 rounded-full" />
    </div>
  ),
});

export function LocationPickerWrapper(props: LocationPickerProps) {
  return <LocationPicker {...props} />;
}
