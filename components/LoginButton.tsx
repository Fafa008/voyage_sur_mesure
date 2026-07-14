"use client";

import Link from "next/link";

export default function LoginButton() {
  return (
    <Link
      href="/login"
      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Se connecter
    </Link>
  );
}
