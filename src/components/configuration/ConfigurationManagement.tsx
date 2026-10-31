import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  School as SchoolIcon, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Save,
  Globe,
  Building2
} from 'lucide-react';

export const ConfigurationManagement: React.FC = () => {
  const { currentSchool, setSchool, schools } = useApp();

  const [nom, setNom] = useState(currentSchool?.nom || '');
  const [devise, setDevise] = useState(currentSchool?.devise || '');
  const [taux, setTaux] = useState(currentSchool?.tauxUsdCdf || 2500);
  const [annee, setAnnee] = useState(currentSchool?.anneeAcademique || '2025-2026');
  const [telephone, setTelephone] = useState(currentSchool?.telephone || '');
  const [adresse, setAdresse] = useState(currentSchool?.adresse || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSchool({
      ...currentSchool,
      nom,
      devise,
      tauxUsdCdf: Number(taux),
      anneeAcademique: annee,
      telephone,
      adresse
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSwitchTenant = (schoolId: string) => {
    const sc = schools.find(s => s.id === schoolId);
    if (sc) {
      setSchool(sc);
      setNom(sc.nom);
      setDevise(sc.devise);
      setTaux(sc.tauxUsdCdf || 2500);
      setAnnee(sc.anneeAcademique);
      setTelephone(sc.telephone);
      setAdresse(sc.adresse);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-1">
            <Settings className="w-3.5 h-3.5" />
            Paramètres Généraux
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Configuration de l'Établissement & Multi-Tenant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Identité institutionnelle, taux de conversion FC/USD (1 $ = 2.500 FC), calendrier scolaire et matrice des autorisations.
          </p>
        </div>

        {isSaved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Modifications enregistrées !
          </span>
        )}
      </div>

      {/* Multi-Tenant Switcher */}
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            Isolation Multi-Tenant (Choix de l'École)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chaque école dispose d'une base de données étanche et sécurisée par Row Level Security (RLS) sur Supabase Paris.
          </p>
        </div>

        {schools.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-2">
            <Building2 className="w-8 h-8 text-amber-400/60 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">Aucune école enregistrée pour le moment</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Utilisez le module <strong>« Ajouter une école (Tenants) »</strong> réservé au Super Administrateur <strong>Kay Nzogu</strong> pour créer votre premier établissement scolaire.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {schools.map((school) => {
              const isCurrent = school.id === currentSchool?.id;
              return (
                <button
                  key={school.id}
                  type="button"
                  onClick={() => handleSwitchTenant(school.id)}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-3.5 ${
                    isCurrent 
                      ? 'bg-amber-500/20 border-amber-400/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0 flex items-center justify-center">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} alt={school.nom} className="w-full h-full object-cover" />
                    ) : (
                      <SchoolIcon className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm truncate">{school.nom}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800">
                        {school.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{school.province} • 1$ = {school.tauxUsdCdf || 2500} FC</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* School Identity & Financial Rate Form */}
      <form onSubmit={handleSave} className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <SchoolIcon className="w-5 h-5 text-amber-400" />
          Identité imprimée sur les reçus et bulletins
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nom officiel de l'école
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Devise de l'école
            </label>
            <input
              type="text"
              required
              value={devise}
              onChange={(e) => setDevise(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Taux de change (1 USD = 2.500 FC)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1000"
                max="10000"
                required
                value={taux}
                onChange={(e) => setTaux(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">FC</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Utilisé pour l'affichage de la contre-valeur USD sur les reçus de paiement (1$ = 2.500 FC).</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Année Académique
            </label>
            <input
              type="text"
              required
              value={annee}
              onChange={(e) => setAnnee(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Téléphone du secrétariat
            </label>
            <input
              type="text"
              required
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Adresse physique
            </label>
            <input
              type="text"
              required
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer la configuration</span>
          </button>
        </div>
      </form>

      {/* RBAC Security Matrix Display (PRD Section 9 & 02-app-flow.md) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white font-heading">
            Séparation Stricte des Rôles & Privilèges (Matrice RBAC)
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Règle inviolable : le comptable ne peut jamais modifier de notes scolaires, et le surveillant n'a aucun accès aux écritures financières.
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Rôle</th>
                <th className="py-2.5 px-3">Tableau de bord</th>
                <th className="py-2.5 px-3">Notes & Pédagogie</th>
                <th className="py-2.5 px-3">Bulletins</th>
                <th className="py-2.5 px-3">Finances (CDF/USD)</th>
                <th className="py-2.5 px-3">Administration</th>
                <th className="py-2.5 px-3">Discipline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-2.5 px-3 font-bold text-amber-300">Préfet des Études</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Lecture / Rapports</td>
                <td className="py-2.5 px-3 text-emerald-400">Lecture</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Validation / Print</td>
                <td className="py-2.5 px-3 text-emerald-400">Audit / Rapports</td>
                <td className="py-2.5 px-3 text-emerald-400">Supervision</td>
                <td className="py-2.5 px-3 text-emerald-400">Approbation</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Directeur des Études</td>
                <td className="py-2.5 px-3 text-slate-500">-</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Contrôle / Cotes</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Génération / Blocage</td>
                <td className="py-2.5 px-3 text-rose-500">Bloqué (0)</td>
                <td className="py-2.5 px-3 text-emerald-400">Classes & Options</td>
                <td className="py-2.5 px-3 text-slate-500">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Comptable Principal</td>
                <td className="py-2.5 px-3 text-slate-500">-</td>
                <td className="py-2.5 px-3 text-rose-500 font-bold">Strictement Bloqué</td>
                <td className="py-2.5 px-3 text-rose-500 font-bold">Strictement Bloqué</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Écriture / Quittance</td>
                <td className="py-2.5 px-3 text-slate-400">Lecture Facturation</td>
                <td className="py-2.5 px-3 text-rose-500">Bloqué</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Enseignant Titulaire</td>
                <td className="py-2.5 px-3 text-slate-500">-</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Écriture (Ses cours)</td>
                <td className="py-2.5 px-3 text-slate-400">Consultation</td>
                <td className="py-2.5 px-3 text-rose-500">Bloqué</td>
                <td className="py-2.5 px-3 text-slate-500">-</td>
                <td className="py-2.5 px-3 text-slate-500">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Surveillant Général</td>
                <td className="py-2.5 px-3 text-slate-500">-</td>
                <td className="py-2.5 px-3 text-rose-500">Bloqué</td>
                <td className="py-2.5 px-3 text-rose-500">Bloqué</td>
                <td className="py-2.5 px-3 text-rose-500">Bloqué</td>
                <td className="py-2.5 px-3 text-slate-500">-</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Présences demi-journée</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
