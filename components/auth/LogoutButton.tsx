"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    console.log("1");
    await authClient.signOut();
    console.log("2");
    router.replace("/home");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg border px-4 py-2"
    >
      <LogOut size={18} />
      Déconnexion
    </button>
  );
}
