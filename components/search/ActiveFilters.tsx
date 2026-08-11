"use client";

import { X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { SearchFilters, SearchOptionsData } from "@/types/search";

interface ActiveFiltersProps {
  filters: SearchFilters;
  options: SearchOptionsData;
  onRemoveFilter: (key: keyof SearchFilters) => void;
  onReset: () => void;
  className?: string;
}

export function ActiveFilters({
  filters,
  options,
  onRemoveFilter,
  onReset,
  className = "",
}: ActiveFiltersProps) {
  const activeBadges: { key: keyof SearchFilters; label: string }[] = [];

  if (filters.destination) {
    activeBadges.push({
      key: "destination",
      label: `Destination: ${filters.destination}`,
    });
  }

  if (filters.themeId) {
    const theme = options.themes.find((t) => Number(t.id) === filters.themeId);
    activeBadges.push({
      key: "themeId",
      label: `Thème: ${theme ? theme.nom : filters.themeId}`,
    });
  }

  if (filters.regionId) {
    const region = options.regions.find((r) => Number(r.id) === filters.regionId);
    activeBadges.push({
      key: "regionId",
      label: `Région: ${region ? region.nom : filters.regionId}`,
    });
  }

  if (filters.duration) {
    activeBadges.push({
      key: "duration",
      label: `Durée: ${filters.duration} jours`,
    });
  }

  if (filters.maxBudget) {
    activeBadges.push({
      key: "maxBudget",
      label: `Budget Max: ${formatCurrency(filters.maxBudget)}`,
    });
  }

  if (filters.travelers) {
    activeBadges.push({
      key: "travelers",
      label: `Voyageurs: ${filters.travelers}+`,
    });
  }

  if (activeBadges.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-3 border-t border-border/40 ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground mr-1">
        Filtres actifs :
      </span>

      {activeBadges.map((badge) => (
        <Badge
          key={badge.key}
          variant="secondary"
          className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
        >
          {badge.label}
          <button
            type="button"
            onClick={() => onRemoveFilter(badge.key)}
            className="hover:text-foreground rounded-full p-0.5"
            title="Supprimer ce filtre"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
      >
        <RotateCcw className="w-3 h-3 mr-1" />
        Réinitialiser
      </Button>
    </div>
  );
}
