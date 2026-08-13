"use client";

import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SearchButtonProps {
  loading?: boolean;
  onClick?: () => void;
  label?: string;
  className?: string;
}

export function SearchButton({
  loading = false,
  onClick,
  label = "Rechercher",
  className = "",
}: SearchButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`w-full py-6 font-semibold text-sm shadow-md hover:shadow-lg transition-all rounded-xl ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Recherche en cours...
        </>
      ) : (
        <>
          <Search className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}
