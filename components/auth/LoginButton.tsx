// components/auth/LoginButton.tsx
"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function LoginButton() {
  return (
    <Link
      href="/login"
      className={buttonVariants({
        variant: "default",
        size: "sm",
        className: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm",
      })}
    >
      Se connecter
    </Link>
  );
}
