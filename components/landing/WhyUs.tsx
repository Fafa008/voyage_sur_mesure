// components/landing/WhyUs.tsx
const reasons = [
  {
    title: "🌍 100% personnalisable",
    desc: "Chaque voyage est unique, créé selon vos envies.",
  },
  {
    title: "🤝 Conseillers experts",
    desc: "Des agents locaux qui connaissent chaque recoin de Madagascar.",
  },
  {
    title: "💳 Paiement sécurisé",
    desc: "Payez en ligne en toute confiance.",
  },
];

export default function WhyUs() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Pourquoi nous choisir ?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl mb-4">{item.title.split(" ")[0]}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}