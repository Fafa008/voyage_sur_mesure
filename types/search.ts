export interface SearchFilters {
  destination?: string;
  themeId?: number | null;
  regionId?: number | null;
  duration?: string | null; // e.g. "3-5", "5-8", "8-15", "15+"
  maxBudget?: number | null; // e.g. 500, 1000, 1500, 2000, 3000
  travelers?: number | null; // e.g. 1, 2, 3, 4, 5
  sortBy?: "prix_asc" | "prix_desc" | "duree_asc" | "duree_desc" | "populaire";
  page?: number;
  limit?: number;
}

export interface CircuitSearchResultItem {
  id: number;
  titre: string;
  slug: string;
  description: string | null;
  dureeJours: number | null;
  prixEstime: string | number | null;
  nbPlacesDisponibles: number;
  estGroupe: boolean;
  region: { id: number; nom: string } | null;
  theme: { id: number; nom: string } | null;
  images: { id: number; url: string; legende: string | null }[];
}

export interface SearchResult {
  circuits: CircuitSearchResultItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface SearchFilterOption {
  id: number | string;
  nom: string;
}

export interface SearchOptionsData {
  destinations: string[];
  themes: SearchFilterOption[];
  regions: SearchFilterOption[];
}

export interface SearchState {
  filters: SearchFilters;
  results: SearchResult | null;
  loading: boolean;
  error: string | null;
  options: SearchOptionsData;
}
