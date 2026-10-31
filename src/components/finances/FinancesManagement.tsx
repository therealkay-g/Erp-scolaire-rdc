import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eleve, TrancheFrais, Paiement } from '../../types';
import { PrintableReceiptModal } from './PrintableReceiptModal';
import { 
  CreditCard, 
  Search, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Printer, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Receipt
} from 'lucide-react';

export const FinancesManagement: React.FC = () => {
  const { 
    currentSchool, 
    eleves, 
    tranches, 
    paiements, 
    encaisserPaiement, 
    formatCDF, 
    formatUSD, 
    convertCDFtoUSD, 
    convertUSDtoCDF, 
    getStudentPaymentStatus, 
    getSchoolFinancialSummary,
    classes,
    currentUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEleveId, setSelectedEleveId] = useState<string>(eleves[0]?.id || '');
  
  // Encaissement modal state
  const [showEncaissementModal, setShowEncaissementModal] = useState(false);
  const [activeTranche, setActiveTranche] = useState<TrancheFrais | null>(null);
  const [montantSaisiCDF, setMontantSaisiCDF] = useState<number>(0);
  const [modePaiement, setModePaiement] = useState<'Espèces' | 'Airtel Money' | 'M-Pesa' | 'Orange Money' | 'Bancaire'>('Espèces');
  const [observation, setObservation] = useState('');

  // Printable receipt state
  const [selectedReceipt, setSelectedReceipt] = useState<{ paiement: Paiement; eleve: Eleve; tranche: TrancheFrais } | null>(null);

  // Financial KPIs
  const summary = getSchoolFinancialSummary();

  // Filtered students for search
  const filteredEleves = eleves.filter(e => 
    e.statut === 'actif' && (
      e.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.postnom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.matricule.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const selectedEleve = eleves.find(e => e.id === selectedEleveId);
  const studentStatus = selectedEleve ? getStudentPaymentStatus(selectedEleve.id) : null;
  const selectedEleveClasse = selectedEleve ? classes.find(c => c.id === selectedEleve.classeId) : null;

  const handleOpenEncaissement = (tranche: TrancheFrais, resteCDF: number) => {
    setActiveTranche(tranche);
    setMontantSaisiCDF(resteCDF > 0 ? resteCDF : tranche.montantCDF);
    setObservation('');
    setShowEncaissementModal(true);
  };

  const handleEncaissementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEleve || !activeTranche || montantSaisiCDF <= 0) return;

    const usdEquiv = convertCDFtoUSD(montantSaisiCDF);
    const newP = encaisserPaiement({
      eleveId: selectedEleve.id,
      trancheId: activeTranche.id,
      montantCDF: montantSaisiCDF,
      montantUSD: usdEquiv,
      date: new Date().toISOString().split('T')[0],
      modePaiement,
      comptableNom: currentUser?.nom || 'Mme Madeleine Mbuyi',
      observation: observation.trim() || undefined
    });

    setShowEncaissementModal(false);
    // Automatically offer to view/print receipt
    setSelectedReceipt({
      paiement: newP,
      eleve: selectedEleve,
      tranche: activeTranche
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-1">
            <CreditCard className="w-3.5 h-3.5" />
            Comptabilité & Trésorerie
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Gestion des Frais & Recouvrement
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Encaissement manuel, émission de quittances certifiées et suivi des tranches en Francs Congolais (CDF) et USD.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
          Taux du jour : <strong className="text-amber-400 font-mono">1 USD = {currentSchool?.tauxUsdCdf?.toLocaleString() || '2.500'} FC</strong>
        </div>
      </div>

      {/* Global Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Attendu */}
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Attendu (FC)</p>
          <p className="text-xl sm:text-2xl font-extrabold text-white font-heading mt-2">
            {formatCDF(summary.totalAttenduCDF)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            ~{formatUSD(summary.totalAttenduCDF / (currentSchool?.tauxUsdCdf || 2500))}
          </p>
        </div>

        {/* Total Recouvré */}
        <div className="glass-panel rounded-2xl p-4 border-emerald-500/30 bg-emerald-950/10">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Encaissé / Recouvré</p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-heading mt-2">
            {formatCDF(summary.totalRecouvreCDF)}
          </p>
          <p className="text-[11px] text-emerald-300/80 mt-1">
            ~{formatUSD(summary.totalRecouvreCDF / (currentSchool?.tauxUsdCdf || 2500))}
          </p>
        </div>

        {/* Reste à recouvrer / Impayés */}
        <div className="glass-panel rounded-2xl p-4 border-rose-500/30 bg-rose-950/10">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Total Impayés</p>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-400 font-heading mt-2">
            {formatCDF(summary.totalImpayeCDF)}
          </p>
          <p className="text-[11px] text-rose-300/80 mt-1">
            ~{formatUSD(summary.totalImpayeCDF / (currentSchool?.tauxUsdCdf || 2500))}
          </p>
        </div>

        {/* Taux de recouvrement */}
        <div className="glass-panel rounded-2xl p-4 border-amber-500/30 bg-amber-950/10">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Taux de Recouvrement</p>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-300 font-heading mt-2">
            {summary.tauxRecouvrement.toFixed(1)} %
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, summary.tauxRecouvrement)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Work Area: Student Search + Student Financial Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Student search list */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white font-heading">Rechercher un élève</h2>
            <p className="text-xs text-slate-400 mt-0.5">Par nom, prénom ou numéro de matricule</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ex: Kalonji ou BOK-25-0104"
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredEleves.map((eleve) => {
              const isSelected = selectedEleveId === eleve.id;
              const eleveCls = classes.find(c => c.id === eleve.classeId);
              const status = getStudentPaymentStatus(eleve.id);

              return (
                <button
                  key={eleve.id}
                  onClick={() => setSelectedEleveId(eleve.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-xs sm:text-sm">
                      {eleve.nom} {eleve.postnom} {eleve.prenom}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {eleve.matricule} • {eleveCls?.nom}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      status.resteCDF === 0 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : status.totalPayeCDF > 0 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {status.resteCDF === 0 ? 'En règle' : `${status.pourcentagePaye.toFixed(0)}%`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Student's Detailed Tranches & Payment Ledger */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 space-y-6">
          {selectedEleve && studentStatus ? (
            <>
              {/* Student Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                    <img src={selectedEleve.photoUrl} alt={selectedEleve.nom} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-heading">
                      {selectedEleve.nom} {selectedEleve.postnom} {selectedEleve.prenom}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Matricule : <span className="text-slate-200 font-mono">{selectedEleve.matricule}</span> • Classe : <span className="text-slate-200 font-semibold">{selectedEleveClasse?.nom}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Solde restant dû :</span>
                  <p className="text-lg font-extrabold text-amber-400 font-heading">
                    {formatCDF(studentStatus.resteCDF)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    (~{formatUSD(studentStatus.resteCDF / currentSchool.tauxUsdCdf)})
                  </p>
                </div>
              </div>

              {/* Tranches Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tranches scolaires de l'année ({currentSchool.anneeAcademique})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {studentStatus.tranchesDetails.map(({ tranche, payeCDF, resteCDF, statut }) => (
                    <div
                      key={tranche.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3 relative overflow-hidden"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            statut === 'Payée' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : statut === 'Partielle' 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {statut}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Échéance : {tranche.dateLimite}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white mt-2">{tranche.nom}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tranche.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Montant total :</span>
                          <span className="font-semibold text-slate-200">{formatCDF(tranche.montantCDF)}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-3">
                          <span className="text-slate-400">Payé à ce jour :</span>
                          <span className="font-bold text-emerald-400">{formatCDF(payeCDF)}</span>
                        </div>

                        {resteCDF > 0 ? (
                          <button
                            onClick={() => handleOpenEncaissement(tranche, resteCDF)}
                            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Encaisser ({formatCDF(resteCDF)})</span>
                          </button>
                        ) : (
                          <div className="py-1.5 text-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            ✓ Soldée intégralement
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Payment History Table */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Historique des quittances émises pour cet élève
                </h3>

                {paiements.filter(p => p.eleveId === selectedEleve.id).length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3">Aucun versement enregistré pour le moment.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                          <th className="py-2.5 px-3">N° Quittance</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Tranche</th>
                          <th className="py-2.5 px-3">Mode</th>
                          <th className="py-2.5 px-3 text-right">Montant CDF</th>
                          <th className="py-2.5 px-3 text-right">Équiv. USD</th>
                          <th className="py-2.5 px-3 text-right">Reçu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {paiements.filter(p => p.eleveId === selectedEleve.id).map(p => {
                          const t = tranches.find(tr => tr.id === p.trancheId);
                          return (
                            <tr key={p.id} className="hover:bg-slate-900/40">
                              <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                                {p.recuNumero}
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">{p.date}</td>
                              <td className="py-2.5 px-3 text-slate-300">{t?.nom.split(':')[0]}</td>
                              <td className="py-2.5 px-3 text-slate-300">{p.modePaiement}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                                {formatCDF(p.montantCDF)}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-400">
                                {formatUSD(p.montantUSD)}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => t && setSelectedReceipt({ paiement: p, eleve: selectedEleve, tranche: t })}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition inline-flex items-center gap-1 font-medium"
                                >
                                  <Printer className="w-3 h-3 text-amber-400" />
                                  <span>Reçu</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400">
              Veuillez sélectionner un élève dans la liste de gauche.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Encaisser un paiement */}
      {showEncaissementModal && activeTranche && selectedEleve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Encaisser une tranche
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeTranche.nom}</p>
              </div>
              <button
                onClick={() => setShowEncaissementModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEncaissementSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Élève bénéficiaire
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  <p className="font-bold">{selectedEleve.nom} {selectedEleve.postnom} {selectedEleve.prenom}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedEleve.matricule} • {selectedEleveClasse?.nom}</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Montant en Francs Congolais (CDF)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  required
                  value={montantSaisiCDF}
                  onChange={(e) => setMontantSaisiCDF(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Équivalent en dollars :</span>
                  <strong className="text-slate-200">{formatUSD(convertCDFtoUSD(montantSaisiCDF))}</strong>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Mode de règlement
                </label>
                <select
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Espèces">Espèces (Guichet de la caisse)</option>
                  <option value="M-Pesa">Vodacom M-Pesa</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Bancaire">Virement bancaire (Rawbank / EquityBCDC)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Observations / Remarques (Optionnel)
                </label>
                <input
                  type="text"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="ex: Versement partiel par le tuteur"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEncaissementModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Valider & Générer Quittance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <PrintableReceiptModal
          paiement={selectedReceipt.paiement}
          eleve={selectedReceipt.eleve}
          tranche={selectedReceipt.tranche}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
