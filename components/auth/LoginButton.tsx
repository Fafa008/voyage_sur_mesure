// components/auth/LoginButton.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
  return (
    <Button
      variant="outline"
      className="
        flex items-center gap-1.5
        rounded-md
        px-2 py-3
        text-xs font-medium
        text-muted-foreground
        transition-colors duration-200
        hover:bg-blue-50
        hover:text-blue-600
        dark:hover:bg-blue-950/30
        disabled:pointer-events-none
        disabled:opacity-50
      "
    >
      <Link href="/login">
        Se connecter
      </Link>
    </Button>
  );
}

