import React from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../data/mockData';
import { 
  Users, 
  ShieldCheck, 
  Mail, 
  BookOpen, 
  Layers, 
  Award,
  GraduationCap
} from 'lucide-react';

export const PersonnelManagement: React.FC = () => {
  const { currentSchool, classes, matieres } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            Ressources Humaines & Enseignants
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Corps Administratif & Enseignant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Fiches du personnel, affectations pédagogiques et attributions des cours ({currentSchool.anneeAcademique}).
          </p>
        </div>

        <div className="text-xs text-slate-400 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
          Total Effectif : <strong className="text-slate-200 font-bold">{MOCK_USERS.length} collaborateurs</strong>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_USERS.map((user) => {
          // Find assigned classes and subjects if teacher
          const assignedCls = user.classesAssigned 
            ? classes.filter(c => user.classesAssigned?.includes(c.id)) 
            : [];
          const assignedMat = user.matieresAssigned
            ? matieres.filter(m => user.matieresAssigned?.includes(m.id))
            : [];

          return (
            <div
              key={user.id}
              className="glass-panel rounded-3xl p-6 flex flex-col justify-between hover:border-amber-400/30 transition group"
            >
              <div>
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/80">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                    <img src={user.avatarUrl} alt={user.nom} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white truncate font-heading group-hover:text-amber-300 transition">
                      {user.nom}
                    </h3>
                    <p className="text-xs font-semibold text-amber-400/90 truncate">
                      {user.roleLabel}
                    </p>
                  </div>
                </div>

                <div className="py-4 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Rôle système : <strong className="text-slate-200 font-mono text-[11px]">{user.role}</strong></span>
                  </div>

                  {user.role === 'enseignant' && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2">
                      <p className="text-[11px] uppercase font-bold text-slate-400">Classes affectées :</p>
                      <div className="flex flex-wrap gap-1.5">
                        {assignedCls.map(c => (
                          <span key={c.id} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-700">
                            {c.nom.split(' ')[0]} {c.nom.split(' ')[1]}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] uppercase font-bold text-slate-400 mt-2">Matières dispensées :</p>
                      <div className="flex flex-wrap gap-1.5">
                        {assignedMat.map(m => (
                          <span key={m.id} className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-500/20">
                            {m.nom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Compte Actif
                </span>
                <span className="text-slate-500 font-mono">ID: {user.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
