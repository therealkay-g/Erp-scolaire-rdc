import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  GraduationCap, 
  DollarSign, 
  CheckCircle2, 
  FileText, 
  Clock, 
  ArrowUpRight,
  ShieldAlert,
  Layers,
  Award
} from 'lucide-react';
import { NavModule } from '../layout/Sidebar';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';

interface PrefetDashboardProps {
  onNavigate: (module: NavModule) => void;
}

export const PrefetDashboard: React.FC<PrefetDashboardProps> = ({ onNavigate }) => {
  const { 
    currentSchool, 
    classes, 
    eleves, 
    presences, 
    getSchoolFinancialSummary, 
    formatCDF, 
    formatUSD, 
    getSchoolTop10,
    schools 
  } = useApp();

  const activeEleves = eleves.filter(e => e.statut === 'actif');
  const garconsCount = activeEleves.filter(e => e.sexe === 'M').length;
  const fillesCount = activeEleves.filter(e => e.sexe === 'F').length;

  // Absenteeism calculation
  const totalPresencesRecorded = presences.length;
  const totalAbsents = presences.filter(p => p.statut === 'absent').length;
  const tauxAbsenteisme = totalPresencesRecorded > 0 
    ? Number(((totalAbsents / totalPresencesRecorded) * 100).toFixed(1)) 
    : 0.0;

  // Financial summary
  const finance = getSchoolFinancialSummary();

  // Top 3 Students snapshot
  const top10 = getSchoolTop10('P1');
  const top3 = top10.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              Direction Générale • Tableau de Bord Décisionnel
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
              {currentSchool?.nom || 'ERP Éducatif RDC'}
            </h1>
            <p className="text-sm text-slate-300">
              {schools.length === 0 ? (
                <span className="text-amber-300">Base de données initialisée à zéro. Super Administrateur <strong>Kay Nzogu</strong> actif. (Taux officiel : 1 $ = 2.500 FC)</span>
              ) : (
                <>Devise : <span className="italic text-amber-200">« {currentSchool?.devise} »</span> • Année Académique {currentSchool?.anneeAcademique} • 1 $ = {currentSchool?.tauxUsdCdf?.toLocaleString() || '2.500'} FC</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('bulletins')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Générer les Bulletins
            </button>
            <button
              onClick={() => onNavigate('finances')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Suivi Recouvrement
            </button>
          </div>
        </div>
      </div>

      {/* The 3 Core Required KPIs from PRD Section 10 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Effectifs par classe & Total */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-slate-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Effectif Total
            </span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
              {activeEleves.length}
            </span>
            <span className="text-xs text-slate-400">élèves inscrits</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Garçons : <strong className="text-slate-200">{garconsCount}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              Filles : <strong className="text-slate-200">{fillesCount}</strong>
            </span>
            <span className="text-slate-300 font-medium">
              {classes.length} classes
            </span>
          </div>
        </div>

        {/* 2. Taux de recouvrement du minerval */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Recouvrement Minerval
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-amber-300 tracking-tight font-heading">
              {finance.tauxRecouvrement.toFixed(1)} %
            </span>
            <span className="text-xs text-slate-400">du montant attendu</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium truncate">
              {formatCDF(finance.totalRecouvreCDF)}
            </span>
            <span className="text-slate-400 text-[11px]">
              (~{formatUSD(finance.totalRecouvreCDF / currentSchool.tauxUsdCdf)})
            </span>
          </div>
        </div>

        {/* 3. Taux d'absentéisme */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              Taux d'Absentéisme
            </span>
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-rose-400 tracking-tight font-heading">
              {tauxAbsenteisme} %
            </span>
            <span className="text-xs text-slate-400">moyenne des absences</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Assiduité : <strong className="text-slate-200">{(100 - tauxAbsenteisme).toFixed(1)} %</strong>
            </span>
            <span className="text-slate-400">
              {totalAbsents} absence(s) notée(s)
            </span>
          </div>
        </div>
      </div>

      {/* Graphique Recharts: Évolution du taux d'absentéisme sur la semaine en cours */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-heading">
                Évolution du Taux d'Absentéisme — Semaine en cours
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Visualisation journalière du lundi au samedi (Semaine académique 44) avec seuil d'alerte ministériel (5%)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-slate-400">Moyenne hebdo :</span>
              <strong className="text-rose-300 font-bold">3.0 %</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">Pic d'assiduité :</span>
              <strong className="text-emerald-300 font-bold">Samedi (98.2%)</strong>
            </div>
            <button
              onClick={() => onNavigate('presences')}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold transition flex items-center gap-1"
            >
              Détails présences <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recharts LineChart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { jour: 'Lundi', date: '26 Oct', taux: 2.3, absents: 5, assiduite: 97.7, prevSemaine: 3.1 },
                { jour: 'Mardi', date: '27 Oct', taux: 3.1, absents: 7, assiduite: 96.9, prevSemaine: 3.4 },
                { jour: 'Mercredi', date: '28 Oct', taux: 4.5, absents: 10, assiduite: 95.5, prevSemaine: 4.2 },
                { jour: 'Jeudi', date: '29 Oct', taux: 3.6, absents: 8, assiduite: 96.4, prevSemaine: 3.9 },
                { jour: 'Vendredi', date: '30 Oct', taux: 2.8, absents: 6, assiduite: 97.2, prevSemaine: 3.5 },
                { jour: 'Samedi', date: '31 Oct', taux: 1.8, absents: 4, assiduite: 98.2, prevSemaine: 2.4 },
              ]}
              margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />
              <XAxis 
                dataKey="jour" 
                stroke="#94A3B8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={{ stroke: '#334155' }} 
                domain={[0, 6]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
                        <p className="font-bold text-white font-heading border-b border-slate-800 pb-1.5 flex items-center justify-between">
                          <span>{data.jour} ({data.date})</span>
                          <span className="text-[10px] text-amber-400 font-mono">Semaine en cours</span>
                        </p>
                        <div className="flex items-center justify-between text-rose-400 font-semibold pt-0.5">
                          <span>Taux d'absentéisme :</span>
                          <span className="font-extrabold text-sm">{data.taux} %</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Élèves absents :</span>
                          <span className="font-bold text-slate-100">{data.absents} élèves</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>Assiduité globale :</span>
                          <span className="font-bold">{data.assiduite} %</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                          <span>Semaine préc. :</span>
                          <span>{data.prevSemaine} %</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              <ReferenceLine 
                y={5} 
                stroke="#EF4444" 
                strokeDasharray="4 4" 
                label={{ 
                  value: 'Seuil d’alerte (5.0%)', 
                  fill: '#F87171', 
                  fontSize: 11,
                  position: 'insideTopRight' 
                }} 
              />
              <Line
                name="Taux d'absentéisme actuel (%)"
                type="monotone"
                dataKey="taux"
                stroke="#F43F5E"
                strokeWidth={3}
                dot={{ fill: '#F43F5E', r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 7, fill: '#E11D48', stroke: '#FFE4E6', strokeWidth: 2 }}
              />
              <Line
                name="Semaine précédente (%)"
                type="monotone"
                dataKey="prevSemaine"
                stroke="#64748B"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ fill: '#64748B', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Effectifs détaillés par classe + Top 3 Élite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Classes Headcount Table */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Effectifs et répartition par classe
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Ventilation des effectifs selon les sections et options</p>
            </div>
            <button
              onClick={() => onNavigate('administration')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              Gérer les élèves <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-3">Classe</th>
                  <th className="py-3 px-3">Section / Option</th>
                  <th className="py-3 px-3">Titulaire</th>
                  <th className="py-3 px-3 text-center">Effectif</th>
                  <th className="py-3 px-3 text-right">Statut Notes P1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                      Aucune classe configurée pour le moment. Créez un établissement ou enregistrez des classes dans le module Pédagogie / Administration.
                    </td>
                  </tr>
                ) : (
                  classes.map((cls) => {
                    const classStudents = activeEleves.filter(e => e.classeId === cls.id);
                    const isComplete = cls.id === 'cls_3sc'; // Sample state

                    return (
                      <tr key={cls.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-3 font-semibold text-slate-200">
                          {cls.nom}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-xs">
                          {cls.section} • {cls.option}
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-xs">
                          {cls.titulaireNom}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700">
                            {classStudents.length || cls.effectif}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isComplete ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Complet
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                              En cours
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 3 Élèves de l'École (Top 10 teaser) */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Tableau d'Honneur (P1)
              </h2>
              <button
                onClick={() => onNavigate('bulletins')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Voir Top 10
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Meilleures moyennes calculées sur l'ensemble de l'établissement.
            </p>

            <div className="mt-4 space-y-3">
              {top3.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  Aucune note saisie pour le moment. Dès que les évaluations seront cotées, les meilleures moyennes s'afficheront ici.
                </div>
              ) : (
                top3.map((student, idx) => (
                  <div 
                    key={student.eleve.id} 
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                        idx === 0 
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20' 
                          : idx === 1 
                          ? 'bg-slate-300 text-slate-950' 
                          : 'bg-amber-700/60 text-amber-200'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-100">
                          {student.eleve.nom} {student.eleve.prenom}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {student.classe.nom}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-amber-400 font-heading">
                        {student.pourcentageGlobal}%
                      </span>
                      <p className="text-[10px] text-emerald-400 font-medium">
                        {student.mention.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs flex items-center gap-2">
              <span className="text-base">⚖️</span>
              <span>
                Conformité <strong>Code du Numérique RDC</strong> et protection des dossiers scolaires.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
