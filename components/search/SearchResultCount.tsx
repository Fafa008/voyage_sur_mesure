"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface SearchResultCountProps {
  total?: number | null;
  loading?: boolean;
  className?: string;
}

export function SearchResultCount({
  total,
  loading = false,
  className = "",
}: SearchResultCountProps) {
  if (loading) {
    return <Skeleton className="h-5 w-36 rounded-md" />;
  }

  if (total === undefined || total === null) {
    return null;
  }

  return (
    <div className={`text-sm font-semibold text-foreground ${className}`}>
      {total === 0 ? (
        <span className="text-muted-foreground">Aucun circuit trouvé</span>
      ) : (
        <span>
          <span className="text-primary font-bold">{total}</span> circuit
          {total > 1 ? "s" : ""} disponible{total > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
