import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eleve } from '../../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  FileText, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  Upload,
  Calendar,
  Phone,
  MapPin
} from 'lucide-react';

export const ElevesManagement: React.FC = () => {
  const { 
    classes, 
    eleves, 
    addEleve, 
    updateEleve, 
    deleteEleve, 
    getStudentPaymentStatus,
    currentSchool 
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('all');
  const [filterSexe, setFilterSexe] = useState('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEleveDetail, setSelectedEleveDetail] = useState<Eleve | null>(null);

  // New Student Form
  const [nom, setNom] = useState('');
  const [postnom, setPostnom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [sexe, setSexe] = useState<'M' | 'F'>('M');
  const [dateNaissance, setDateNaissance] = useState('2010-05-14');
  const [lieuNaissance, setLieuNaissance] = useState('Kinshasa');
  const [classeId, setClasseId] = useState(classes[0]?.id || '');
  const [nomTuteur, setNomTuteur] = useState('');
  const [telTuteur, setTelTuteur] = useState('+243 81 ');
  const [adresse, setAdresse] = useState('');
  const [consentementParental, setConsentementParental] = useState(true);

  const activeEleves = eleves.filter(e => e.statut === 'actif');

  const filteredList = activeEleves.filter(e => {
    const matchSearch = 
      e.nom.toLowerCase().includes(search.toLowerCase()) ||
      e.postnom.toLowerCase().includes(search.toLowerCase()) ||
      e.prenom.toLowerCase().includes(search.toLowerCase()) ||
      e.matricule.toLowerCase().includes(search.toLowerCase());

    const matchClasse = filterClasse === 'all' || e.classeId === filterClasse;
    const matchSexe = filterSexe === 'all' || e.sexe === filterSexe;

    return matchSearch && matchClasse && matchSexe;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !postnom.trim() || !prenom.trim()) return;

    const matricule = `BOK-25-${String(eleves.length + 101).padStart(4, '0')}`;
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    ];
    const photoUrl = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];

    addEleve({
      matricule,
      nom: nom.toUpperCase(),
      postnom: postnom.toUpperCase(),
      prenom,
      sexe,
      dateNaissance,
      lieuNaissance,
      classeId,
      nomTuteur,
      telTuteur,
      adresse,
      photoUrl,
      acteNaissanceUrl: '/documents/acte_naissance_conforme.pdf',
      statut: 'actif'
    });

    // Reset & close
    setNom('');
    setPostnom('');
    setPrenom('');
    setNomTuteur('');
    setAdresse('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            Secrétariat & Administration
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Dossiers Scolaires & Inscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Gestion du registre d'immatriculation, pièces d'état civil et conformité Code du Numérique RDC.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Inscrire un élève</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, matricule..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <select
            value={filterClasse}
            onChange={(e) => setFilterClasse(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterSexe}
            onChange={(e) => setFilterSexe(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">Tous les genres (M & F)</option>
            <option value="M">Garçons (M)</option>
            <option value="F">Filles (F)</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-3">Photo</th>
                <th className="py-3 px-3">Matricule</th>
                <th className="py-3 px-3">Nom, Postnom & Prénom</th>
                <th className="py-3 px-3 text-center">Genre</th>
                <th className="py-3 px-3">Classe</th>
                <th className="py-3 px-3">Parent / Tuteur</th>
                <th className="py-3 px-3 text-center">Frais Scolaires</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.map((eleve) => {
                const cls = classes.find(c => c.id === eleve.classeId);
                const payment = getStudentPaymentStatus(eleve.id);

                return (
                  <tr key={eleve.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                        <img src={eleve.photoUrl} alt={eleve.nom} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-amber-300">
                      {eleve.matricule}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-100">
                      {eleve.nom} {eleve.postnom} {eleve.prenom}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        eleve.sexe === 'F' ? 'bg-pink-500/10 text-pink-300' : 'bg-sky-500/10 text-sky-300'
                      }`}>
                        {eleve.sexe}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-xs">
                      {cls?.nom}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-xs">
                      <div>{eleve.nomTuteur}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{eleve.telTuteur}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        payment.resteCDF === 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : payment.totalPayeCDF > 0 
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {payment.resteCDF === 0 ? 'En règle' : `${payment.pourcentagePaye.toFixed(0)}% réglé`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedEleveDetail(eleve)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Consulter le dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteEleve(eleve.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                          title="Archiver / Droit à l'effacement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Inscrire un nouvel élève */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Nouvelle Inscription Scolaire
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fiche administrative et dossier numérique conforme
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="ex: KABASELE"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Postnom *</label>
                  <input
                    type="text"
                    required
                    value={postnom}
                    onChange={(e) => setPostnom(e.target.value)}
                    placeholder="ex: TSHIMANGA"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="ex: Emmanuel"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Genre *</label>
                  <select
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value as 'M' | 'F')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Date de naissance</label>
                  <input
                    type="date"
                    required
                    value={dateNaissance}
                    onChange={(e) => setDateNaissance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Lieu de naissance</label>
                  <input
                    type="text"
                    required
                    value={lieuNaissance}
                    onChange={(e) => setLieuNaissance(e.target.value)}
                    placeholder="ex: Kinshasa"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Classe d'affectation</label>
                  <select
                    value={classeId}
                    onChange={(e) => setClasseId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.section})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Nom du Tuteur / Parent</label>
                  <input
                    type="text"
                    required
                    value={nomTuteur}
                    onChange={(e) => setNomTuteur(e.target.value)}
                    placeholder="ex: M. Albert Tshimanga"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Téléphone de contact (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={telTuteur}
                    onChange={(e) => setTelTuteur(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Adresse de résidence</label>
                  <input
                    type="text"
                    required
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    placeholder="ex: Avenue Lumumba n°12, Gombe"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Upload simulation: Photo & Acte de Naissance */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-300">Pièces justificatives obligatoires :</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Photo d'identité (Téléversée)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Acte de naissance officiel (PDF)
                  </span>
                </div>
              </div>

              {/* Consent checkbox (DRC Numeric Code) */}
              <div className="flex items-start gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentementParental}
                  onChange={(e) => setConsentementParental(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="consent" className="text-xs text-slate-400 leading-relaxed">
                  Consentement parental recueilli conformément à l'<strong>Ordonnance-loi n°23/010 du 13 mars 2023 portant Code du Numérique en RDC</strong> pour le traitement et la conservation sécurisée des données de l'élève mineur.
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!consentementParental}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition disabled:opacity-40"
                >
                  Valider l'inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Consulter le dossier élève */}
      {selectedEleveDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-heading">
                Dossier Scolaire Individuel
              </h3>
              <button onClick={() => setSelectedEleveDetail(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                <img src={selectedEleveDetail.photoUrl} alt={selectedEleveDetail.nom} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {selectedEleveDetail.nom} {selectedEleveDetail.postnom} {selectedEleveDetail.prenom}
                </h4>
                <p className="text-xs text-amber-300 font-mono mt-0.5">{selectedEleveDetail.matricule}</p>
                <p className="text-xs text-slate-400 mt-1">Inscrit le {selectedEleveDetail.dateInscription}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border border-slate-800 p-4 rounded-2xl bg-slate-950/60">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Date et Lieu :</span>
                <span className="text-slate-200">{selectedEleveDetail.dateNaissance} à {selectedEleveDetail.lieuNaissance}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Genre :</span>
                <span className="text-slate-200">{selectedEleveDetail.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Parent / Tuteur :</span>
                <span className="text-slate-200">{selectedEleveDetail.nomTuteur}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Contact :</span>
                <span className="text-slate-200 font-mono">{selectedEleveDetail.telTuteur}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Adresse :</span>
                <span className="text-slate-200">{selectedEleveDetail.adresse}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Acte de Naissance certifié</span>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Conforme
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEleveDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
