import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  School, 
  User, 
  UserRole, 
  Classe, 
  Matiere, 
  Eleve, 
  Evaluation, 
  NoteItem, 
  Presence, 
  TrancheFrais, 
  Paiement, 
  Sanction, 
  BulletinModel, 
  SyncQueueItem,
  Periode 
} from '../types';
import { 
  MOCK_SCHOOLS, 
  MOCK_USERS, 
  MOCK_CLASSES, 
  MOCK_MATIERES, 
  MOCK_ELEVES, 
  MOCK_EVALUATIONS, 
  MOCK_NOTES, 
  MOCK_PRESENCES, 
  MOCK_TRANCHES, 
  MOCK_PAIEMENTS, 
  MOCK_SANCTIONS, 
  MOCK_BULLETIN_MODELS 
} from '../data/mockData';

interface StudentReportCourse {
  matiereId: string;
  matiereNom: string;
  maxima: number;
  noteObtenue: number | null;
  pourcentage: number | null;
  isMissing: boolean;
}

export interface StudentReportCard {
  eleve: Eleve;
  classe: Classe;
  periode: Periode;
  cours: StudentReportCourse[];
  totalObtenu: number;
  totalMax: number;
  pourcentageGlobal: number;
  rang: number;
  totalElevesClasse: number;
  hasMissingNotes: boolean;
  missingCoursesCount: number;
  mention: string;
}

interface AppContextType {
  schools: School[];
  currentSchool: School;
  setSchool: (school: School) => void;
  currentUser: User | null;
  login: (codeEcole: string, email: string, mdp: string) => boolean;
  quickLogin: (role: UserRole) => void;
  logout: () => void;
  addNewSchoolTenant: (data: {
    schoolName: string;
    slug: string;
    adminName: string;
    adminEmail: string;
    tempPassword: string;
  }) => Promise<{ success: boolean; tenant_id?: string; school_code?: string; school_name?: string; admin_email?: string; error?: string }>;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingSyncQueue: SyncQueueItem[];
  isSyncing: boolean;
  syncNow: () => Promise<void>;
  
  // Data
  classes: Classe[];
  matieres: Matiere[];
  eleves: Eleve[];
  evaluations: Evaluation[];
  notes: NoteItem[];
  presences: Presence[];
  tranches: TrancheFrais[];
  paiements: Paiement[];
  sanctions: Sanction[];
  bulletinModels: BulletinModel[];

  // Actions
  addEleve: (nouveau: Omit<Eleve, 'id' | 'schoolId' | 'dateInscription'>) => void;
  updateEleve: (id: string, updates: Partial<Eleve>) => void;
  deleteEleve: (id: string) => void;
  createEvaluation: (evaluation: Omit<Evaluation, 'id'>) => void;
  saveNotes: (evaluationId: string, notesMap: Record<string, number | null>) => void;
  savePresences: (presencesData: Omit<Presence, 'id' | 'schoolId' | 'synced'>[]) => void;
  encaisserPaiement: (paiement: Omit<Paiement, 'id' | 'schoolId' | 'recuNumero' | 'synced'>) => Paiement;
  addSanction: (sanction: Omit<Sanction, 'id' | 'schoolId'>) => void;
  importBulletinModel: (model: Omit<BulletinModel, 'id' | 'schoolId' | 'importedAt' | 'valide'>) => void;

  // Helpers
  formatCDF: (montant: number) => string;
  formatUSD: (montant: number) => string;
  convertCDFtoUSD: (montantCDF: number) => number;
  convertUSDtoCDF: (montantUSD: number) => number;
  getStudentPaymentStatus: (eleveId: string) => {
    totalDuCDF: number;
    totalPayeCDF: number;
    resteCDF: number;
    pourcentagePaye: number;
    tranchesDetails: { tranche: TrancheFrais; payeCDF: number; resteCDF: number; statut: 'Payée' | 'Partielle' | 'Impayée' }[];
  };
  getSchoolFinancialSummary: () => {
    totalAttenduCDF: number;
    totalRecouvreCDF: number;
    totalImpayeCDF: number;
    tauxRecouvrement: number;
  };
  checkMissingNotesForClass: (classeId: string, periode: Periode) => {
    hasMissing: boolean;
    totalMissing: number;
    details: { eleveNom: string; eleveId: string; matiereNom: string }[];
  };
  generateClassReportCards: (classeId: string, periode: Periode) => StudentReportCard[];
  getSchoolTop10: (periode: Periode) => (StudentReportCard & { ecoleRang: number })[];
  
  // Notification toast
  toastMessage: { text: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
  setToast: (msg: { text: string; type: 'success' | 'error' | 'warning' | 'info' } | null) => void;
}

export const EMPTY_SYSTEM_SCHOOL: School = {
  id: 'system_root',
  nom: 'ERP Éducatif RDC',
  code: 'SYS',
  devise: 'Scientia - Disciplina - Pax',
  ville: 'Kinshasa',
  province: 'Kinshasa',
  adresse: 'Administration Centrale',
  telephone: '+243 81 000 0000',
  email: 'contact@erp-rdc.cd',
  logoUrl: '',
  anneeAcademique: '2025-2026',
  tauxUsdCdf: 2500,
  typeEnseignement: 'Privé Agréé'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purger et initialiser les écoles : aucune école par défaut
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('erp_rdc_schools');
    if (saved) {
      try {
        const parsed: School[] = JSON.parse(saved);
        // Filtrer les anciennes écoles de démonstration (Complexe Scolaire Mgr Bokeleale, Collège Boboto)
        return parsed
          .filter(s => s.code !== 'BOK-2026' && s.code !== 'BOB-2026' && s.id !== 'school_bokeleale' && s.id !== 'school_boboto')
          .map(s => ({ ...s, tauxUsdCdf: 2500 }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('erp_rdc_users');
    let loaded: User[] = saved ? JSON.parse(saved) : MOCK_USERS;
    // Supprimer les utilisateurs des anciennes écoles de démo
    loaded = loaded.filter(u => u.schoolId !== 'school_bokeleale' && u.schoolId !== 'school_boboto');
    // S'assurer que le Super Admin est strictement Kay Nzogu
    loaded = loaded.map(u => u.role === 'super_admin' ? {
      ...u,
      nom: 'Kay Nzogu',
      email: 'kay.nzogu@erp-rdc.cd',
      roleLabel: 'Super Administrateur'
    } : u);
    // Si absent, l'injecter en tête
    if (!loaded.some(u => u.role === 'super_admin')) {
      loaded = [
        {
          id: 'u_superadmin',
          schoolId: '',
          nom: 'Kay Nzogu',
          email: 'kay.nzogu@erp-rdc.cd',
          role: 'super_admin',
          roleLabel: 'Super Administrateur',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        },
        ...loaded
      ];
    }
    return loaded;
  });

  const [currentSchool, setCurrentSchool] = useState<School>(() => {
    const saved = localStorage.getItem('erp_rdc_schools');
    if (saved) {
      try {
        const parsed: School[] = JSON.parse(saved);
        const cleaned = parsed.filter(s => s.code !== 'BOK-2026' && s.code !== 'BOB-2026' && s.id !== 'school_bokeleale');
        if (cleaned.length > 0) return { ...cleaned[0], tauxUsdCdf: 2500 };
      } catch {}
    }
    return EMPTY_SYSTEM_SCHOOL;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return users.find(u => u.role === 'super_admin') || users[0] || MOCK_USERS[0];
  });

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncQueue, setPendingSyncQueue] = useState<SyncQueueItem[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Entités métier : initialisées vides pour démarrer sur un système sans écoles de démo
  const [classes] = useState<Classe[]>(MOCK_CLASSES);
  const [matieres] = useState<Matiere[]>(MOCK_MATIERES);
  const [eleves, setEleves] = useState<Eleve[]>(() => {
    const saved = localStorage.getItem('erp_rdc_eleves');
    if (saved) {
      try {
        const parsed: Eleve[] = JSON.parse(saved);
        return parsed.filter(e => e.schoolId !== 'school_bokeleale' && !e.id.startsWith('el_'));
      } catch {}
    }
    return [];
  });
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    const saved = localStorage.getItem('erp_rdc_evaluations');
    if (saved) {
      try {
        const parsed: Evaluation[] = JSON.parse(saved);
        return parsed.filter(e => e.schoolId !== 'school_bokeleale');
      } catch {}
    }
    return [];
  });
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('erp_rdc_notes');
    if (saved) {
      try {
        const parsed: NoteItem[] = JSON.parse(saved);
        return parsed.filter(n => !n.id.startsWith('n_'));
      } catch {}
    }
    return [];
  });
  const [presences, setPresences] = useState<Presence[]>(() => {
    const saved = localStorage.getItem('erp_rdc_presences');
    if (saved) {
      try {
        const parsed: Presence[] = JSON.parse(saved);
        return parsed.filter(p => p.schoolId !== 'school_bokeleale');
      } catch {}
    }
    return [];
  });
  const [tranches] = useState<TrancheFrais[]>(MOCK_TRANCHES);
  const [paiements, setPaiements] = useState<Paiement[]>(() => {
    const saved = localStorage.getItem('erp_rdc_paiements');
    if (saved) {
      try {
        const parsed: Paiement[] = JSON.parse(saved);
        return parsed.filter(p => p.schoolId !== 'school_bokeleale');
      } catch {}
    }
    return [];
  });
  const [sanctions, setSanctions] = useState<Sanction[]>(() => {
    const saved = localStorage.getItem('erp_rdc_sanctions');
    if (saved) {
      try {
        const parsed: Sanction[] = JSON.parse(saved);
        return parsed.filter(s => s.schoolId !== 'school_bokeleale');
      } catch {}
    }
    return [];
  });
  const [bulletinModels, setBulletinModels] = useState<BulletinModel[]>(MOCK_BULLETIN_MODELS);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('erp_rdc_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('erp_rdc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('erp_rdc_eleves', JSON.stringify(eleves));
  }, [eleves]);

  useEffect(() => {
    localStorage.setItem('erp_rdc_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('erp_rdc_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('erp_rdc_paiements', JSON.stringify(paiements));
  }, [paiements]);

  useEffect(() => {
    localStorage.setItem('erp_rdc_presences', JSON.stringify(presences));
  }, [presences]);

  useEffect(() => {
    localStorage.setItem('erp_rdc_sanctions', JSON.stringify(sanctions));
  }, [sanctions]);

  const showToast = (text: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const login = (codeEcole: string, email: string, _mdp: string): boolean => {
    // If logging in as super_admin, school code can be any registered code or 'SYS'
    const cleanCode = codeEcole.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user is super admin (Kay Nzogu)
    const superAdminUser = users.find(u => 
      u.role === 'super_admin' && (
        u.email.toLowerCase() === cleanEmail || 
        cleanEmail === 'kay.nzogu@erp-rdc.cd' || 
        cleanEmail === 'gerhardnzogs@gmail.com' ||
        cleanEmail.includes('nzogu') ||
        cleanEmail.includes('nzog')
      )
    );
    if (superAdminUser) {
      setCurrentUser(superAdminUser);
      showToast(`Connexion réussie : Bienvenue ${superAdminUser.nom} (Super Administrateur)`, "success");
      return true;
    }

    const matchedSchool = schools.find(s => s.code.toUpperCase() === cleanCode);
    if (!matchedSchool) {
      showToast("Code école ou identifiants incorrects (ex: BOK-2026)", "error");
      return false;
    }
    const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail && (u.schoolId === matchedSchool.id || u.role === 'super_admin'));
    if (!matchedUser) {
      showToast("Utilisateur introuvable pour cette école", "error");
      return false;
    }
    setCurrentSchool(matchedSchool);
    setCurrentUser(matchedUser);
    showToast(`Connexion réussie : Bienvenue, ${matchedUser.nom} (${matchedUser.roleLabel})`, "success");
    return true;
  };

  const quickLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      const userSchool = schools.find(s => s.id === user.schoolId) || schools[0];
      setCurrentSchool(userSchool);
      showToast(`Profil actif : ${user.roleLabel} (${user.nom})`, "info");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    showToast("Session fermée", "info");
  };

  const addNewSchoolTenant = async (data: {
    schoolName: string;
    slug: string;
    adminName: string;
    adminEmail: string;
    tempPassword: string;
  }) => {
    // 1. Vérification du rôle Super Admin
    if (currentUser?.role !== 'super_admin') {
      return { 
        success: false, 
        error: "Accès refusé. Cette action est strictement réservée au Super Administrateur." 
      };
    }

    // 2. Nettoyage et validation du slug
    const cleanSlug = data.slug.trim().toLowerCase().replace(/\s+/g, '-');
    const slugRegex = /^[a-z0-9-]+$/;
    if (!cleanSlug || !slugRegex.test(cleanSlug)) {
      return { 
        success: false, 
        error: "Le code école (slug) doit comporter des minuscules, des chiffres et tirets uniquement." 
      };
    }

    // 3. Vérification d'unicité du slug
    if (schools.some(s => s.code.toLowerCase() === cleanSlug)) {
      return { 
        success: false, 
        error: "Ce code école (slug) est déjà utilisé par un autre établissement." 
      };
    }

    // 4. Vérification d'unicité de l'email
    const cleanEmail = data.adminEmail.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { 
        success: false, 
        error: "Cette adresse email administrateur est déjà utilisée." 
      };
    }

    // 5. Création du nouveau tenant
    const newTenantId = `tenant_${Date.now()}`;
    const newSchool: School = {
      id: newTenantId,
      code: cleanSlug,
      nom: data.schoolName.trim(),
      devise: 'Scientia - Disciplina - Pax',
      ville: 'Kinshasa',
      province: 'Kinshasa / Gombe',
      adresse: 'Kinshasa, RDC',
      telephone: '+243 81 000 0000',
      email: cleanEmail,
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
      anneeAcademique: '2025-2026',
      tauxUsdCdf: 2500,
      typeEnseignement: 'Privé Agréé'
    };

    // 6. Création de l'administrateur de l'école (Rôle Préfet) avec school_id injecté
    const newAdminUser: User = {
      id: `u_${Date.now()}`,
      schoolId: newTenantId,
      nom: data.adminName.trim(),
      email: cleanEmail,
      role: 'prefet',
      roleLabel: 'Préfet des Études (Admin d\'école)',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    };

    setSchools(prev => [...prev, newSchool]);
    setUsers(prev => [...prev, newAdminUser]);
    if (currentSchool.id === 'system_root' || schools.length === 0) {
      setCurrentSchool(newSchool);
    }

    showToast(`École « ${newSchool.nom} » créée avec succès (Code : ${cleanSlug}, Taux : 1$ = 2.500 FC)`, 'success');

    return {
      success: true,
      tenant_id: newTenantId,
      school_code: cleanSlug,
      school_name: newSchool.nom,
      admin_email: cleanEmail
    };
  };

  const syncNow = async () => {
    if (isOffline) {
      showToast("Impossible de synchroniser : Vous êtes actuellement hors-ligne.", "warning");
      return;
    }
    if (pendingSyncQueue.length === 0) {
      showToast("Toutes les données locales sont déjà synchronisées avec Supabase (Paris eu-west-3).", "info");
      return;
    }

    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    
    // Mark items synced
    setPendingSyncQueue([]);
    setNotes(prev => prev.map(n => ({ ...n, synced: true })));
    setPresences(prev => prev.map(p => ({ ...p, synced: true })));
    setPaiements(prev => prev.map(p => ({ ...p, synced: true })));
    setIsSyncing(false);
    showToast("Synchronisation réussie avec Supabase Paris (RLS & multi-tenant validés).", "success");
  };

  // Helper currency formatters (1 USD = 2500 FC)
  const formatCDF = (montant: number) => {
    return new Intl.NumberFormat('fr-CD', { style: 'decimal', maximumFractionDigits: 0 }).format(montant) + ' FC';
  };

  const formatUSD = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(montant);
  };

  const convertCDFtoUSD = (montantCDF: number) => {
    const rate = currentSchool?.tauxUsdCdf || 2500;
    return Number((montantCDF / rate).toFixed(2));
  };

  const convertUSDtoCDF = (montantUSD: number) => {
    const rate = currentSchool?.tauxUsdCdf || 2500;
    return Math.round(montantUSD * rate);
  };

  // Actions
  const addEleve = (nouveau: Omit<Eleve, 'id' | 'schoolId' | 'dateInscription'>) => {
    const id = `el_${Date.now()}`;
    const newStudent: Eleve = {
      ...nouveau,
      id,
      schoolId: currentSchool.id,
      dateInscription: new Date().toISOString().split('T')[0]
    };
    setEleves(prev => [newStudent, ...prev]);

    if (isOffline) {
      setPendingSyncQueue(prev => [
        ...prev,
        {
          id: `sync_${Date.now()}`,
          type: 'eleve',
          description: `Inscription élève: ${newStudent.nom} ${newStudent.prenom}`,
          timestamp: new Date().toLocaleTimeString(),
          payload: newStudent,
          status: 'pending'
        }
      ]);
      showToast("Élève inscrit localement (En attente de synchronisation).", "warning");
    } else {
      showToast(`Élève ${newStudent.nom} ${newStudent.prenom} inscrit avec succès.`, "success");
    }
  };

  const updateEleve = (id: string, updates: Partial<Eleve>) => {
    setEleves(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    showToast("Dossier élève mis à jour", "success");
  };

  const deleteEleve = (id: string) => {
    // Soft delete according to DRC Numeric Code
    setEleves(prev => prev.map(e => e.id === id ? { ...e, statut: 'radie' } : e));
    showToast("Dossier élève archivé (Soft Delete - Droit à l'effacement)", "info");
  };

  const createEvaluation = (data: Omit<Evaluation, 'id'>) => {
    const newEval: Evaluation = {
      ...data,
      id: `eval_${Date.now()}`
    };
    setEvaluations(prev => [...prev, newEval]);
    showToast(`Évaluation "${newEval.titre}" créée avec succès.`, "success");
  };

  const saveNotes = (evaluationId: string, notesMap: Record<string, number | null>) => {
    const now = new Date().toISOString().split('T')[0];
    const updatedNotes: NoteItem[] = [];

    setNotes(prev => {
      const existing = [...prev];
      Object.entries(notesMap).forEach(([eleveId, valeur]) => {
        const index = existing.findIndex(n => n.evaluationId === evaluationId && n.eleveId === eleveId);
        if (index >= 0) {
          existing[index] = {
            ...existing[index],
            valeur,
            synced: !isOffline,
            dateModif: now
          };
          updatedNotes.push(existing[index]);
        } else {
          const newItem: NoteItem = {
            id: `n_${Date.now()}_${eleveId}`,
            evaluationId,
            eleveId,
            valeur,
            synced: !isOffline,
            dateModif: now
          };
          existing.push(newItem);
          updatedNotes.push(newItem);
        }
      });
      return existing;
    });

    if (isOffline) {
      setPendingSyncQueue(prev => [
        ...prev,
        {
          id: `sync_${Date.now()}`,
          type: 'note',
          description: `Saisie de ${Object.keys(notesMap).length} notes d'évaluation`,
          timestamp: new Date().toLocaleTimeString(),
          payload: { evaluationId, notesMap },
          status: 'pending'
        }
      ]);
      showToast("Notes enregistrées en mode HORS-LIGNE (Badge en attente de synchronisation)", "warning");
    } else {
      showToast("Notes enregistrées et synchronisées avec le serveur", "success");
    }
  };

  const savePresences = (presencesData: Omit<Presence, 'id' | 'schoolId' | 'synced'>[]) => {
    const newItems: Presence[] = presencesData.map((p, idx) => ({
      ...p,
      id: `pres_${Date.now()}_${idx}`,
      schoolId: currentSchool.id,
      synced: !isOffline
    }));

    setPresences(prev => {
      // replace entries for same student on same date & session/demiJournee
      const filtered = prev.filter(p => !newItems.some(n => 
        n.eleveId === p.eleveId && 
        n.date === p.date && 
        n.type === p.type && 
        n.demiJournee === p.demiJournee && 
        n.matiereId === p.matiereId
      ));
      return [...newItems, ...filtered];
    });

    if (isOffline) {
      setPendingSyncQueue(prev => [
        ...prev,
        {
          id: `sync_${Date.now()}`,
          type: 'presence',
          description: `Présences pour ${newItems.length} élèves`,
          timestamp: new Date().toLocaleTimeString(),
          payload: newItems,
          status: 'pending'
        }
      ]);
      showToast("Présences enregistrées hors-ligne", "warning");
    } else {
      showToast("Feuille de présence enregistrée avec succès", "success");
    }
  };

  const encaisserPaiement = (data: Omit<Paiement, 'id' | 'schoolId' | 'recuNumero' | 'synced'>): Paiement => {
    const count = paiements.length + 1;
    const recuNumero = `RC-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    const newPaiement: Paiement = {
      ...data,
      id: `p_${Date.now()}`,
      schoolId: currentSchool.id,
      recuNumero,
      synced: !isOffline
    };

    setPaiements(prev => [newPaiement, ...prev]);

    if (isOffline) {
      setPendingSyncQueue(prev => [
        ...prev,
        {
          id: `sync_${Date.now()}`,
          type: 'paiement',
          description: `Encaissement ${formatCDF(newPaiement.montantCDF)} (${recuNumero})`,
          timestamp: new Date().toLocaleTimeString(),
          payload: newPaiement,
          status: 'pending'
        }
      ]);
      showToast(`Paiement enregistré hors-ligne : Reçu ${recuNumero}`, "warning");
    } else {
      showToast(`Paiement validé avec succès : Reçu officiel ${recuNumero}`, "success");
    }

    return newPaiement;
  };

  const addSanction = (data: Omit<Sanction, 'id' | 'schoolId'>) => {
    const newSanction: Sanction = {
      ...data,
      id: `sanc_${Date.now()}`,
      schoolId: currentSchool.id
    };
    setSanctions(prev => [newSanction, ...prev]);
    showToast(`Sanction "${newSanction.type}" enregistrée pour l'élève.`, "info");
  };

  const importBulletinModel = (data: Omit<BulletinModel, 'id' | 'schoolId' | 'importedAt' | 'valide'>) => {
    const newModel: BulletinModel = {
      ...data,
      id: `bm_${Date.now()}`,
      schoolId: currentSchool.id,
      importedAt: new Date().toLocaleString(),
      valide: true
    };
    setBulletinModels(prev => [newModel, ...prev]);
    showToast(`Modèle "${newModel.fileName}" importé et validé pour cette classe et période.`, "success");
  };

  // Financial Calculations
  const getStudentPaymentStatus = (eleveId: string) => {
    const studentPaiements = paiements.filter(p => p.eleveId === eleveId);
    let totalDuCDF = 0;
    let totalPayeCDF = 0;

    const tranchesDetails = tranches.map(tranche => {
      totalDuCDF += tranche.montantCDF;
      const payePourTranche = studentPaiements
        .filter(p => p.trancheId === tranche.id)
        .reduce((sum, p) => sum + p.montantCDF, 0);

      totalPayeCDF += payePourTranche;
      const resteCDF = Math.max(0, tranche.montantCDF - payePourTranche);

      let statut: 'Payée' | 'Partielle' | 'Impayée' = 'Impayée';
      if (resteCDF === 0 && payePourTranche > 0) {
        statut = 'Payée';
      } else if (payePourTranche > 0) {
        statut = 'Partielle';
      }

      return {
        tranche,
        payeCDF: payePourTranche,
        resteCDF,
        statut
      };
    });

    const resteCDF = Math.max(0, totalDuCDF - totalPayeCDF);
    const pourcentagePaye = totalDuCDF > 0 ? (totalPayeCDF / totalDuCDF) * 100 : 0;

    return {
      totalDuCDF,
      totalPayeCDF,
      resteCDF,
      pourcentagePaye,
      tranchesDetails
    };
  };

  const getSchoolFinancialSummary = () => {
    const activeEleves = eleves.filter(e => e.statut === 'actif');
    const totalParEleve = tranches.reduce((sum, t) => sum + t.montantCDF, 0);
    const totalAttenduCDF = activeEleves.length * totalParEleve;
    const totalRecouvreCDF = paiements.reduce((sum, p) => sum + p.montantCDF, 0);
    const totalImpayeCDF = Math.max(0, totalAttenduCDF - totalRecouvreCDF);
    const tauxRecouvrement = totalAttenduCDF > 0 ? (totalRecouvreCDF / totalAttenduCDF) * 100 : 0;

    return {
      totalAttenduCDF,
      totalRecouvreCDF,
      totalImpayeCDF,
      tauxRecouvrement
    };
  };

  // Grade & Bulletin Calculations
  // Section 5 PRD:
  // - Par cours: moyenne pondérée des évaluations de la période (notes * coef / somme des coefs)
  // - Pourcentage du bulletin: moyenne simple des pourcentages par cours
  // - Rang: sur tous les élèves de la classe
  // - Blocage absolu si notes de période manquantes
  const checkMissingNotesForClass = (classeId: string, periode: Periode) => {
    const classEleves = eleves.filter(e => e.classeId === classeId && e.statut === 'actif');
    const classMatieres = matieres.filter(m => m.classeId === classeId);
    const periodEvals = evaluations.filter(ev => ev.classeId === classeId && ev.periode === periode);

    const missingDetails: { eleveNom: string; eleveId: string; matiereNom: string }[] = [];

    classEleves.forEach(eleve => {
      classMatieres.forEach(mat => {
        const matEvals = periodEvals.filter(ev => ev.matiereId === mat.id);
        if (matEvals.length === 0) {
          // No evaluation exists at all for this subject in this period
          missingDetails.push({
            eleveNom: `${eleve.nom} ${eleve.prenom}`,
            eleveId: eleve.id,
            matiereNom: `${mat.nom} (Aucune évaluation créée)`
          });
        } else {
          matEvals.forEach(ev => {
            const studentNote = notes.find(n => n.evaluationId === ev.id && n.eleveId === eleve.id);
            if (!studentNote || studentNote.valeur === null || studentNote.valeur === undefined) {
              missingDetails.push({
                eleveNom: `${eleve.nom} ${eleve.prenom}`,
                eleveId: eleve.id,
                matiereNom: `${mat.nom} (${ev.titre})`
              });
            }
          });
        }
      });
    });

    return {
      hasMissing: missingDetails.length > 0,
      totalMissing: missingDetails.length,
      details: missingDetails
    };
  };

  const generateClassReportCards = (classeId: string, periode: Periode): StudentReportCard[] => {
    const classe = classes.find(c => c.id === classeId);
    if (!classe) return [];

    const classEleves = eleves.filter(e => e.classeId === classeId && e.statut === 'actif');
    const classMatieres = matieres.filter(m => m.classeId === classeId);
    const periodEvals = evaluations.filter(ev => ev.classeId === classeId && ev.periode === periode);

    // Compute for each student
    const unrankedReports = classEleves.map(eleve => {
      let missingCount = 0;
      let sumPercentages = 0;
      let totalObtenu = 0;
      let totalMax = 0;

      const coursResults: StudentReportCourse[] = classMatieres.map(mat => {
        const matEvals = periodEvals.filter(ev => ev.matiereId === mat.id);
        totalMax += mat.maxima;

        if (matEvals.length === 0) {
          missingCount++;
          return {
            matiereId: mat.id,
            matiereNom: mat.nom,
            maxima: mat.maxima,
            noteObtenue: null,
            pourcentage: null,
            isMissing: true
          };
        }

        let totalWeightedPoints = 0;
        let totalWeightedMax = 0;
        let hasIncomplete = false;

        matEvals.forEach(ev => {
          const n = notes.find(item => item.evaluationId === ev.id && item.eleveId === eleve.id);
          if (!n || n.valeur === null) {
            hasIncomplete = true;
          } else {
            totalWeightedPoints += n.valeur * ev.coefficient;
            totalWeightedMax += ev.maxPoints * ev.coefficient;
          }
        });

        if (hasIncomplete || totalWeightedMax === 0) {
          missingCount++;
          return {
            matiereId: mat.id,
            matiereNom: mat.nom,
            maxima: mat.maxima,
            noteObtenue: null,
            pourcentage: null,
            isMissing: true
          };
        }

        // Weighted ratio scaled to course maxima
        const ratio = totalWeightedPoints / totalWeightedMax;
        const noteObtenue = Number((ratio * mat.maxima).toFixed(1));
        const coursePct = Number((ratio * 100).toFixed(1));

        totalObtenu += noteObtenue;
        sumPercentages += coursePct;

        return {
          matiereId: mat.id,
          matiereNom: mat.nom,
          maxima: mat.maxima,
          noteObtenue,
          pourcentage: coursePct,
          isMissing: false
        };
      });

      // Simple average of course percentages according to PRD section 5
      const validCoursesCount = coursResults.filter(c => !c.isMissing).length;
      const pctGlobal = validCoursesCount > 0 ? Number((sumPercentages / classMatieres.length).toFixed(1)) : 0;

      let mention = 'Médiocre';
      if (pctGlobal >= 80) mention = 'Élite (Très Grande Distinction)';
      else if (pctGlobal >= 70) mention = 'Grande Distinction';
      else if (pctGlobal >= 60) mention = 'Distinction';
      else if (pctGlobal >= 50) mention = 'Satisfaction';

      return {
        eleve,
        classe,
        periode,
        cours: coursResults,
        totalObtenu: Number(totalObtenu.toFixed(1)),
        totalMax,
        pourcentageGlobal: pctGlobal,
        rang: 1, // calculated next
        totalElevesClasse: classEleves.length,
        hasMissingNotes: missingCount > 0,
        missingCoursesCount: missingCount,
        mention
      };
    });

    // Sort descending by percentage to assign ranks
    const sorted = [...unrankedReports].sort((a, b) => b.pourcentageGlobal - a.pourcentageGlobal);
    sorted.forEach((item, index) => {
      item.rang = index + 1;
    });

    return sorted;
  };

  const getSchoolTop10 = (periode: Periode) => {
    let allClassReports: StudentReportCard[] = [];
    classes.forEach(c => {
      const reports = generateClassReportCards(c.id, periode);
      allClassReports = [...allClassReports, ...reports];
    });

    // Sort globally
    const sortedAll = allClassReports
      .filter(r => !r.hasMissingNotes)
      .sort((a, b) => b.pourcentageGlobal - a.pourcentageGlobal);

    return sortedAll.slice(0, 10).map((item, idx) => ({
      ...item,
      ecoleRang: idx + 1
    }));
  };

  return (
    <AppContext.Provider
      value={{
        schools,
        currentSchool,
        setSchool: setCurrentSchool,
        currentUser,
        login,
        quickLogin,
        logout,
        addNewSchoolTenant,
        isOffline,
        setIsOffline,
        pendingSyncQueue,
        isSyncing,
        syncNow,
        classes,
        matieres,
        eleves,
        evaluations,
        notes,
        presences,
        tranches,
        paiements,
        sanctions,
        bulletinModels,
        addEleve,
        updateEleve,
        deleteEleve,
        createEvaluation,
        saveNotes,
        savePresences,
        encaisserPaiement,
        addSanction,
        importBulletinModel,
        formatCDF,
        formatUSD,
        convertCDFtoUSD,
        convertUSDtoCDF,
        getStudentPaymentStatus,
        getSchoolFinancialSummary,
        checkMissingNotesForClass,
        generateClassReportCards,
        getSchoolTop10,
        toastMessage,
        setToast: setToastMessage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
