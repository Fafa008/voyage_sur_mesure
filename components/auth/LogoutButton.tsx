// components/auth/LogoutButton.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({
  asChild = false,
  className,
  children,
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  if (asChild) {
    return (
      <span onClick={handleLogout} className={className}>
        {children}
      </span>
    );
  }

  return (
    <Button variant="outline" onClick={handleLogout} className={className}>
      Se déconnecter
    </Button>
  );
}
