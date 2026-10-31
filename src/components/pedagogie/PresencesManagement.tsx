import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CalendarCheck, 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  Save, 
  Users, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Presence } from '../../types';

export const PresencesManagement: React.FC = () => {
  const { 
    classes, 
    matieres, 
    eleves, 
    presences, 
    savePresences, 
    currentUser, 
    isOffline 
  } = useApp();

  const isSurveillantOrDiscipline = currentUser?.role === 'surveillant' || currentUser?.role === 'directeur_discipline' || currentUser?.role === 'prefet';

  const [selectedClasseId, setSelectedClasseId] = useState<string>(classes[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState<'demi_journee' | 'seance'>(isSurveillantOrDiscipline ? 'demi_journee' : 'seance');
  const [demiJournee, setDemiJournee] = useState<'matin' | 'apres_midi'>('matin');
  const [selectedMatiereId, setSelectedMatiereId] = useState<string>('');

  const classStudents = eleves.filter(e => e.classeId === selectedClasseId && e.statut === 'actif');
  const classMatieres = matieres.filter(m => m.classeId === selectedClasseId);

  // Status mapping for current selection
  const [statusMap, setStatusMap] = useState<Record<string, 'present' | 'absent' | 'justifie' | 'retard'>>({});

  // Initialize or reload statuses when filters change
  React.useEffect(() => {
    const map: Record<string, 'present' | 'absent' | 'justifie' | 'retard'> = {};
    classStudents.forEach(e => {
      // Find existing presence
      const existing = presences.find(p => 
        p.eleveId === e.id && 
        p.date === date && 
        p.type === mode &&
        (mode === 'demi_journee' ? p.demiJournee === demiJournee : p.matiereId === selectedMatiereId)
      );
      map[e.id] = existing ? existing.statut : 'present';
    });
    setStatusMap(map);
  }, [selectedClasseId, date, mode, demiJournee, selectedMatiereId, presences]);

  const handleSetAll = (statut: 'present' | 'absent') => {
    const newMap: Record<string, 'present' | 'absent' | 'justifie' | 'retard'> = {};
    classStudents.forEach(e => {
      newMap[e.id] = statut;
    });
    setStatusMap(newMap);
  };

  const handleToggleStatus = (eleveId: string, st: 'present' | 'absent' | 'justifie' | 'retard') => {
    setStatusMap(prev => ({ ...prev, [eleveId]: st }));
  };

  const handleSave = () => {
    const items: Omit<Presence, 'id' | 'schoolId' | 'synced'>[] = classStudents.map(e => ({
      classeId: selectedClasseId,
      eleveId: e.id,
      date,
      type: mode,
      demiJournee: mode === 'demi_journee' ? demiJournee : undefined,
      matiereId: mode === 'seance' ? (selectedMatiereId || classMatieres[0]?.id) : undefined,
      statut: statusMap[e.id] || 'present',
      saisiPar: currentUser?.nom || 'Surveillant'
    }));

    savePresences(items);
  };

  const presentCount = Object.values(statusMap).filter(s => s === 'present').length;
  const absentCount = Object.values(statusMap).filter(s => s === 'absent').length;
  const retardCount = Object.values(statusMap).filter(s => s === 'retard').length;
  const justifieCount = Object.values(statusMap).filter(s => s === 'justifie').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-1">
            <CalendarCheck className="w-3.5 h-3.5" />
            Vie Scolaire & Discipline
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Cahier de Présences & Assiduité
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {isSurveillantOrDiscipline 
              ? 'Pointage de la présence par demi-journée (Surveillant Général / Discipline)'
              : 'Appel par séance et par cours (Enseignant titulaire)'
            }
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer l'appel</span>
        </button>
      </div>

      {/* Mode & Filters Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Class */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Classe
          </label>
          <select
            value={selectedClasseId}
            onChange={(e) => setSelectedClasseId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Date du jour
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Type / Mode */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Type d'appel
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'demi_journee' | 'seance')}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="demi_journee">Surveillant (Par demi-journée)</option>
            <option value="seance">Enseignant (Par séance de cours)</option>
          </select>
        </div>

        {/* Context: Demi-journée or Subject */}
        <div>
          {mode === 'demi_journee' ? (
            <>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Créneau
              </label>
              <select
                value={demiJournee}
                onChange={(e) => setDemiJournee(e.target.value as 'matin' | 'apres_midi')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="matin">Matinée (07h30 - 12h30)</option>
                <option value="apres_midi">Après-midi (13h00 - 17h00)</option>
              </select>
            </>
          ) : (
            <>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Cours dispensé
              </label>
              <select
                value={selectedMatiereId}
                onChange={(e) => setSelectedMatiereId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {classMatieres.map(m => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Quick Summary Counts & Bulk Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Présents : {presentCount}
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Absents : {absentCount}
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Retards : {retardCount}
          </span>
          <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            Justifiés : {justifieCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSetAll('present')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
          >
            Tous Présents
          </button>
          <button
            onClick={() => handleSetAll('absent')}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition cursor-pointer"
          >
            Tous Absents
          </button>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-3">N°</th>
                <th className="py-3 px-3">Matricule</th>
                <th className="py-3 px-3">Élève</th>
                <th className="py-3 px-3 text-center">Pointage de l'appel</th>
                <th className="py-3 px-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {classStudents.map((eleve, idx) => {
                const currentStatut = statusMap[eleve.id] || 'present';

                return (
                  <tr key={eleve.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-3 text-slate-400 font-mono text-xs">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-400">
                      {eleve.matricule}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-100">
                      {eleve.nom} {eleve.postnom} {eleve.prenom}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(eleve.id, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            currentStatut === 'present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(eleve.id, 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            currentStatut === 'absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(eleve.id, 'retard')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            currentStatut === 'retard'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Retard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(eleve.id, 'justifie')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            currentStatut === 'justifie'
                              ? 'bg-sky-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Justifié
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {currentStatut === 'present' && (
                        <span className="text-emerald-400 font-semibold text-xs">À l'heure</span>
                      )}
                      {currentStatut === 'absent' && (
                        <span className="text-rose-400 font-semibold text-xs">Non motivé</span>
                      )}
                      {currentStatut === 'retard' && (
                        <span className="text-amber-400 font-semibold text-xs">Signalé</span>
                      )}
                      {currentStatut === 'justifie' && (
                        <span className="text-sky-400 font-semibold text-xs">Motif médical/famille</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
