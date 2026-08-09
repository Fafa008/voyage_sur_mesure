export interface RegionData {
  id: string;
  name: string;
  capital: string;
  center: [number, number]; // [lat, lng]
  bounds?: [[number, number], [number, number]]; // [[south, west], [north, east]]
  color: string;
  description: string;
  attractions: string[];
}

export const MADAGASCAR_REGIONS: RegionData[] = [
  {
    id: "diana",
    name: "Diana",
    capital: "Antsiranana (Diego-Suarez)",
    center: [-12.27, 49.29],
    color: "#0284c7", // Sky blue
    description: "Région tout au nord, réputée pour la mer d'Émeraude, les Tsingy Rouges et la Montagne d'Ambre.",
    attractions: ["Montagne d'Ambre", "Tsingy Rouges", "Mer d'Émeraude", "Nosy Be", "Ankarana"],
  },
  {
    id: "sava",
    name: "Sava",
    capital: "Sambava",
    center: [-14.26, 49.88],
    color: "#059669", // Emerald
    description: "La capitale mondiale de la vanille et terre du Parc National de Masoala.",
    attractions: ["Parc National de Masoala", "Plantations de Vanille", "Marojejy", "Antalaha"],
  },
  {
    id: "itasy",
    name: "Itasy",
    capital: "Miarinarivo",
    center: [-19.0, 46.8],
    color: "#d97706", // Amber
    description: "Région volcanique célèbre pour le Lac Itasy et les Chutes de la Lily.",
    attractions: ["Lac Itasy", "Chutes de la Lily", "Geysers d'Ampefy", "Ilot de la Vierge"],
  },
  {
    id: "analamanga",
    name: "Analamanga",
    capital: "Antananarivo",
    center: [-18.87, 47.52],
    color: "#dc2626", // Red
    description: "Le cœur historique et politique de Madagascar autour de la capitale des Mille.",
    attractions: ["Rova de Manjakamiadana", "Palais d'Ambohimanga", "Parc Tsarasaotra", "Marché Digue"],
  },
  {
    id: "vakinankaratra",
    name: "Vakinankaratra",
    capital: "Antsirabe",
    center: [-19.86, 47.03],
    color: "#7c3aed", // Violet
    description: "Les hautes terres des lacs volcaniques (Tritriva, Andraikiba) et de l'artisanat.",
    attractions: ["Lac Tritriva", "Lac Andraikiba", "Thermes d'Antsirabe", "Artisanat de Corne & Pousse-pousse"],
  },
  {
    id: "bongolava",
    name: "Bongolava",
    capital: "Tsiroanomandidy",
    center: [-18.77, 46.05],
    color: "#b45309", // Amber dark
    description: "Vastes plaines pastorales et grands marchés aux zébus du Moyen-Ouest.",
    attractions: ["Marché aux zébus de Tsiroanomandidy", "Rivière Mahajilo"],
  },
  {
    id: "sofia",
    name: "Sofia",
    capital: "Antsohihy",
    center: [-14.88, 48.0],
    color: "#0891b2", // Cyan
    description: "Terre de transition entre le nord et l'ouest, traversée par la grande rivière Sofia.",
    attractions: ["Antsohihy", "Port-Bergé", "Réserves naturelles de Bora"],
  },
  {
    id: "boeny",
    name: "Boeny",
    capital: "Mahajanga (Majunga)",
    center: [-15.72, 46.32],
    color: "#ea580c", // Orange
    description: "Cité des fleurs et porte de la Réserve d'Ankarafantsika et du Baobab géant.",
    attractions: ["Parc National d'Ankarafantsika", "Le Grand Baobab de Mahajanga", "Plage de Amborovy", "Cirque Rouge"],
  },
  {
    id: "betsiboka",
    name: "Betsiboka",
    capital: "Maevatanana",
    center: [-16.95, 46.83],
    color: "#ca8a04", // Yellow
    description: "Région aurifère bordant le fleuve rouge Betsiboka.",
    attractions: ["Fleuve Betsiboka", "Cascades de Mahafanina"],
  },
  {
    id: "melaky",
    name: "Melaky",
    capital: "Maintirano",
    center: [-18.06, 44.03],
    color: "#65a30d", // Lime
    description: "Région sauvage abritant les Tsingy de Bemaraha (Secteur Nord) et Manambolo.",
    attractions: ["Tsingy de Bemaraha", "Gorges de la Manambolo", "Archipel des Barren"],
  },
  {
    id: "alaotra-mangoro",
    name: "Alaotra-Mangoro",
    capital: "Ambatondrazaka",
    center: [-17.83, 48.42],
    color: "#16a34a", // Green
    description: "Le grenier à riz de Madagascar entourant le lac Alaotra et la forêt d'Andasibe.",
    attractions: ["Lac Alaotra", "Parc National d'Andasibe-Mantadia", "Réserve d'Analamazaotra (Indri Indri)"],
  },
  {
    id: "atsinanana",
    name: "Atsinanana",
    capital: "Toamasina (Tamatave)",
    center: [-18.15, 49.4],
    color: "#2563eb", // Blue
    description: "Le grand port de la côte est, départ du Canal des Pangalanes.",
    attractions: ["Canal des Pangalanes", "Grand Port de Toamasina", "Parc Ivoloina", "Akanin'ny Nofy"],
  },
  {
    id: "analanjirofo",
    name: "Analanjirofo",
    capital: "Fénérive-Est",
    center: [-16.17, 49.77],
    color: "#0d9488", // Teal
    description: "La côte des épices (girofle) et l'île paradisiaque de Sainte-Marie.",
    attractions: ["Île Sainte-Marie", "Île aux Nattes", "Observation des baleines à bosse", "Fénérive-Est"],
  },
  {
    id: "amoron-i-mania",
    name: "Amoron'i Mania",
    capital: "Ambositra",
    center: [-20.53, 47.24],
    color: "#c026d3", // Fuchsia
    description: "Capitale du travail du bois Zafimaniry, inscrit au patrimoine immatériel de l'UNESCO.",
    attractions: ["Villages Zafimaniry", "Artisanat du bois d'Ambositra", "Chutes de Tatamaina"],
  },
  {
    id: "haute-matsiatra",
    name: "Haute Matsiatra",
    capital: "Fianarantsoa",
    center: [-21.45, 47.08],
    color: "#9333ea", // Purple
    description: "Capitale culturelle et viticole, porte d'accès à la forêt humide de Ranomafana.",
    attractions: ["Parc National de Ranomafana", "Vielle ville de Fianarantsoa", "Vignoble d'Isandra", "Train FCE"],
  },
  {
    id: "vatovavy",
    name: "Vatovavy",
    capital: "Mananjary",
    center: [-21.23, 48.34],
    color: "#4f46e5", // Indigo
    description: "Côte tropicale de l'Est, terre des plantations de café, vanille et épices.",
    attractions: ["Canal des Pangalanes (Mananjary)", "Emouchure du fleuve Mananjary"],
  },
  {
    id: "fitovinany",
    name: "Fitovinany",
    capital: "Manakara",
    center: [-22.14, 48.02],
    color: "#3b82f6", // Blue
    description: "Terminus mythique de la ligne ferroviaire FCE et plages sauvages du Sud-Est.",
    attractions: ["Trou de Manakara", "Canal des Pangalanes (Manakara)", "Plages de Manakara"],
  },
  {
    id: "ihorombe",
    name: "Ihorombe",
    capital: "Ihosy",
    center: [-22.4, 46.12],
    color: "#eab308", // Yellow dark
    description: "Le grand plateau du Sud et le spectaculaire massif du Parc National d'Isalo.",
    attractions: ["Parc National d'Isalo", "Canyon des Singes", "Fenêtre d'Isalo", "Plateau d'Ihorombe"],
  },
  {
    id: "atsimo-atsinanana",
    name: "Atsimo-Atsinanana",
    capital: "Farafangana",
    center: [-22.82, 47.83],
    color: "#15803d", // Green dark
    description: "Région verdoyante du Sud-Est avec les réserves de Midongy du Sud et Manombo.",
    attractions: ["Réserve de Manombo", "Parc National de Midongy du Sud"],
  },
  {
    id: "atsimo-andrefana",
    name: "Atsimo-Andrefana",
    capital: "Toliara (Tuléar)",
    center: [-23.35, 43.67],
    color: "#f97316", // Orange light
    description: "Le grand Sud-Ouest aride, le lagon d me Ifaty/Anakao et la forêt d'épineux.",
    attractions: ["Ifaty / Mangily", "Anakao & Île Nosy Ve", "Parc National de Zombitse-Vohibasia", "Arboretum d'Antsokay"],
  },
  {
    id: "androy",
    name: "Androy",
    capital: "Ambovombe",
    center: [-25.17, 46.08],
    color: "#dc2626", // Rose/Red
    description: "L'extrême Sud malgache, berceau du peuple Antandroy et des plantes succulentes.",
    attractions: ["Cap Sainte-Marie (Pointe Sud de Mada)", "Réserve de Cap Sainte-Marie"],
  },
  {
    id: "anosy",
    name: "Anosy",
    capital: "Tôlanaro (Fort-Dauphin)",
    center: [-25.03, 46.99],
    color: "#06b6d4", // Cyan bright
    description: "Rencontre magique de la forêt humide et du bush épineux autour de Fort-Dauphin.",
    attractions: ["Réserve de Nahampoana", "Baie de Saint-Luce", "Parc National d'Andohahela", "Pic Louis"],
  },
  {
    id: "menabe",
    name: "Menabe",
    capital: "Morondava",
    center: [-20.29, 44.28],
    color: "#dd6b20", // Terracotta
    description: "Terre emblématique de l'Allée des Baobabs et de la Réserve des Tsingy de Bemaraha.",
    attractions: ["Allée des Baobabs", "Baobab Amoureux", "Tsingy de Bemaraha", "Forêt de Kirindy"],
  },
  {
    id: "ambatosoa",
    name: "Ambatosoa",
    capital: "Maroantsetra",
    center: [-15.43, 49.74],
    color: "#10b981", // Emerald light
    description: "Nouvelle région de la baie de Antongil, porte de Nosy Mangabe et Masoala.",
    attractions: ["Île Nosy Mangabe", "Baie d'Antongil", "Maroantsetra"],
  }
];

/**
 * Génère un GeoJSON léger pour l'affichage interactif des 24 régions de Madagascar.
 */
export function getMadagascarGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: MADAGASCAR_REGIONS.map((reg) => {
      // Générer une boîte bounding polygon autour du centre de chaque région
      const [lat, lng] = reg.center;
      const dLat = 0.65;
      const dLng = 0.65;

      return {
        type: "Feature",
        id: reg.id,
        properties: {
          id: reg.id,
          name: reg.name,
          capital: reg.capital,
          color: reg.color,
          description: reg.description,
          attractions: reg.attractions,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [lng - dLng, lat - dLat],
              [lng + dLng, lat - dLat],
              [lng + dLng, lat + dLat],
              [lng - dLng, lat + dLat],
              [lng - dLng, lat - dLat],
            ],
          ],
        },
      };
    }),
  };
}
