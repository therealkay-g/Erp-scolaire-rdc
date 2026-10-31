import { 
  School, 
  User, 
  Classe, 
  Matiere, 
  Eleve, 
  Evaluation, 
  NoteItem, 
  Presence, 
  TrancheFrais, 
  Paiement, 
  Sanction, 
  BulletinModel 
} from '../types';

// Écoles initiales vidées (les établissements sont créés via le module "Ajouter une école" par le Super Admin)
export const MOCK_SCHOOLS: School[] = [];

// Super Administrateur du système
export const MOCK_USERS: User[] = [
  {
    id: 'u_superadmin',
    schoolId: '',
    nom: 'Kay Nzogu',
    email: 'kay.nzogu@erp-rdc.cd',
    role: 'super_admin',
    roleLabel: 'Super Administrateur',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  }
];

export const MOCK_CLASSES: Classe[] = [];
export const MOCK_MATIERES: Matiere[] = [];
export const MOCK_ELEVES: Eleve[] = [];
export const MOCK_EVALUATIONS: Evaluation[] = [];
export const MOCK_NOTES: NoteItem[] = [];
export const MOCK_PRESENCES: Presence[] = [];
export const MOCK_TRANCHES: TrancheFrais[] = [];
export const MOCK_PAIEMENTS: Paiement[] = [];
export const MOCK_SANCTIONS: Sanction[] = [];
export const MOCK_BULLETIN_MODELS: BulletinModel[] = [];
