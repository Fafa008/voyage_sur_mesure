// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import LogoutButton from "@/components/ui/logout-button";
import { redirect } from "next/dist/client/components/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">
        👋 Bonjour, {session.user.name}
      </h1>
      <p className="text-gray-600 mb-6">Email : {session.user.email}</p>
      <div className="flex gap-4">
        <Link
          href="/devis/nouveau"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Demander un devis
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
