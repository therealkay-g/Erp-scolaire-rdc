import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarCheck, 
  FileText, 
  CreditCard, 
  Users, 
  ShieldAlert, 
  Settings,
  GraduationCap,
  Sparkles,
  Award,
  Building2
} from 'lucide-react';

export type NavModule = 
  | 'dashboard' 
  | 'pedagogie' 
  | 'presences' 
  | 'bulletins' 
  | 'finances' 
  | 'administration' 
  | 'discipline' 
  | 'configuration'
  | 'ecoles';

interface SidebarProps {
  currentModule: NavModule;
  onSelectModule: (m: NavModule) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentModule, 
  onSelectModule, 
  isMobileOpen, 
  onCloseMobile 
}) => {
  const { currentUser, currentSchool, pendingSyncQueue } = useApp();

  // Matrice des modules visibles par rôle selon le document 02-app-flow.md + Super Admin
  const isModuleVisible = (mod: NavModule): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;

    switch (role) {
      case 'super_admin':
        // Réservé au Super Admin : création d'écoles, configuration système, supervision
        return ['ecoles', 'dashboard', 'configuration'].includes(mod);
      case 'prefet':
        return true; // Tous les modules
      case 'directeur_etudes':
        return ['pedagogie', 'bulletins', 'administration'].includes(mod);
      case 'directeur_discipline':
        return ['discipline', 'presences'].includes(mod);
      case 'surveillant':
        return ['presences'].includes(mod);
      case 'enseignant':
        return ['pedagogie'].includes(mod);
      case 'comptable':
        return ['finances'].includes(mod);
      case 'secretaire':
        return ['administration'].includes(mod);
      default:
        return false;
    }
  };

  const navItems: { id: NavModule; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'ecoles', label: 'Ajouter une école (Tenants)', icon: Building2, badge: 'Super Admin' },
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'pedagogie', label: 'Pédagogie & Notes', icon: BookOpen },
    { id: 'presences', label: 'Présences', icon: CalendarCheck },
    { id: 'bulletins', label: 'Bulletins & Top 10', icon: FileText },
    { id: 'finances', label: 'Finances & Reçus', icon: CreditCard },
    { id: 'administration', label: 'Administration', icon: Users },
    { id: 'discipline', label: 'Discipline & Sanctions', icon: ShieldAlert },
    { id: 'configuration', label: 'Configuration École', icon: Settings },
  ];

  const visibleItems = navItems.filter(item => isModuleVisible(item.id));

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] z-40 w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* User mini badge */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 font-bold text-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.nom}</p>
                <p className="text-[11px] text-amber-400/90 font-medium truncate">{currentUser?.roleLabel}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Modules autorisés ({currentUser?.role})
            </p>
            {visibleItems.map(item => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectModule(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.id === 'bulletins' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                      Officiel
                    </span>
                  )}
                  {item.id === 'finances' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                      FC
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom School Status & Sync Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>Taux de change</span>
              <span className="font-semibold text-amber-400">1 $ = {currentSchool?.tauxUsdCdf?.toLocaleString() || '2.500'} FC</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Région Supabase</span>
              <span className="text-emerald-400">Paris (eu-west-3)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sécurité</span>
              <span className="text-slate-300 font-mono text-[10px]">RLS Multi-tenant</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
