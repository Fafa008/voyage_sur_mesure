// components/auth/LoginButton.tsx
"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function LoginButton() {
  return (
    <Link
      href="/login"
      className={buttonVariants({
        variant: "outline",
        size: "sm",
        className: "text-muted-foreground hover:text-primary",
      })}
    >
      Se connecter
    </Link>
  );
}
