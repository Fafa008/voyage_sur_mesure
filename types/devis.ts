// types/devis.ts

export interface DevisFormData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  circuitId?: string;
  typeVoyage: string[];
  themeIds: string[];
  regionIds: string[];
  dateDebut: string;
  dateFin: string;
  dureeFlexible: boolean;
  adultes: number;
  enfants: number;
  ados: number;
  enfantsAge: string;
  typeHebergement: string;
  regime: string;
  regimePrecision: string;
  activites: string[];
  transport: string[];
  budgetMin: number;
  budgetMax: number;
  commentaire: string;
  source: string;
  newsletter: boolean;
}

export interface DevisOption {
  id: number;
  titre?: string;
  nom?: string;
}

/** Données enrichies d'un circuit pré-sélectionné pour pré-remplir le formulaire */
export interface CircuitPreview {
  id: number;
  titre: string;
  regionId: number | null;
  region: { id: number; nom: string } | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  lieuDepartNom: string | null;
  lieuArriveeNom: string | null;
}
