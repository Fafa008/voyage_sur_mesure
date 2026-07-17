// app/devis/merci/page.tsx
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function MerciPage() {
  return (
    <main className="max-w-2xl mx-auto p-8 text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Demande envoyée ! 🎉</h1>
      <p className="text-gray-600 mb-6">
        Votre demande de devis a bien été enregistrée. Un conseiller vous
        recontactera dans les plus brefs délais.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Voir mes devis
        </Link>
        <Link
          href="/"
          className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300 transition"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
