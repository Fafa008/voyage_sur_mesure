import Link from "next/link";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("HEADER SESSION :", session);

  return (
    <header className="flex items-center justify-between border-b p-5">
      <Link href="/" className="text-2xl font-bold">
        Mon Voyage
      </Link>

      <nav className="flex items-center gap-4">
        <Link href="/">Accueil</Link>

        <Link href="/circuits" className="text-sm hover:underline">
          Circuits
        </Link>

        <Link href="/contact" className="text-sm hover:underline">
          Contact
        </Link>
        <Link href="/devis/nouveau" className="text-sm hover:underline">
          Demander un devis
        </Link>
        <Link href="/devis/historique" className="text-sm hover:underline">
          Mes devis
        </Link>

        {session ? (
          <>
            <span>{session.user.name}</span>

            <LogoutButton />
          </>
        ) : (
          <LoginButton />
        )}
      </nav>
    </header>
  );
}
