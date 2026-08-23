"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await authClient.signOut();
      router.replace("/home");
      router.refresh();
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="
        flex items-center gap-1.5
        rounded-md
        px-2.5 py-1.5
        text-xs font-medium
        text-muted-foreground
        transition-colors duration-200
        hover:text-destructive
        disabled:pointer-events-none
        disabled:opacity-50
      "
    >
      {isLoading ? (
        <Loader2
          className="h-3.5 w-3.5 animate-spin"
        />
      ) : (
        <LogOut
          className="h-3.5 w-3.5"
          strokeWidth={1.8}
        />
      )}

      <span>
        {isLoading ? "Déconnexion..." : "Déconnexion"}
      </span>
    </button>
  );
}

