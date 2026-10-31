import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Periode, BulletinModel } from '../../types';
import { StudentReportCard } from '../../context/AppContext';
import { OfficialBulletinModal } from './OfficialBulletinModal';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertOctagon, 
  Award, 
  Printer, 
  Eye, 
  Lock, 
  Sparkles,
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';

export const BulletinsManagement: React.FC = () => {
  const { 
    classes, 
    bulletinModels, 
    importBulletinModel, 
    checkMissingNotesForClass, 
    generateClassReportCards, 
    getSchoolTop10 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'generation' | 'modeles' | 'top10'>('generation');
  const [selectedClasseId, setSelectedClasseId] = useState<string>(classes[0]?.id || '');
  const [selectedPeriode, setSelectedPeriode] = useState<Periode>('P1');

  // Preview / Full Modal for an individual student's report card
  const [selectedStudentReport, setSelectedStudentReport] = useState<StudentReportCard | null>(null);

  // Template import state
  const [importClasseId, setImportClasseId] = useState<string>(classes[0]?.id || '');
  const [importPeriode, setImportPeriode] = useState<Periode>('P1');
  const [importFileName, setImportFileName] = useState<string>('');
  const [importFileType, setImportFileType] = useState<'excel' | 'word' | 'pdf'>('excel');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const selectedClasse = classes.find(c => c.id === selectedClasseId);

  // Check missing notes (Absolute Blocking criteria according to PRD section 6)
  const missingCheck = checkMissingNotesForClass(selectedClasseId, selectedPeriode);

  // Generate report cards if complete
  const reportCards = generateClassReportCards(selectedClasseId, selectedPeriode);

  // Top 10 across the entire school
  const schoolTop10 = getSchoolTop10(selectedPeriode);

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportFileName(file.name);
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setImportFileType('excel');
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        setImportFileType('word');
      } else {
        setImportFileType('pdf');
      }
    }
  };

  const handleValidateTemplate = () => {
    if (!importFileName) return;
    setIsUploading(true);
    setTimeout(() => {
      const targetCls = classes.find(c => c.id === importClasseId);
      importBulletinModel({
        classeId: importClasseId,
        option: targetCls?.option || 'Générale',
        periode: importPeriode,
        fileName: importFileName,
        fileType: importFileType,
        tailleFichier: '64 Ko'
      });
      setIsUploading(false);
      setImportFileName('');
      setActiveTab('generation');
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-1">
            <Award className="w-3.5 h-3.5" />
            Palmarès & Bulletins Officiels
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Génération des Bulletins & Palmarès
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Contrôle d'intégrité strict : blocage absolu si notes manquantes, calculs normalisés RDC et Top 10 scolaire.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-700/80 rounded-2xl">
          <button
            onClick={() => setActiveTab('generation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'generation'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Génération
          </button>
          <button
            onClick={() => setActiveTab('modeles')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'modeles'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Modèles de Bulletins
          </button>
          <button
            onClick={() => setActiveTab('top10')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'top10'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-amber-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Top 10 École
          </button>
        </div>
      </div>

      {/* --- TAB 1: GENERATION DES BULLETINS --- */}
      {activeTab === 'generation' && (
        <div className="space-y-6">
          {/* Class and Period Filters */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Sélectionner la classe
              </label>
              <select
                value={selectedClasseId}
                onChange={(e) => setSelectedClasseId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.section} - {c.option})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Période à clôturer
              </label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value as Periode)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="P1">1ère Période (1er Semestre)</option>
                <option value="P2">2ème Période (1er Semestre)</option>
                <option value="EXAM_S1">Examen Semestre 1</option>
                <option value="P3">3ème Période (2ème Semestre)</option>
                <option value="P4">4ème Période (2ème Semestre)</option>
                <option value="EXAM_S2">Examen Semestre 2</option>
              </select>
            </div>
          </div>

          {/* ABSOLUTE BLOCKING CHECK (PRD SECTION 6) */}
          {missingCheck.hasMissing ? (
            <div className="rounded-3xl border-2 border-rose-500/60 bg-rose-950/30 p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider mb-1">
                    <Lock className="w-3 h-3" />
                    Blocage Absolu de Période
                  </div>
                  <h3 className="text-xl font-extrabold text-white font-heading">
                    Génération des bulletins impossible : Notes manquantes
                  </h3>
                  <p className="text-xs sm:text-sm text-rose-200 mt-1 max-w-2xl leading-relaxed">
                    Conformément aux directives de l'EPST et aux règles de gestion de l'ERP, aucun bulletin ne peut être délivré tant que l'ensemble des cotes de la période n'a pas été transcrit pour chaque élève.
                  </p>
                </div>
              </div>

              {/* List of Missing Grades */}
              <div className="mt-4 pt-4 border-t border-rose-500/30 space-y-2">
                <p className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Détail des {missingCheck.totalMissing} note(s) manquante(s) :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {missingCheck.details.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/30 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{item.eleveNom}</span>
                      <span className="text-rose-400 text-[11px] font-mono">{item.matiereNom}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ALL COMPLETE: PROCEED TO GENERATION */
            <div className="space-y-6">
              {/* Ready Banner */}
              <div className="rounded-3xl border border-emerald-500/40 bg-emerald-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-heading">
                      Intégrité des notes vérifiée : 100% des cotes encodées
                    </h3>
                    <p className="text-xs text-emerald-200">
                      Tous les cours de <strong>{selectedClasse?.nom}</strong> sont prêts pour l'impression des bulletins officiels.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (reportCards.length > 0) setSelectedStudentReport(reportCards[0]);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Aperçu d'un bulletin</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer la classe</span>
                  </button>
                </div>
              </div>

              {/* Class Palmarès Table with Instant Report Card trigger */}
              <div className="glass-panel rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-white font-heading">
                      Palmarès officiel de la classe — {selectedClasse?.nom}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Classement établi sur la moyenne simple des pourcentages par cours
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                    {reportCards.length} bulletins générés
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-3 px-3 text-center">Rang</th>
                        <th className="py-3 px-3">Matricule</th>
                        <th className="py-3 px-3">Nom et Prénom</th>
                        <th className="py-3 px-3 text-center">Total Obtenu</th>
                        <th className="py-3 px-3 text-center">Pourcentage</th>
                        <th className="py-3 px-3 text-center">Mention</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {reportCards.map((rc) => (
                        <tr key={rc.eleve.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-3 px-3 text-center font-bold">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                              rc.rang === 1 
                                ? 'bg-amber-400 text-slate-950 font-extrabold' 
                                : rc.rang === 2 
                                ? 'bg-slate-300 text-slate-950 font-bold' 
                                : rc.rang === 3 
                                ? 'bg-amber-700 text-amber-100 font-bold' 
                                : 'text-slate-400 bg-slate-800'
                            }`}>
                              #{rc.rang}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-slate-400">
                            {rc.eleve.matricule}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-100">
                            {rc.eleve.nom} {rc.eleve.postnom} {rc.eleve.prenom}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                            {rc.totalObtenu} / {rc.totalMax}
                          </td>
                          <td className="py-3 px-3 text-center font-extrabold text-amber-300 text-sm font-heading">
                            {rc.pourcentageGlobal} %
                          </td>
                          <td className="py-3 px-3 text-center text-xs">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                              {rc.mention.split(' ')[0]}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSelectedStudentReport(rc)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Voir Bulletin</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: IMPORT DU MODÈLE DE BULLETIN (PRD SECTION 6) --- */}
      {activeTab === 'modeles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload card */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                Importer une maquette / modèle
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Importez un fichier Excel, Word ou PDF pré-formaté avec la grille des cours, les en-têtes et le canevas de l'école (sans noms ni notes).
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Associer à la classe
                </label>
                <select
                  value={importClasseId}
                  onChange={(e) => setImportClasseId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nom} ({c.section})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Période cible
                </label>
                <select
                  value={importPeriode}
                  onChange={(e) => setImportPeriode(e.target.value as Periode)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="P1">1ère Période</option>
                  <option value="P2">2ème Période</option>
                  <option value="EXAM_S1">Examen Semestre 1</option>
                  <option value="P3">3ème Période</option>
                  <option value="P4">4ème Période</option>
                  <option value="EXAM_S2">Examen Semestre 2</option>
                </select>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-2xl p-6 text-center transition bg-slate-950/40">
                <input
                  type="file"
                  id="template-upload"
                  accept=".xlsx,.xls,.docx,.pdf"
                  onChange={handleSimulatedFileUpload}
                  className="hidden"
                />
                <label htmlFor="template-upload" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-amber-400 hover:underline">
                      Cliquez pour sélectionner un modèle
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Formats supportés : Excel (.xlsx), Word (.docx), PDF
                    </p>
                  </div>
                </label>

                {importFileName && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-amber-400/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Fichier prêt : {importFileName}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!importFileName || isUploading}
                onClick={handleValidateTemplate}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-40 cursor-pointer"
              >
                {isUploading ? 'Validation du modèle en cours...' : 'Valider et enregistrer le modèle'}
              </button>
            </div>
          </div>

          {/* List of imported templates */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white font-heading">
              Modèles actifs enregistrés ({bulletinModels.length})
            </h2>
            <div className="space-y-3">
              {bulletinModels.map(m => {
                const cls = classes.find(c => c.id === m.classeId);
                return (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-200">{m.fileName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Classe : <strong className="text-slate-300">{cls?.nom}</strong> • {m.periode}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Modèle Validé
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">{m.importedAt}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: TOP 10 SUR TOUTE L'ÉCOLE (PRD SECTION 6) --- */}
      {activeTab === 'top10' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Tableau d'Excellence Éducative
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                Top 10 Élite — Palmarès Général de l'École
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Classement inter-classes des 10 meilleurs élèves de l'établissement pour la {selectedPeriode}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le Palmarès</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-3 text-center">Rang Général</th>
                  <th className="py-3 px-3">Matricule</th>
                  <th className="py-3 px-3">Élève</th>
                  <th className="py-3 px-3">Classe & Section</th>
                  <th className="py-3 px-3 text-center">Total Points</th>
                  <th className="py-3 px-3 text-center">Pourcentage</th>
                  <th className="py-3 px-3 text-center">Distinction</th>
                  <th className="py-3 px-3 text-right">Bulletin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {schoolTop10.map((item) => {
                  const rank = item.ecoleRang;
                  const isTop3 = rank <= 3;

                  return (
                    <tr key={item.eleve.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-3 text-center font-bold">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-heading font-extrabold ${
                          rank === 1 
                            ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 ring-2 ring-amber-300' 
                            : rank === 2 
                            ? 'bg-slate-300 text-slate-950 shadow-md ring-2 ring-slate-200' 
                            : rank === 3 
                            ? 'bg-amber-700 text-amber-100 shadow-md ring-2 ring-amber-600' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          #{rank}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-400">
                        {item.eleve.matricule}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-100 text-sm">
                        {item.eleve.nom} {item.eleve.postnom} {item.eleve.prenom}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-xs">
                        <span className="font-semibold text-white">{item.classe.nom}</span>
                        <span className="block text-[11px] text-slate-500">{item.classe.option}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                        {item.totalObtenu} / {item.totalMax}
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-amber-300 text-base font-heading">
                        {item.pourcentageGlobal} %
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/20 text-xs font-semibold">
                          {item.mention}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedStudentReport(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Voir</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Bulletin Modal if selected */}
      {selectedStudentReport && (
        <OfficialBulletinModal
          reportCard={selectedStudentReport}
          onClose={() => setSelectedStudentReport(null)}
        />
      )}
    </div>
  );
};
