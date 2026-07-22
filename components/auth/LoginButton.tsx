// components/auth/LoginButton.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
  return (
    <Button
      variant="default"
      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      <Link href="/login">Se connecter</Link>
    </Button>
  );
}
