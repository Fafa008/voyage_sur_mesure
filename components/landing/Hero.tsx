// components/landing/Hero.tsx
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-linear-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Voyages sur mesure à Madagascar
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          Co-construisez votre séjour avec nos conseillers passionnés.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/circuits"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Découvrir les circuits
          </Link>
          <Link
            href="/devis/nouveau"
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
          >
            Demander un devis
          </Link>
        </div>
      </div>
    </section>
  );
}
