import React from 'react';
import { useApp } from '../../context/AppContext';
import { Paiement, Eleve, TrancheFrais } from '../../types';
import { Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PrintableReceiptModalProps {
  paiement: Paiement;
  eleve: Eleve;
  tranche: TrancheFrais;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({ 
  paiement, 
  eleve, 
  tranche, 
  onClose 
}) => {
  const { currentSchool, formatCDF, formatUSD, classes } = useApp();
  const eleveClasse = classes.find(c => c.id === eleve.classeId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 border border-slate-300 printable-area">
        {/* Top Action Bar (hidden in print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Reçu de Caisse Officiel
              </h3>
              <p className="text-xs text-slate-500">
                Quittance N° {paiement.recuNumero} • Comptabilité Scolaire
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le reçu</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- OFFICIAL RECEIPT LAYOUT --- */}
        <div className="border-2 border-slate-900 rounded-2xl p-6 bg-white space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600">
                RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
              </p>
              <h2 className="text-base sm:text-lg font-extrabold uppercase font-heading text-slate-900">
                {currentSchool.nom}
              </h2>
              <p className="text-xs text-slate-600">
                {currentSchool.adresse} • {currentSchool.ville} ({currentSchool.province})
              </p>
              <p className="text-[11px] text-slate-500">
                Tél : {currentSchool.telephone} • {currentSchool.email}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-xl border border-slate-300 overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                {currentSchool.logoUrl ? (
                  <img src={currentSchool.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">LOGO</span>
                )}
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1">{currentSchool.code}</span>
            </div>
          </div>

          {/* Receipt Title and Number */}
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-300 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-500">Document comptable</p>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                REÇU DE PAIEMENT / QUITTANCE
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase font-bold text-slate-500">N° de Quittance</p>
              <p className="text-sm font-extrabold font-mono text-slate-900">{paiement.recuNumero}</p>
            </div>
          </div>

          {/* Student & Payment Meta Details */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 p-4 rounded-xl bg-slate-50/60">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Élève :</p>
              <p className="text-sm font-bold text-slate-900 font-heading">
                {eleve.nom} {eleve.postnom} {eleve.prenom}
              </p>
              <p className="text-slate-600 mt-0.5">Matricule : <span className="font-mono font-semibold">{eleve.matricule}</span></p>
            </div>

            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Classe & Section :</p>
              <p className="text-sm font-bold text-slate-900">
                {eleveClasse?.nom}
              </p>
              <p className="text-slate-600 mt-0.5">{eleveClasse?.section} ({eleveClasse?.option})</p>
            </div>

            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Motif du Paiement :</p>
              <p className="font-semibold text-slate-900">{tranche.nom}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{tranche.description}</p>
            </div>

            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Mode & Date de Paiement :</p>
              <p className="font-semibold text-slate-900">{paiement.modePaiement} • {paiement.date}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Année académique : {currentSchool.anneeAcademique}</p>
            </div>
          </div>

          {/* Amount Box */}
          <div className="border-2 border-emerald-600/40 bg-emerald-50/60 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-emerald-800">
                Montant total encaissé en Francs Congolais (FC)
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 font-heading mt-0.5">
                {formatCDF(paiement.montantCDF)}
              </p>
            </div>

            <div className="text-right border-l-2 border-emerald-600/30 pl-4">
              <p className="text-xs uppercase font-bold text-slate-500">
                Contre-valeur USD
              </p>
              <p className="text-xl font-extrabold text-slate-900 font-heading">
                {formatUSD(paiement.montantUSD)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Taux : 1 USD = {currentSchool?.tauxUsdCdf?.toLocaleString() || '2.500'} FC
              </p>
            </div>
          </div>

          {paiement.observation && (
            <p className="text-xs text-slate-600 italic">
              Observation : {paiement.observation}
            </p>
          )}

          {/* Signature and Stamp */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-xs">
            <div className="text-center">
              <p className="font-bold text-slate-700 uppercase mb-12">Le Parent / Déposant</p>
              <p className="text-[11px] text-slate-500 italic">Pour acquit</p>
            </div>

            <div className="text-center relative">
              <p className="font-bold text-slate-700 uppercase mb-12">Le Comptable de l'École</p>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-dashed border-emerald-600/60 flex items-center justify-center text-[9px] font-bold text-emerald-700 uppercase rotate-6 pointer-events-none">
                Caisse École
              </div>
              <p className="text-xs font-bold text-slate-900 font-serif italic">{paiement.comptableNom}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
            Ce reçu certifie le paiement libératoire des frais scolaires pour la tranche spécifiée. Aucune réclamation ne sera admise sans présentation de l'original de cette quittance.
          </div>
        </div>
      </div>
    </div>
  );
};
