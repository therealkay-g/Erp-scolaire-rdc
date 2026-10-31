import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavModule } from './components/layout/Sidebar';
import { LoginView } from './components/auth/LoginView';
import { PrefetDashboard } from './components/dashboard/PrefetDashboard';
import { NotesManagement } from './components/pedagogie/NotesManagement';
import { PresencesManagement } from './components/pedagogie/PresencesManagement';
import { BulletinsManagement } from './components/bulletins/BulletinsManagement';
import { FinancesManagement } from './components/finances/FinancesManagement';
import { ElevesManagement } from './components/administration/ElevesManagement';
import { PersonnelManagement } from './components/administration/PersonnelManagement';
import { DisciplineManagement } from './components/discipline/DisciplineManagement';
import { ConfigurationManagement } from './components/configuration/ConfigurationManagement';
import { AddSchoolView } from './components/schools/AddSchoolView';
import { Toast } from './components/common/Toast';
import { 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  Users, 
  UserCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    currentUser, 
    isOffline, 
    pendingSyncQueue, 
    syncNow, 
    isSyncing 
  } = useApp();

  const [currentModule, setCurrentModule] = useState<NavModule>('dashboard');
  const [adminSubTab, setAdminSubTab] = useState<'eleves' | 'personnel'>('eleves');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Set default module based on user role when user changes
  useEffect(() => {
    if (!currentUser) return;
    switch (currentUser.role) {
      case 'super_admin':
        setCurrentModule('ecoles');
        break;
      case 'prefet':
        setCurrentModule('dashboard');
        break;
      case 'directeur_etudes':
        setCurrentModule('pedagogie');
        break;
      case 'directeur_discipline':
        setCurrentModule('discipline');
        break;
      case 'surveillant':
        setCurrentModule('presences');
        break;
      case 'enseignant':
        setCurrentModule('pedagogie');
        break;
      case 'comptable':
        setCurrentModule('finances');
        break;
      case 'secretaire':
        setCurrentModule('administration');
        break;
      default:
        setCurrentModule('dashboard');
    }
  }, [currentUser?.role]);

  if (!currentUser) {
    return (
      <>
        <LoginView />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1E1B4B] to-[#2E1065] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      {/* Offline Sync Banner if offline or pending mutations */}
      {(isOffline || pendingSyncQueue.length > 0) && (
        <div className="sync-banner bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              {isOffline ? (
                <WifiOff className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>
                {isOffline ? (
                  <strong>Mode Hors-ligne actif :</strong>
                ) : (
                  <strong>Mode En ligne :</strong>
                )}{' '}
                {pendingSyncQueue.length > 0 
                  ? `${pendingSyncQueue.length} modification(s) en attente de synchronisation avec la base Supabase (Paris eu-west-3).` 
                  : 'Vous travaillez sur la base locale SQLite. Vos données sont préservées.'}
              </span>
            </div>

            {!isOffline && pendingSyncQueue.length > 0 && (
              <button
                onClick={syncNow}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Synchroniser maintenant</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Workspace with Sidebar & Dynamic Module */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          currentModule={currentModule}
          onSelectModule={(mod) => setCurrentModule(mod)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
          {currentModule === 'dashboard' && (
            <PrefetDashboard onNavigate={(mod) => setCurrentModule(mod)} />
          )}

          {currentModule === 'pedagogie' && (
            <NotesManagement />
          )}

          {currentModule === 'presences' && (
            <PresencesManagement />
          )}

          {currentModule === 'bulletins' && (
            <BulletinsManagement />
          )}

          {currentModule === 'finances' && (
            <FinancesManagement />
          )}

          {currentModule === 'administration' && (
            <div className="space-y-6">
              {/* Secondary Navigation for Administration */}
              <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
                <button
                  onClick={() => setAdminSubTab('eleves')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                    adminSubTab === 'eleves'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Dossiers Élèves & Inscriptions</span>
                </button>
                <button
                  onClick={() => setAdminSubTab('personnel')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                    adminSubTab === 'personnel'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Corps Administratif & Enseignants</span>
                </button>
              </div>

              {adminSubTab === 'eleves' ? (
                <ElevesManagement />
              ) : (
                <PersonnelManagement />
              )}
            </div>
          )}

          {currentModule === 'discipline' && (
            <DisciplineManagement />
          )}

          {currentModule === 'configuration' && (
            <ConfigurationManagement />
          )}

          {currentModule === 'ecoles' && (
            <AddSchoolView />
          )}
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
