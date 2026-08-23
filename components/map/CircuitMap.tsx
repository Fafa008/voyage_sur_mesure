"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { CircuitMapProps } from "./CircuitMapInner";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import "./leaflet-styles.css";

// Chargement dynamique dynamique pour contourner le rendu SSR de Leaflet
const CircuitMapInner = dynamic(() => import("./CircuitMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-2xl border bg-muted/30 flex flex-col items-center justify-center space-y-4 shadow-sm p-6 text-center">
      <div className="relative">
        <MapPin className="w-12 h-12 text-primary animate-bounce" />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-primary/20 rounded-full blur-sm"></div>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold text-lg">Chargement de la Carte Interactive...</h4>
        <p className="text-sm text-muted-foreground max-w-sm">
          Préparation du tracé du circuit et du découpage des 24 régions de Madagascar.
        </p>
      </div>
      <Skeleton className="w-48 h-4 rounded-full" />
    </div>
  ),
});

export function CircuitMap(props: CircuitMapProps) {
  return <CircuitMapInner {...props} />;
}
