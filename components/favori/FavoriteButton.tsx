"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toggleFavori } from "@/app/actions/favori/toggle-favori.action";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  circuitId: number;
  initialIsFavori: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({
  circuitId,
  initialIsFavori,
  className,
  size = "md",
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavori, setIsFavori] = useState(initialIsFavori);
  const [pending, startTransition] = useTransition();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      const result = await toggleFavori(circuitId);

      if (result.requiresAuth) {
        router.push("/login");
        return;
      }

      if (result.success && result.isFavori !== undefined) {
        setIsFavori(result.isFavori);
        router.refresh();
      }
    });
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const buttonSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={isFavori}
      className={cn(
        "rounded-full flex items-center justify-center transition-all shadow-sm disabled:opacity-70",
        buttonSize,
        isFavori
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white/80 backdrop-blur-sm text-muted-foreground hover:text-red-500 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70",
        className
      )}
    >
      {pending ? (
        <Loader2 className={cn(iconSize, "animate-spin")} />
      ) : (
        <Heart className={cn(iconSize, isFavori && "fill-current")} />
      )}
    </button>
  );
}
