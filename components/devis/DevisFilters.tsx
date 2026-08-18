"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Loader2, Filter } from "lucide-react";
import { StatutDevis } from "@prisma/client";
import { statutDevisLabels } from "@/lib/statut-config";
import { Button } from "@/components/ui/button";

interface DevisFiltersProps {
  currentSearch?: string;
  currentStatut?: string;
  showStatusFilter?: boolean;
}

export function DevisFilters({
  currentSearch = "",
  currentStatut = "",
  showStatusFilter = true,
}: DevisFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const updateFilters = (
    newSearch?: string | null,
    newStatut?: string | null
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset page to 1 on filter change
    params.set("page", "1");

    const searchVal = newSearch !== undefined ? (newSearch ?? "") : searchTerm;
    const statutVal = newStatut !== undefined ? (newStatut ?? "") : currentStatut;

    if (searchVal && searchVal.trim() !== "") {
      params.set("search", searchVal.trim());
    } else {
      params.delete("search");
    }

    if (statutVal && statutVal !== "all") {
      params.set("statut", statutVal);
    } else {
      params.delete("statut");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    updateFilters("");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
      {/* Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher par client, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-9 h-10 w-full"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : isPending ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </form>

      {/* Status Select Filter */}
      {showStatusFilter && (
        <div className="w-full sm:w-56 shrink-0">
          <Select
            items={[
              { label: "Tous les statuts", value: "all" },
              ...Object.entries(statutDevisLabels).map(([key, label]) => ({
                label,
                value: key,
              })),
            ]}
            value={currentStatut || "all"}
            onValueChange={(val) => updateFilters(undefined, val)}
          >
            <SelectTrigger className="h-10">
              <div className="flex items-center gap-2 text-sm truncate">
                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Tous les statuts" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(statutDevisLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
