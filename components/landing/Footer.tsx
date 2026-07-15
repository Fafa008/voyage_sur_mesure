// components/landing/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="font-bold text-lg mb-2">🌍 MonVoyage</h4>
          <p>Voyages sur mesure à Madagascar.</p>
        </div>
        <div>
          <h5 className="font-bold mb-2">Liens</h5>
          <ul className="space-y-1">
            <li>
              <Link href="/circuits" className="hover:underline">
                Circuits
              </Link>
            </li>
            <li>
              <Link href="/devis/nouveau" className="hover:underline">
                Devis
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:underline">
                Connexion
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold mb-2">Contact</h5>
          <p>contact@monvoyage.com</p>
          <p>+261 34 00 000 00</p>
        </div>
      </div>
    </footer>
  );
}
