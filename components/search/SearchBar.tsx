"use client";

import { Suspense } from "react";
import { useSearch } from "@/hooks/useSearch";
import { DestinationSelect } from "./DestinationSelect";
import { ThemeSelect } from "./ThemeSelect";
import { RegionSelect } from "./RegionSelect";
import { DurationSelect } from "./DurationSelect";
import { BudgetSelect } from "./BudgetSelect";
import { TravelersSelect } from "./TravelersSelect";
import { SearchButton } from "./SearchButton";
import { ActiveFilters } from "./ActiveFilters";
import { SearchResultCount } from "./SearchResultCount";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchFilters, SearchResult } from "@/types/search";

interface SearchBarProps {
  variant?: "hero" | "full" | "sidebar";
  onResultsFound?: (results: SearchResult) => void;
  className?: string;
  autoSearchOnSelect?: boolean;
}

function SearchBarContent({
  variant = "hero",
  onResultsFound,
  className = "",
  autoSearchOnSelect = false,
}: SearchBarProps) {
  const {
    filters,
    setFilters,
    loading,
    results,
    options,
    search,
    reset,
  } = useSearch();

  const handleSearch = async () => {
    await search(filters);
    if (results && onResultsFound) {
      onResultsFound(results);
    }
  };

  const handleSelectChange = (
    field: keyof SearchFilters,
    val: string | number | null
  ) => {
    const next = { ...filters, [field]: val, page: 1 };
    setFilters(next);
    if (autoSearchOnSelect) {
      search(next);
    }
  };

  const handleRemoveFilter = (field: keyof SearchFilters) => {
    const next = { ...filters, [field]: field === "destination" ? "" : null, page: 1 };
    setFilters(next);
    search(next);
  };

  if (variant === "sidebar") {
    return (
      <div className={`bg-card border border-border/60 rounded-xl p-5 space-y-4 shadow-xs ${className}`}>
        <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/40">
          Filtrer les circuits
        </h3>

        <DestinationSelect
          value={filters.destination}
          onChange={(val) => handleSelectChange("destination", val)}
          options={options.destinations}
        />

        <ThemeSelect
          value={filters.themeId}
          onChange={(val) => handleSelectChange("themeId", val)}
          options={options.themes}
        />

        <RegionSelect
          value={filters.regionId}
          onChange={(val) => handleSelectChange("regionId", val)}
          options={options.regions}
        />

        <DurationSelect
          value={filters.duration}
          onChange={(val) => handleSelectChange("duration", val)}
        />

        <BudgetSelect
          value={filters.maxBudget}
          onChange={(val) => handleSelectChange("maxBudget", val)}
        />

        <TravelersSelect
          value={filters.travelers}
          onChange={(val) => handleSelectChange("travelers", val)}
        />

        <SearchButton loading={loading} onClick={handleSearch} />

        <ActiveFilters
          filters={filters}
          options={options}
          onRemoveFilter={handleRemoveFilter}
          onReset={reset}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-card border border-border/60 rounded-xl shadow-md p-4 sm:p-6 transition-all ${className}`}
    >
      {/* Top Header if variant is 'full' */}
      {variant === "full" && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40">
          <SearchResultCount total={results?.total} loading={loading} />
        </div>
      )}

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-end">
        <DestinationSelect
          value={filters.destination}
          onChange={(val) => handleSelectChange("destination", val)}
          options={options.destinations}
        />

        <ThemeSelect
          value={filters.themeId}
          onChange={(val) => handleSelectChange("themeId", val)}
          options={options.themes}
        />

        <RegionSelect
          value={filters.regionId}
          onChange={(val) => handleSelectChange("regionId", val)}
          options={options.regions}
        />

        <DurationSelect
          value={filters.duration}
          onChange={(val) => handleSelectChange("duration", val)}
        />

        <BudgetSelect
          value={filters.maxBudget}
          onChange={(val) => handleSelectChange("maxBudget", val)}
        />

        <TravelersSelect
          value={filters.travelers}
          onChange={(val) => handleSelectChange("travelers", val)}
        />
      </div>

      {/* Action Row */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <ActiveFilters
          filters={filters}
          options={options}
          onRemoveFilter={handleRemoveFilter}
          onReset={reset}
          className="flex-1 border-t-0 pt-0"
        />

        <div className="w-full sm:w-48 shrink-0">
          <SearchButton loading={loading} onClick={handleSearch} />
        </div>
      </div>
    </div>
  );
}

function SearchBarFallback({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-card border border-border/60 rounded-xl shadow-md p-4 sm:p-6 space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={<SearchBarFallback className={props.className} />}>
      <SearchBarContent {...props} />
    </Suspense>
  );
}
