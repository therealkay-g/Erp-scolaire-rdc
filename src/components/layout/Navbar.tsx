import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  School as SchoolIcon,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { 
    currentSchool, 
    currentUser, 
    quickLogin, 
    logout, 
    isOffline, 
    setIsOffline, 
    pendingSyncQueue, 
    isSyncing, 
    syncNow,
    schools 
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin (Kay Nzogu)', desc: 'Administration système & gestion des tenants' },
    { role: 'prefet', label: 'Préfet des Études', desc: 'Vue globale, validation, rapports complets' },
    { role: 'directeur_etudes', label: 'Directeur des Études', desc: 'Pédagogie, classes, bulletins, affectations' },
    { role: 'directeur_discipline', label: 'Directeur de Discipline', desc: 'Sanctions, présences et vie scolaire' },
    { role: 'surveillant', label: 'Surveillant Général', desc: 'Saisie des présences par demi-journée' },
    { role: 'enseignant', label: 'Enseignant Titulaire', desc: 'Saisie des notes et présences de ses cours' },
    { role: 'comptable', label: 'Comptable Principal', desc: 'Frais, tranches, reçus imprimables, impayés' },
    { role: 'secretaire', label: 'Secrétaire Administratif', desc: 'Inscriptions, dossiers élèves, personnel' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-700/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + School Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400/30 shadow-md shadow-amber-500/10 bg-slate-900 flex items-center justify-center shrink-0">
              {currentSchool?.logoUrl ? (
                <img src={currentSchool.logoUrl} alt={currentSchool.nom} className="w-full h-full object-cover" />
              ) : (
                <SchoolIcon className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm sm:text-base text-slate-100 tracking-tight">
                  {currentSchool?.nom || 'ERP Éducatif RDC'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  {currentSchool?.code || 'SYS'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {schools.length === 0 ? (
                  <span className="text-amber-400 font-medium">1 $ = 2.500 FC • Prêt pour créer une école (Tenant)</span>
                ) : (
                  <>Année : <span className="text-slate-200 font-medium">{currentSchool?.anneeAcademique}</span> • {currentSchool?.province} (1 $ = {currentSchool?.tauxUsdCdf?.toLocaleString() || '2.500'} FC)</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Offline toggle, Sync status & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline / Online Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-xl p-1 px-2.5 text-xs">
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center gap-1.5 py-1 px-2 rounded-lg font-medium transition ${
                isOffline 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
              title="Cliquez pour tester le mode hors-ligne d'abord"
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden md:inline">Mode Hors-ligne</span>
                  <span className="md:hidden">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">En Ligne (Paris)</span>
                  <span className="md:hidden">Online</span>
                </>
              )}
            </button>

            {/* Pending queue badge and sync trigger */}
            {pendingSyncQueue.length > 0 && (
              <button
                onClick={syncNow}
                disabled={isOffline || isSyncing}
                className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium transition disabled:opacity-50"
                title="Synchroniser les modifications locales vers Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Synchro</span> ({pendingSyncQueue.length})
              </button>
            )}
          </div>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 hover:border-amber-400/40 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-slate-200 transition"
              title="Changer de rôle et de profil d'accès"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <div className="text-left hidden lg:block">
                <p className="font-semibold text-slate-100 leading-none">{currentUser?.roleLabel}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Changer de rôle</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Profils & Accès (Matrice RBAC)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Séparation stricte des privilèges par fonction.
                  </p>
                </div>
                <div className="py-1 max-h-72 overflow-y-auto space-y-0.5">
                  {rolesList.map(r => (
                    <button
                      key={r.role}
                      onClick={() => {
                        quickLogin(r.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                        currentUser?.role === r.role
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          {r.label}
                          {currentUser?.role === r.role && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 hidden sm:block">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.nom} className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="w-4 h-4 m-2 text-slate-400" />
              )}
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
