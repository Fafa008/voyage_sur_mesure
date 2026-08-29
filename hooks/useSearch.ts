"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  searchCircuitsAction,
  getSearchOptionsAction,
} from "@/actions/search/search-circuits.action";
import type {
  SearchFilters,
  SearchResult,
  SearchOptionsData,
} from "@/types/search";

const DEFAULT_FILTERS: SearchFilters = {
  destination: "",
  themeId: null,
  regionId: null,
  duration: null,
  maxBudget: null,
  travelers: null,
  sortBy: "populaire",
  page: 1,
  limit: 12,
};

export function useSearch(initialFilters?: Partial<SearchFilters>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial values from URL query string if present
  const parseFiltersFromUrl = useCallback((): SearchFilters => {
    if (!searchParams) return { ...DEFAULT_FILTERS, ...initialFilters };

    const destination = searchParams.get("destination") || "";
    const themeId = searchParams.get("themeId")
      ? Number(searchParams.get("themeId"))
      : null;
    const regionId = searchParams.get("regionId")
      ? Number(searchParams.get("regionId"))
      : null;
    const duration = searchParams.get("duration") || null;
    const maxBudget = searchParams.get("maxBudget")
      ? Number(searchParams.get("maxBudget"))
      : null;
    const travelers = searchParams.get("travelers")
      ? Number(searchParams.get("travelers"))
      : null;
    const sortBy = (searchParams.get("sortBy") as SearchFilters["sortBy"]) || "populaire";
    const page = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1;

    return {
      destination,
      themeId,
      regionId,
      duration,
      maxBudget,
      travelers,
      sortBy,
      page,
      limit: 12,
      ...initialFilters,
    };
  }, [searchParams, initialFilters]);

  const [filters, setFiltersState] = useState<SearchFilters>(parseFiltersFromUrl);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<SearchOptionsData>({
    destinations: [],
    themes: [],
    regions: [],
  });

  // Helper to update filters
  const setFilters = useCallback(
    (
      newFilters:
        | Partial<SearchFilters>
        | ((prev: SearchFilters) => Partial<SearchFilters>)
    ) => {
      setFiltersState((prev) => {
        const updated =
          typeof newFilters === "function"
            ? newFilters(prev)
            : { ...prev, ...newFilters };
        return updated;
      });
    },
    []
  );

  // Sync state with URL params
  const syncUrlParams = useCallback(
    (currentFilters: SearchFilters) => {
      const params = new URLSearchParams();

      if (currentFilters.destination)
        params.set("destination", currentFilters.destination);
      if (currentFilters.themeId)
        params.set("themeId", String(currentFilters.themeId));
      if (currentFilters.regionId)
        params.set("regionId", String(currentFilters.regionId));
      if (currentFilters.duration)
        params.set("duration", currentFilters.duration);
      if (currentFilters.maxBudget)
        params.set("maxBudget", String(currentFilters.maxBudget));
      if (currentFilters.travelers)
        params.set("travelers", String(currentFilters.travelers));
      if (currentFilters.sortBy && currentFilters.sortBy !== "populaire")
        params.set("sortBy", currentFilters.sortBy);
      if (currentFilters.page && currentFilters.page > 1)
        params.set("page", String(currentFilters.page));

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router]
  );

  // Perform search action
  const search = useCallback(
    async (overrideFilters?: SearchFilters) => {
      const activeFilters = overrideFilters || filters;
      setLoading(true);
      setError(null);

      try {
        const res = await searchCircuitsAction(activeFilters);
        if (res.success && res.data) {
          setResults(res.data);
        } else {
          setError(res.error || "Erreur lors de la recherche");
        }
      } catch {
        setError("Erreur de connexion au serveur.");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Reset filters
  const reset = useCallback(() => {
    const resetFilters = { ...DEFAULT_FILTERS, ...initialFilters };
    setFiltersState(resetFilters);
    syncUrlParams(resetFilters);
    search(resetFilters);
  }, [initialFilters, syncUrlParams, search]);

  // Load search options (themes, regions) once on mount
  useEffect(() => {
    let mounted = true;
    getSearchOptionsAction().then((res) => {
      if (mounted && res.success && res.data) {
        setOptions(res.data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Debounce ref for text inputs if needed
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback(
    (newFilters: SearchFilters) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        syncUrlParams(newFilters);
        search(newFilters);
      }, 350);
    },
    [search, syncUrlParams]
  );

  return {
    filters,
    setFilters,
    loading,
    results,
    error,
    options,
    search,
    debouncedSearch,
    reset,
    syncUrlParams,
  };
}
