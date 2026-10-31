import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Periode, Matiere, Classe, Evaluation } from '../../types';
import { 
  BookOpen, 
  Plus, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator, 
  Clock, 
  Layers, 
  ChevronRight,
  Filter,
  WifiOff
} from 'lucide-react';

export const NotesManagement: React.FC = () => {
  const { 
    classes, 
    matieres, 
    eleves, 
    evaluations, 
    notes, 
    createEvaluation, 
    saveNotes, 
    isOffline,
    currentUser 
  } = useApp();

  // Selected filters
  const [selectedClasseId, setSelectedClasseId] = useState<string>(classes[0]?.id || '');
  const [selectedMatiereId, setSelectedMatiereId] = useState<string>('');
  const [selectedPeriode, setSelectedPeriode] = useState<Periode>('P1');
  const [selectedEvalId, setSelectedEvalId] = useState<string>('');

  // Local state for interactive grade inputs
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New evaluation form state
  const [newEvalTitle, setNewEvalTitle] = useState('');
  const [newEvalMax, setNewEvalMax] = useState<number>(20);
  const [newEvalCoef, setNewEvalCoef] = useState<number>(1);
  const [newEvalDate, setNewEvalDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filter matieres for selected class
  const classMatieres = matieres.filter(m => m.classeId === selectedClasseId);

  // Update selected matiere if class changes
  useEffect(() => {
    if (classMatieres.length > 0) {
      // If teacher has assigned subjects, pick theirs
      if (currentUser?.role === 'enseignant' && currentUser.matieresAssigned) {
        const assigned = classMatieres.find(m => currentUser.matieresAssigned?.includes(m.id));
        setSelectedMatiereId(assigned ? assigned.id : classMatieres[0].id);
      } else {
        setSelectedMatiereId(classMatieres[0].id);
      }
    }
  }, [selectedClasseId]);

  // Evaluations matching class, matiere, and period
  const currentEvals = evaluations.filter(ev => 
    ev.classeId === selectedClasseId && 
    ev.matiereId === selectedMatiereId && 
    ev.periode === selectedPeriode
  );

  // Set default selected evaluation
  useEffect(() => {
    if (currentEvals.length > 0) {
      setSelectedEvalId(currentEvals[0].id);
    } else {
      setSelectedEvalId('');
    }
  }, [selectedMatiereId, selectedPeriode, evaluations]);

  // Populate gradeInputs when selectedEvalId changes
  useEffect(() => {
    if (!selectedEvalId) {
      setGradeInputs({});
      return;
    }
    const map: Record<string, string> = {};
    const evalNotes = notes.filter(n => n.evaluationId === selectedEvalId);
    evalNotes.forEach(n => {
      if (n.valeur !== null && n.valeur !== undefined) {
        map[n.eleveId] = String(n.valeur);
      }
    });
    setGradeInputs(map);
  }, [selectedEvalId, notes]);

  const classStudents = eleves.filter(e => e.classeId === selectedClasseId && e.statut === 'actif');
  const activeEval = evaluations.find(ev => ev.id === selectedEvalId);
  const activeMatiere = matieres.find(m => m.id === selectedMatiereId);
  const activeClasse = classes.find(c => c.id === selectedClasseId);

  const handleGradeChange = (eleveId: string, val: string) => {
    setGradeInputs(prev => ({ ...prev, [eleveId]: val }));
  };

  const handleSaveAll = () => {
    if (!selectedEvalId) return;

    const payload: Record<string, number | null> = {};
    classStudents.forEach(e => {
      const raw = gradeInputs[e.id];
      if (raw === undefined || raw === '' || isNaN(Number(raw))) {
        payload[e.id] = null;
      } else {
        const num = Number(raw);
        // Clamp to max points
        const max = activeEval?.maxPoints || 20;
        payload[e.id] = Math.min(Math.max(0, num), max);
      }
    });

    saveNotes(selectedEvalId, payload);
  };

  const handleCreateEvalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvalTitle.trim() || !selectedMatiereId || !selectedClasseId) return;

    createEvaluation({
      matiereId: selectedMatiereId,
      classeId: selectedClasseId,
      titre: newEvalTitle,
      periode: selectedPeriode,
      maxPoints: Number(newEvalMax) || 20,
      coefficient: Number(newEvalCoef) || 1,
      date: newEvalDate
    });

    setNewEvalTitle('');
    setShowCreateModal(false);
  };

  // Period label formatter
  const periodesList: { id: Periode; label: string }[] = [
    { id: 'P1', label: '1ère Période' },
    { id: 'P2', label: '2ème Période' },
    { id: 'EXAM_S1', label: 'Examen 1er Semestre' },
    { id: 'P3', label: '3ème Période' },
    { id: 'P4', label: '4ème Période' },
    { id: 'EXAM_S2', label: 'Examen 2ème Semestre' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            Module Pédagogique
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Saisie et Gestion des Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Transcription des évaluations et calcul de la moyenne pondérée par cours selon le programme de la RDC.
          </p>
        </div>

        {/* Sync / Offline Status Badge */}
        <div className="flex items-center gap-2">
          {isOffline ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              En attente de synchronisation (Hors-ligne)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Synchronisé avec Supabase
            </span>
          )}
        </div>
      </div>

      {/* Selectors Filter Bar: Class, Subject, Period */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Class selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            1. Sélectionner la classe
          </label>
          <select
            value={selectedClasseId}
            onChange={(e) => setSelectedClasseId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 transition"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nom} ({c.section})
              </option>
            ))}
          </select>
        </div>

        {/* Subject selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            2. Cours / Matière
          </label>
          <select
            value={selectedMatiereId}
            onChange={(e) => setSelectedMatiereId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 transition"
          >
            {classMatieres.map(m => (
              <option key={m.id} value={m.id}>
                {m.nom} (Max {m.maxima} pts) - {m.enseignantNom}
              </option>
            ))}
          </select>
        </div>

        {/* Period selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            3. Période académique
          </label>
          <select
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value as Periode)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400 transition"
          >
            {periodesList.map(p => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Evaluations list pills & "Créer une évaluation" button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Évaluations ({currentEvals.length}) :
          </span>
          {currentEvals.length === 0 ? (
            <span className="text-xs text-amber-400/90 italic">
              Aucune évaluation créée pour cette période.
            </span>
          ) : (
            currentEvals.map(ev => {
              const isSelected = selectedEvalId === ev.id;
              return (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvalId(ev.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-sm'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{ev.titre}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] text-slate-400">
                    /{ev.maxPoints} (coef {ev.coefficient})
                  </span>
                </button>
              );
            })
          )}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une évaluation</span>
        </button>
      </div>

      {/* Main Grade Input Spreadsheet Card */}
      {activeEval ? (
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-heading">
                  {activeEval.titre}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Barème : {activeEval.maxPoints} pts • Coef {activeEval.coefficient}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Matière : <strong className="text-slate-200">{activeMatiere?.nom}</strong> • Classe : <strong className="text-slate-200">{activeClasse?.nom}</strong>
              </p>
            </div>

            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les notes</span>
            </button>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-3">N°</th>
                  <th className="py-3 px-3">Matricule</th>
                  <th className="py-3 px-3">Nom complet de l'élève</th>
                  <th className="py-3 px-3 text-center">Sexe</th>
                  <th className="py-3 px-3 text-center">
                    Note obtenue (/{activeEval.maxPoints})
                  </th>
                  <th className="py-3 px-3 text-center">Pourcentage</th>
                  <th className="py-3 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {classStudents.map((eleve, index) => {
                  const valStr = gradeInputs[eleve.id] ?? '';
                  const numVal = valStr !== '' ? Number(valStr) : null;
                  const isComplete = numVal !== null && !isNaN(numVal);
                  const pct = isComplete ? ((numVal / activeEval.maxPoints) * 100).toFixed(1) : null;

                  return (
                    <tr key={eleve.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-xs">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-400">
                        {eleve.matricule}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-100">
                        {eleve.nom} {eleve.postnom} {eleve.prenom}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                          eleve.sexe === 'F' ? 'bg-pink-500/10 text-pink-300' : 'bg-sky-500/10 text-sky-300'
                        }`}>
                          {eleve.sexe}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={activeEval.maxPoints}
                            step="0.5"
                            value={valStr}
                            onChange={(e) => handleGradeChange(eleve.id, e.target.value)}
                            placeholder="Points"
                            className="w-24 text-center py-1.5 px-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                          />
                          <span className="text-xs text-slate-500">/{activeEval.maxPoints}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {pct ? (
                          <span className={`${Number(pct) >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {pct} %
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isComplete ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Noté
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Manquante
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-amber-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Aucune évaluation sélectionnée</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Sélectionnez une évaluation ci-dessus ou créez-en une nouvelle (interrogation, devoir, TP, examen) pour commencer la saisie des points.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Créer la première évaluation
          </button>
        </div>
      )}

      {/* Modal: Créer une évaluation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-heading">
                Nouvelle Évaluation
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvalSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Intitulé de l'évaluation
                </label>
                <input
                  type="text"
                  required
                  value={newEvalTitle}
                  onChange={(e) => setNewEvalTitle(e.target.value)}
                  placeholder="ex: Interrogation n°2 : Géométrie analytique"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Note maximale (sur combien)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    required
                    value={newEvalMax}
                    onChange={(e) => setNewEvalMax(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Coefficient (Pondération)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newEvalCoef}
                    onChange={(e) => setNewEvalCoef(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Date de passation
                </label>
                <input
                  type="date"
                  required
                  value={newEvalDate}
                  onChange={(e) => setNewEvalDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition"
                >
                  Créer et ouvrir la grille
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
