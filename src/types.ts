export type UserRole = 
  | 'super_admin'
  | 'prefet' 
  | 'directeur_etudes' 
  | 'directeur_discipline' 
  | 'surveillant' 
  | 'enseignant' 
  | 'comptable' 
  | 'secretaire';

export interface School {
  id: string;
  code: string;
  nom: string;
  devise: string;
  ville: string;
  province: string;
  adresse: string;
  telephone: string;
  email: string;
  logoUrl: string;
  anneeAcademique: string;
  tauxUsdCdf: number; // 1 USD = 2500 FC
  typeEnseignement: 'Conventionné Catholique' | 'Conventionné Protestant' | 'Privé Agréé';
}

export interface User {
  id: string;
  schoolId: string;
  nom: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatarUrl: string;
  matieresAssigned?: string[]; // IDs des cours pour les enseignants
  classesAssigned?: string[];  // IDs des classes pour les enseignants
}

export interface Classe {
  id: string;
  schoolId: string;
  nom: string;
  niveau: 'primaire' | 'secondaire';
  section: string;
  option: string;
  effectif: number;
  titulaireNom: string;
}

export interface Matiere {
  id: string;
  classeId: string;
  nom: string;
  code: string;
  maxima: number; // e.g. 20, 40, 50
  enseignantNom: string;
}

export type Periode = 'P1' | 'P2' | 'EXAM_S1' | 'P3' | 'P4' | 'EXAM_S2';

export interface Evaluation {
  id: string;
  schoolId?: string;
  matiereId: string;
  classeId: string;
  titre: string;
  periode: Periode;
  maxPoints: number;
  coefficient: number;
  date: string;
}

export interface NoteItem {
  id: string;
  evaluationId: string;
  eleveId: string;
  valeur: number | null; // null si non encore saisie
  synced: boolean;
  dateModif: string;
}

export interface Eleve {
  id: string;
  schoolId: string;
  matricule: string;
  nom: string;
  postnom: string;
  prenom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  lieuNaissance: string;
  classeId: string;
  nomTuteur: string;
  telTuteur: string;
  adresse: string;
  photoUrl: string;
  acteNaissanceUrl?: string;
  statut: 'actif' | 'radie' | 'transfere';
  dateInscription: string;
}

export interface Presence {
  id: string;
  schoolId: string;
  classeId: string;
  eleveId: string;
  date: string;
  type: 'seance' | 'demi_journee';
  demiJournee?: 'matin' | 'apres_midi';
  matiereId?: string;
  statut: 'present' | 'absent' | 'justifie' | 'retard';
  saisiPar: string;
  synced: boolean;
}

export interface TrancheFrais {
  id: string;
  schoolId: string;
  nom: string;
  description: string;
  montantCDF: number;
  montantUSD: number;
  dateLimite: string;
  obligatoire: boolean;
}

export interface Paiement {
  id: string;
  schoolId: string;
  recuNumero: string;
  eleveId: string;
  trancheId: string;
  montantCDF: number;
  montantUSD: number;
  date: string;
  modePaiement: 'Espèces' | 'Airtel Money' | 'M-Pesa' | 'Orange Money' | 'Bancaire';
  comptableNom: string;
  observation?: string;
  synced: boolean;
}

export interface Sanction {
  id: string;
  schoolId: string;
  eleveId: string;
  type: 'Avertissement' | 'Blâme' | 'Retenue' | 'Exclusion temporaire' | 'Corvée scolaire';
  motif: string;
  date: string;
  decisionPar: string;
  dureeJours?: number;
}

export interface BulletinModel {
  id: string;
  schoolId: string;
  classeId: string;
  option: string;
  periode: Periode;
  fileName: string;
  fileType: 'excel' | 'word' | 'pdf';
  importedAt: string;
  valide: boolean;
  tailleFichier: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'note' | 'presence' | 'paiement' | 'eleve' | 'sanction';
  description: string;
  timestamp: string;
  payload: any;
  status: 'pending' | 'syncing' | 'synced';
}
