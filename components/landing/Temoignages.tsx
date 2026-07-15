// components/landing/Temoignages.tsx
const avis = [
  {
    nom: "Sophie L.",
    texte: "Un voyage inoubliable grâce aux conseils avisés de l'équipe.",
    note: 5,
  },
  {
    nom: "Marc D.",
    texte: "Circuit parfaitement organisé. Je recommande vivement !",
    note: 5,
  },
];

export default function Temoignages() {
  return (
    <section className="py-16 px-4 bg-blue-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Ce qu'ils disent de nous
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {avis.map((a, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="text-yellow-400 text-xl">
                {"⭐".repeat(a.note)}
              </div>
              <p className="mt-2 text-gray-700">"{a.texte}"</p>
              <p className="mt-4 font-semibold">— {a.nom}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
