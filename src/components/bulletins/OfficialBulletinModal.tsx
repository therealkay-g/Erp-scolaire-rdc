import React from 'react';
import { useApp } from '../../context/AppContext';
import { StudentReportCard } from '../../context/AppContext';
import { Printer, Download, X, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OfficialBulletinModalProps {
  reportCard: StudentReportCard;
  onClose: () => void;
}

export const OfficialBulletinModal: React.FC<OfficialBulletinModalProps> = ({ reportCard, onClose }) => {
  const { currentSchool } = useApp();
  const { eleve, classe, periode, cours, totalObtenu, totalMax, pourcentageGlobal, rang, totalElevesClasse, mention } = reportCard;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 border border-slate-300 printable-area">
        {/* Action Bar (hidden in print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Bulletin Scolaire Officiel — RDC EPST
              </h2>
              <p className="text-xs text-slate-500">
                Généré selon la maquette nationale de l'Enseignement Primaire, Secondaire et Technique
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Exporter PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- OFFICIAL BULLETIN HEADER (RDC NATIONAL FORMAT) --- */}
        <div className="border-2 border-slate-900 p-4 sm:p-6 rounded-2xl bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-900 pb-4 text-center sm:text-left">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-[11px] font-bold tracking-widest uppercase text-slate-800">
                RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
              </p>
              <p className="text-[10px] font-semibold tracking-wider text-slate-600">
                MINISTÈRE DE L'ENSEIGNEMENT PRIMAIRE, SECONDAIRE ET TECHNIQUE (EPST)
              </p>
              <p className="text-xs font-bold text-slate-800">
                PROVINCE ÉDUCATIONNELLE : {currentSchool.province.toUpperCase()}
              </p>
              <h1 className="text-lg font-extrabold text-slate-900 mt-1 uppercase font-heading">
                {currentSchool.nom}
              </h1>
              <p className="text-[10px] italic text-slate-600 font-serif">
                « {currentSchool.devise} » — {currentSchool.typeEnseignement}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-xl border border-slate-400 overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                {currentSchool.logoUrl ? (
                  <img src={currentSchool.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-bold text-slate-500">LOGO</span>
                )}
              </div>
              <span className="text-[9px] font-mono mt-1 text-slate-500">{currentSchool.code}</span>
            </div>
          </div>

          {/* Bulletin Title & Period Banner */}
          <div className="bg-slate-100 border-b border-slate-300 py-2 px-3 text-center my-3 rounded-lg">
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-wider text-slate-900 uppercase">
              BULLETIN DE LA {periode === 'P1' ? '1ère PÉRIODE' : periode === 'P2' ? '2ème PÉRIODE' : periode} • ANNÉE SCOLAIRE {currentSchool.anneeAcademique}
            </span>
          </div>

          {/* Student Identifiers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-slate-300 p-3 rounded-xl bg-slate-50/50 mb-4">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Nom & Postnom :</span>
              <strong className="text-slate-900 font-heading">{eleve.nom} {eleve.postnom}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Prénom :</span>
              <strong className="text-slate-900">{eleve.prenom}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Matricule :</span>
              <strong className="text-slate-900 font-mono">{eleve.matricule}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Sexe / Né(e) le :</span>
              <strong className="text-slate-900">{eleve.sexe} • {eleve.dateNaissance}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Classe :</span>
              <strong className="text-slate-900">{classe.nom}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Section :</span>
              <strong className="text-slate-900">{classe.section}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Option :</span>
              <strong className="text-slate-900">{classe.option}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Titulaire :</span>
              <strong className="text-slate-900">{classe.titulaireNom}</strong>
            </div>
          </div>

          {/* Core Table of Marks & Percentages */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-400 text-xs">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400 text-center">
                  <th className="py-2 px-3 text-left border-r border-slate-300">Branches / Cours</th>
                  <th className="py-2 px-2 border-r border-slate-300 w-16">Maxima</th>
                  <th className="py-2 px-2 border-r border-slate-300 w-24">Points Obtenus</th>
                  <th className="py-2 px-2 border-r border-slate-300 w-20">Pourcentage</th>
                  <th className="py-2 px-2 border-r border-slate-300 w-24">Appréciation</th>
                  <th className="py-2 px-2 w-28">Signature Prof.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {cours.map((c) => {
                  const isSuccess = (c.pourcentage || 0) >= 50;

                  return (
                    <tr key={c.matiereId} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800 border-r border-slate-300">
                        {c.matiereNom}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-slate-700 border-r border-slate-300">
                        {c.maxima}
                      </td>
                      <td className="py-2 px-2 text-center font-extrabold text-slate-900 border-r border-slate-300">
                        {c.noteObtenue !== null ? c.noteObtenue : '-'}
                      </td>
                      <td className={`py-2 px-2 text-center font-bold border-r border-slate-300 ${isSuccess ? 'text-slate-900' : 'text-red-600'}`}>
                        {c.pourcentage !== null ? `${c.pourcentage} %` : '-'}
                      </td>
                      <td className="py-2 px-2 text-center text-[11px] border-r border-slate-300 italic text-slate-600">
                        {c.pourcentage && c.pourcentage >= 80 ? 'Très Bien' : c.pourcentage && c.pourcentage >= 60 ? 'Bien' : c.pourcentage && c.pourcentage >= 50 ? 'Passable' : 'À travailler'}
                      </td>
                      <td className="py-2 px-2 text-center text-[10px] text-slate-400 font-serif italic">
                        Paraphé
                      </td>
                    </tr>
                  );
                })}

                {/* Totals and Global Results Row */}
                <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-900 text-slate-900">
                  <td className="py-3 px-3 uppercase border-r border-slate-300 font-heading">
                    TOTAL GÉNÉRAL
                  </td>
                  <td className="py-3 px-2 text-center border-r border-slate-300 font-heading">
                    {totalMax}
                  </td>
                  <td className="py-3 px-2 text-center text-sm font-heading border-r border-slate-300">
                    {totalObtenu}
                  </td>
                  <td className="py-3 px-2 text-center text-sm font-heading border-r border-slate-300 text-indigo-900">
                    {pourcentageGlobal} %
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-center text-xs">
                    Application : <span className="text-emerald-700 font-bold">Très Bonne</span> • Conduite : <span className="text-emerald-700 font-bold">Exemplaire</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Decision & Honors Banner */}
          <div className="mt-4 p-4 rounded-xl border-2 border-slate-800 bg-amber-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-heading font-extrabold flex items-center justify-center text-lg shadow-sm">
                #{rang}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase">Classement en {classe.nom} :</p>
                <p className="text-sm font-extrabold text-slate-950">
                  Classé(e) <strong>{rang}</strong><sup>{rang === 1 ? 'er' : 'ème'}</sup> sur {totalElevesClasse} élèves
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-xs font-bold text-slate-600 uppercase">Mention officielle :</p>
              <p className="text-base font-extrabold text-amber-700 font-heading">
                {mention}
              </p>
            </div>
          </div>

          {/* Official Signatures & Seal Block */}
          <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="font-bold text-slate-800 mb-12">Le Titulaire de Classe</p>
              <p className="text-[11px] text-slate-600 font-serif italic">{classe.titulaireNom}</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 mb-12">Le Directeur des Études</p>
              <p className="text-[11px] text-slate-600 font-serif italic">Dr. Marcel Kabongo Mukendi</p>
            </div>
            <div className="relative">
              <p className="font-bold text-slate-800 mb-12">Le Préfet des Études</p>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-dashed border-red-500/60 flex items-center justify-center text-[9px] font-bold text-red-500/80 -rotate-12 pointer-events-none uppercase">
                Sceau École
              </div>
              <p className="text-[11px] text-slate-600 font-serif italic">Prof. Augustin Kalonji</p>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-400">
            Document officiel généré par le Système ERP Éducatif RDC — Fait à {currentSchool.ville}, le {new Date().toLocaleDateString('fr-CD')}
          </div>
        </div>
      </div>
    </div>
  );
};
