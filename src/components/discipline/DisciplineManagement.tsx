import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sanction } from '../../types';
import { 
  ShieldAlert, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  User, 
  FileWarning 
} from 'lucide-react';

export const DisciplineManagement: React.FC = () => {
  const { sanctions, eleves, classes, addSanction, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [eleveId, setEleveId] = useState(eleves[0]?.id || '');
  const [type, setType] = useState<Sanction['type']>('Avertissement');
  const [motif, setMotif] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dureeJours, setDureeJours] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motif.trim()) return;

    addSanction({
      eleveId,
      type,
      motif,
      date,
      decisionPar: currentUser?.nom || 'Directeur de Discipline',
      dureeJours: type === 'Exclusion temporaire' || type === 'Retenue' ? dureeJours : undefined
    });

    setMotif('');
    setShowModal(false);
  };

  const activeEleves = eleves.filter(e => e.statut === 'actif');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Direction de Discipline & Vie Scolaire
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Incidents, Sanctions & Suivi Disciplinaire
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tenue du registre disciplinaire, notification des manquements au règlement d'ordre intérieur (ROI).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Prononcer une sanction</span>
        </button>
      </div>

      {/* Sanctions List */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Élève sanctionné</th>
                <th className="py-3 px-3">Classe</th>
                <th className="py-3 px-3">Type de Sanction</th>
                <th className="py-3 px-3">Motif du manquement</th>
                <th className="py-3 px-3">Décision prononcée par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sanctions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                    Aucune sanction enregistrée dans l'établissement.
                  </td>
                </tr>
              ) : (
                sanctions.map((s) => {
                  const student = eleves.find(e => e.id === s.eleveId);
                  const cls = student ? classes.find(c => c.id === student.classeId) : null;

                  return (
                    <tr key={s.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-3 text-slate-400 font-mono text-xs">{s.date}</td>
                      <td className="py-3 px-3 font-semibold text-slate-100">
                        {student ? `${student.nom} ${student.prenom}` : 'Élève inconnu'}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-xs">{cls?.nom}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          s.type === 'Exclusion temporaire' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : s.type === 'Blâme' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {s.type} {s.dureeJours ? `(${s.dureeJours} j)` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs">{s.motif}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs">{s.decisionPar}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Prononcer une sanction */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-heading">
                Décision Disciplinaire
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Élève concerné
                </label>
                <select
                  value={eleveId}
                  onChange={(e) => setEleveId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-rose-400"
                >
                  {activeEleves.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nom} {e.postnom} {e.prenom} ({e.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nature de la sanction
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-rose-400"
                >
                  <option value="Avertissement">Avertissement écrit</option>
                  <option value="Blâme">Blâme au journal de classe</option>
                  <option value="Retenue">Retenue le samedi</option>
                  <option value="Corvée scolaire">Corvée d'intérêt communautaire</option>
                  <option value="Exclusion temporaire">Exclusion temporaire (Mise à pied)</option>
                </select>
              </div>

              {(type === 'Exclusion temporaire' || type === 'Retenue') && (
                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Durée (Jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={dureeJours}
                    onChange={(e) => setDureeJours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-rose-400"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Motif circonstancié
                </label>
                <textarea
                  rows={3}
                  required
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Décrivez précisément les faits reprochés à l'élève..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md"
                >
                  Enregistrer la sanction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
