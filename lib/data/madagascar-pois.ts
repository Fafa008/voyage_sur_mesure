export interface PointOfInterest {
  id: string;
  name: string;
  category: "park" | "hotel" | "city" | "landmark";
  lat: number;
  lng: number;
  regionId: string;
  description: string;
  image?: string;
  rating?: number; // Pour les hôtels (étoiles)
  address?: string;
}

// 🏞️ Parcs Nationaux & Réserves de Madagascar
export const NATIONAL_PARKS: PointOfInterest[] = [
  {
    id: "park-tsingy-bemaraha",
    name: "Parc National des Tsingy de Bemaraha",
    category: "park",
    lat: -19.1412,
    lng: 44.7874,
    regionId: "menabe",
    description: "Patrimoine mondial de l'UNESCO. Formations calcaire spectaculaires en cathédrale de pierre, ponts de singe et faune endémique.",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "park-isalo",
    name: "Parc National d'Isalo",
    category: "park",
    lat: -22.5516,
    lng: 45.3968,
    regionId: "ihorombe",
    description: "Massif jurassique sculpté par l'érosion, canyons profonds, piscines naturelles et lémuriens catta.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "park-andasibe",
    name: "Parc National d'Andasibe-Mantadia",
    category: "park",
    lat: -18.9348,
    lng: 48.4172,
    regionId: "alaotra-mangoro",
    description: "Forêt tropicale humide sacrée du plus grand lémurien vivant : l'Indri Indri.",
    image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "park-ranomafana",
    name: "Parc National de Ranomafana",
    category: "park",
    lat: -21.2584,
    lng: 47.4521,
    regionId: "haute-matsiatra",
    description: "Forêt nébuleuse luxuriante réputée pour ses sources thermales et ses 12 espèces de lémuriens.",
  },
  {
    id: "park-ambre",
    name: "Parc National de la Montagne d'Ambre",
    category: "park",
    lat: -12.5281,
    lng: 49.1764,
    regionId: "diana",
    description: "Oasis de verdure tropicale, cascades sacrés, micro-caméléons et lacs de cratère.",
  },
  {
    id: "park-ankarana",
    name: "Réserve Spéciale d'Ankarana",
    category: "park",
    lat: -12.9234,
    lng: 49.1123,
    regionId: "diana",
    description: "Tsingy gris grisants, grottes sacrées de batraciennes et rivières souterraines.",
  },
  {
    id: "park-masoala",
    name: "Parc National de Masoala",
    category: "park",
    lat: -15.6667,
    lng: 49.9833,
    regionId: "sava",
    description: "Le plus grand parc national de Madagascar combinant forêt primaire et réserves marines.",
  },
  {
    id: "park-ankarafantsika",
    name: "Parc National d'Ankarafantsika",
    category: "park",
    lat: -16.3021,
    lng: 46.8123,
    regionId: "boeny",
    description: "Royaume des oiseaux, baobabs et du lac Ravelobe habité par des crocodiles sacrés.",
  },
  {
    id: "park-zombitse",
    name: "Parc National de Zombitse-Vohibasia",
    category: "park",
    lat: -22.8872,
    lng: 44.7012,
    regionId: "atsimo-andrefana",
    description: "Zone de transition entre la forêt sèche du sud et la forêt humide de l'est.",
  },
  {
    id: "park-kirindy",
    name: "Réserve de Kirindy Forest",
    category: "park",
    lat: -20.0684,
    lng: 44.6001,
    regionId: "menabe",
    description: "Meilleur endroit pour observer le Fossa (prédateur suprême de Mada) et les lémuriens nocturnes.",
  },
  {
    id: "landmark-baobabs",
    name: "L'Allée des Baobabs",
    category: "landmark",
    lat: -20.2508,
    lng: 44.4184,
    regionId: "menabe",
    description: "Monument naturel majestueux bordé de Baobabs tricentenaire Adansonia grandidieri.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80",
  },
];

// 🏨 Hébergements & Hôtels d'exception à Madagascar
export const FEATURED_HOTELS: PointOfInterest[] = [
  {
    id: "hotel-soleil-tsingy",
    name: "Soleil des Tsingy Lodge",
    category: "hotel",
    lat: -19.1235,
    lng: 44.8123,
    regionId: "menabe",
    rating: 4,
    address: "Bekopaka, Tsingy de Bemaraha",
    description: "Lodge d'exception perché sur la colline surplombant le fleuve Manambolo.",
  },
  {
    id: "hotel-baobab-cafe",
    name: "Hôtel Le Baobab Café",
    category: "hotel",
    lat: -20.2981,
    lng: 44.2812,
    regionId: "menabe",
    rating: 3,
    address: "Boulevard de la Mer, Morondava",
    description: "Hôtel convivial en bord de mer offrant une vue imprenable sur le coucher de soleil.",
  },
  {
    id: "hotel-jardin-du-roy",
    name: "Le Jardin du Roy",
    category: "hotel",
    lat: -22.5482,
    lng: 45.3852,
    regionId: "ihorombe",
    rating: 4,
    address: "Ranohira, Isalo",
    description: "Magnifique lodge construit en pierre de grès intégrée dans le paysage de l'Isalo.",
  },
  {
    id: "hotel-relais-reine",
    name: "Le Relais de la Reine",
    category: "hotel",
    lat: -22.5612,
    lng: 45.3901,
    regionId: "ihorombe",
    rating: 4,
    address: "Ranohira, Isalo",
    description: "Ecrin de sérénité au cœur des formations rocheuses avec piscine naturelle et spa.",
  },
  {
    id: "hotel-vakona-forest",
    name: "Vakona Forest Lodge",
    category: "hotel",
    lat: -18.9412,
    lng: 48.4289,
    regionId: "alaotra-mangoro",
    rating: 3,
    address: "Andasibe",
    description: "Bungalows au milieu de la forêt primaire avec îlot privé aux lémuriens.",
  },
  {
    id: "hotel-princesse-bora",
    name: "Princesse Bora Lodge & Spa",
    category: "hotel",
    lat: -17.0289,
    lng: 49.8012,
    regionId: "analanjirofo",
    rating: 5,
    address: "Île Sainte-Marie",
    description: "Etablissement de luxe en bord de lagon avec centre d'observation des baleines.",
  },
  {
    id: "hotel-louvre-tana",
    name: "Hôtel & Spa Le Louvre",
    category: "hotel",
    lat: -18.9103,
    lng: 47.5256,
    regionId: "analamanga",
    rating: 4,
    address: "Antaninarenina, Antananarivo",
    description: "Hôtel historique au cœur du quartier des affaires et de la haute ville.",
  },
  {
    id: "hotel-couleur-cafe",
    name: "Couleur Café",
    category: "hotel",
    lat: -19.8654,
    lng: 47.0321,
    regionId: "vakinankaratra",
    rating: 3,
    address: "Antsirabe",
    description: "Charme et authenticité dans un jardin arboré avec briques rouges traditionnelles.",
  },
  {
    id: "hotel-setam-lodge",
    name: "Setam Lodge",
    category: "hotel",
    lat: -21.2489,
    lng: 47.4412,
    regionId: "haute-matsiatra",
    rating: 3,
    address: "Ranomafana",
    description: "Dominant la canopée et la rivière Namorona, à 2 minutes du Parc National.",
  },
  {
    id: "hotel-eden-lodge",
    name: "Eden Lodge Nosy Be",
    category: "hotel",
    lat: -13.4012,
    lng: 48.2512,
    regionId: "diana",
    rating: 5,
    address: "Baie des Russes, Nosy Be",
    description: "Premier écolodge 100% solaire certifié au monde, luxe pieds dans l'eau.",
  },
];

// 🏙️ Dictionnaire de coordonnées GPS pour les Villes & Étapes clés
export const CITY_COORDINATES: Record<string, { lat: number; lng: number; regionId: string }> = {
  "antananarivo": { lat: -18.8792, lng: 47.5079, regionId: "analamanga" },
  "tana": { lat: -18.8792, lng: 47.5079, regionId: "analamanga" },
  "antsirabe": { lat: -19.8659, lng: 47.0333, regionId: "vakinankaratra" },
  "ambositra": { lat: -20.5333, lng: 47.2417, regionId: "amoron-i-mania" },
  "fianarantsoa": { lat: -21.4527, lng: 47.0856, regionId: "haute-matsiatra" },
  "ranomafana": { lat: -21.2584, lng: 47.4521, regionId: "haute-matsiatra" },
  "ranohira": { lat: -22.5516, lng: 45.3968, regionId: "ihorombe" },
  "isalo": { lat: -22.5516, lng: 45.3968, regionId: "ihorombe" },
  "ihosy": { lat: -22.4000, lng: 46.1167, regionId: "ihorombe" },
  "toliara": { lat: -23.3516, lng: 43.6675, regionId: "atsimo-andrefana" },
  "tulear": { lat: -23.3516, lng: 43.6675, regionId: "atsimo-andrefana" },
  "ifaty": { lat: -23.1512, lng: 43.6189, regionId: "atsimo-andrefana" },
  "anakao": { lat: -23.6689, lng: 43.6489, regionId: "atsimo-andrefana" },
  "morondava": { lat: -20.2981, lng: 44.2812, regionId: "menabe" },
  "bekopaka": { lat: -19.1412, lng: 44.7874, regionId: "menabe" },
  "tsingy": { lat: -19.1412, lng: 44.7874, regionId: "menabe" },
  "miarinarivo": { lat: -19.0000, lng: 46.8000, regionId: "itasy" },
  "ampefy": { lat: -19.0345, lng: 46.7321, regionId: "itasy" },
  "andasibe": { lat: -18.9348, lng: 48.4172, regionId: "alaotra-mangoro" },
  "toamasina": { lat: -18.1492, lng: 49.4023, regionId: "atsinanana" },
  "tamatave": { lat: -18.1492, lng: 49.4023, regionId: "atsinanana" },
  "sainte-marie": { lat: -16.9044, lng: 49.9003, regionId: "analanjirofo" },
  "nosy be": { lat: -13.3167, lng: 48.2667, regionId: "diana" },
  "antsiranana": { lat: -12.2781, lng: 49.2917, regionId: "diana" },
  "diego suarez": { lat: -12.2781, lng: 49.2917, regionId: "diana" },
  "diego-suarez": { lat: -12.2781, lng: 49.2917, regionId: "diana" },
  "mahajanga": { lat: -15.7167, lng: 46.3167, regionId: "boeny" },
  "majunga": { lat: -15.7167, lng: 46.3167, regionId: "boeny" },
  "fort-dauphin": { lat: -25.0333, lng: 46.9833, regionId: "anosy" },
  "tolagnaro": { lat: -25.0333, lng: 46.9833, regionId: "anosy" },
};

/**
 * Recherche les coordonnées GPS approximatives d'une ville ou étape
 */
export function getCoordinatesForCity(cityName?: string | null): { lat: number; lng: number; regionId?: string } {
  if (!cityName) {
    return { lat: -18.8792, lng: 47.5079, regionId: "analamanga" }; // Défaut Antananarivo
  }

  const cleanName = cityName.trim().toLowerCase();

  // Recherche directe dans le dictionnaire
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return coords;
    }
  }

  // Coordonnées par défaut au centre de Madagascar si inconnue
  return { lat: -18.8792, lng: 47.5079, regionId: "analamanga" };
}
