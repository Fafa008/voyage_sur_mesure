"use client";

import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  return (
    <button
      className="rounded-md bg-red-600 px-4 py-2 text-white"
      onClick={async () => {
        await authClient.signOut();
        window.location.reload();
      }}
    >
      Déconnexion
    </button>
  );
}
