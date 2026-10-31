import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertOctagon, 
  Copy, 
  ExternalLink, 
  Key, 
  Mail, 
  School as SchoolIcon, 
  User, 
  Lock, 
  Plus, 
  Sparkles,
  Code2,
  FileCode,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AddSchoolView: React.FC = () => {
  const { 
    currentUser, 
    quickLogin, 
    addNewSchoolTenant, 
    login,
    schools 
  } = useApp();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Form states
  const [schoolName, setSchoolName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    tenant_id: string;
    school_code: string;
    school_name: string;
    admin_email: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'form' | 'sql' | 'edge_function' | 'flutter'>('form');

  // Auto-generate slug as school name is typed
  const handleSchoolNameChange = (val: string) => {
    setSchoolName(val);
    const generated = val
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await addNewSchoolTenant({
        schoolName,
        slug,
        adminName,
        adminEmail,
        tempPassword
      });

      if (res.success && res.tenant_id && res.school_code) {
        setSuccessData({
          tenant_id: res.tenant_id,
          school_code: res.school_code,
          school_name: res.school_name || schoolName,
          admin_email: res.admin_email || adminEmail
        });
      } else {
        setErrorMessage(res.error || "Erreur lors de la création de l'école.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur de communication.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSchoolName('');
    setSlug('');
    setAdminName('');
    setAdminEmail('');
    setTempPassword('');
    setErrorMessage(null);
    setSuccessData(null);
  };

  const handleTestLoginAsNewAdmin = () => {
    if (successData) {
      login(successData.school_code, successData.admin_email, tempPassword || 'motdepasse123');
    }
  };

  // If user is not super_admin, display access restricted banner with easy switch
  if (!isSuperAdmin) {
    return (
      <div className="glass-panel rounded-3xl p-8 max-w-2xl mx-auto text-center space-y-6 my-10 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Contrôle d'accès RLS strict
          </span>
          <h2 className="text-2xl font-bold text-white font-heading mt-3">
            Accès réservé au Super Administrateur
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Vous êtes actuellement connecté en tant que <strong>{currentUser?.nom}</strong> ({currentUser?.roleLabel}). La création d'un nouveau tenant scolaire et l'allocation d'identifiants administrateurs requièrent les privilèges <strong>Super Admin</strong>.
          </p>
        </div>

        <button
          onClick={() => quickLogin('super_admin')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer inline-flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Activer la session Super Administrateur (Kay Nzogu)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-1">
            <Building2 className="w-3.5 h-3.5" />
            Administration Système • Multi-Tenant
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Créer une Nouvelle École (Nouveau Tenant)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Provisionnement d'un établissement isolé avec politiques RLS et compte administrateur (Préfet) initial.
          </p>
        </div>

        {/* View Switcher: Formulaire vs Fichiers techniques */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'form' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Formulaire
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'sql' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            SQL & RLS
          </button>
          <button
            onClick={() => setActiveTab('edge_function')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'edge_function' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Edge Function
          </button>
          <button
            onClick={() => setActiveTab('flutter')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'flutter' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Code Flutter
          </button>
        </div>
      </div>

      {/* --- TAB 1: FORMULAIRE INTERACTIF --- */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form or Success View */}
          <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            {successData ? (
              /* Success View */
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-heading">
                    École créée et provisionnée avec succès !
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
                    Le tenant a été inséré dans la table <code className="text-amber-300">tenants</code> et le compte administrateur a été configuré avec <code className="text-amber-300">app_metadata: &#123; school_id, role: 'prefet' &#125;</code>.
                  </p>
                </div>

                {/* Credentials summary box */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3 max-w-lg mx-auto text-xs sm:text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Nom de l'établissement :</span>
                    <strong className="text-white font-bold">{successData.school_name}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Code école (Slug de connexion) :</span>
                    <strong className="text-amber-300 font-mono text-base font-extrabold">{successData.school_code}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Email administrateur (Préfet) :</span>
                    <strong className="text-slate-200 font-mono">{successData.admin_email}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">UUID du Tenant :</span>
                    <span className="text-slate-500 font-mono text-xs">{successData.tenant_id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleTestLoginAsNewAdmin}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Se connecter avec ce compte Préfet (Tester l'isolation)</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition"
                  >
                    Ajouter une autre école
                  </button>
                </div>
              </div>
            ) : (
              /* The Form */
              <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                  <SchoolIcon className="w-4 h-4" />
                  <span>1. Identité de l'établissement (Tenant)</span>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nom de l'école *
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => handleSchoolNameChange(e.target.value)}
                      placeholder="ex: Collège Frère Zuza"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Code école / Slug (Unique, minuscules, sans espaces) *
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="ex: zuza-kinshasa"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Servira de code de connexion pour tout le personnel de l'école.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-800 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  <span>2. Administrateur initial (Rôle Préfet des études)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nom complet de l'administrateur *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="ex: Rév. Père Jean-Baptiste Makengo"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Email de l'administrateur (Unique) *
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="ex: direction@zuza.cd"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Mot de passe temporaire (min 8 caractères) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    L'administrateur devra changer ce mot de passe à sa première connexion.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Création du tenant en cours...</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Créer l'école et son compte administrateur</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Existing schools list & Security note */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-base font-bold text-white font-heading">
                  Écoles existantes ({schools.length})
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                  Tenants actifs
                </span>
              </div>

              {schools.length === 0 ? (
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-300">Aucune école existante</p>
                  <p className="text-[11px] text-slate-500">
                    Remplissez le formulaire ci-contre pour créer le premier tenant scolaire (taux configuré par défaut à 1 $ = 2.500 FC).
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {schools.map(s => (
                    <div key={s.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-xs text-slate-200">{s.nom}</p>
                        <p className="text-[11px] font-mono text-amber-300 mt-0.5">{s.code} • 1$ = {s.tauxUsdCdf || 2500} FC</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ID: {s.id.slice(0, 10)}...
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Sécurité de l'Architecture Multi-Tenant</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                1. <strong>Edge Function Supabase :</strong> La clé secrète <code className="text-amber-200">service_role</code> reste confinée au serveur Edge.
              </p>
              <p className="text-slate-400 leading-relaxed">
                2. <strong>Rollback automatique :</strong> Si la création de l'administrateur échoue, le tenant dans <code className="text-amber-200">tenants</code> est immédiatement supprimé.
              </p>
              <p className="text-slate-400 leading-relaxed">
                3. <strong>Isolation RLS :</strong> Chaque requête SQL filtre automatiquement par <code className="text-amber-200">school_id</code> extrait du JWT.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: CODE SQL & RLS --- */}
      {activeTab === 'sql' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Fichier SQL : /supabase/migrations/20261031_create_tenants_and_rls.sql
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Schéma de la table <code className="text-amber-300">tenants</code> et politiques RLS de séparation stricte.
              </p>
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed">
{`-- Table des Tenants (Écoles)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Seul le Super Admin lit tous les tenants ; les autres voient uniquement le leur
CREATE POLICY "Lecture des tenants selon le rôle et le tenant_id"
ON public.tenants FOR SELECT TO authenticated
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    OR id = ((auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID)
);

CREATE POLICY "Création et modification des tenants réservée au Super Admin"
ON public.tenants FOR ALL TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin');`}
          </pre>
        </div>
      )}

      {/* --- TAB 3: CODE EDGE FUNCTION --- */}
      {activeTab === 'edge_function' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Fichier Edge Function : /supabase/functions/create-school/index.ts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Vérification du rôle Super Admin, API Admin Auth, injection de <code className="text-amber-300">app_metadata</code> et rollback.
              </p>
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed max-h-[500px]">
{`// Extrait de l'Edge Function create-school
// 1. Contrôle du rôle de l'appelant
const callerRole = callerUser.app_metadata?.role;
if (callerRole !== "super_admin") {
  return new Response(JSON.stringify({ error: "Accès refusé. Privilèges Super Admin requis." }), { status: 403 });
}

// 2. Création de l'utilisateur avec injection des métadonnées
const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email: cleanEmail,
  password: temp_password,
  email_confirm: true,
  user_metadata: { full_name: admin_name },
  app_metadata: { school_id: tenantData.id, role: "prefet" },
});

// 3. Rollback en cas d'erreur
if (authError) {
  await supabaseAdmin.from("tenants").delete().eq("id", tenantData.id);
  throw new Error("Échec de création du compte administrateur. Rollback effectué.");
}`}
          </pre>
        </div>
      )}

      {/* --- TAB 4: CODE FLUTTER --- */}
      {activeTab === 'flutter' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Fichiers Flutter : /lib/screens/add_school_screen.dart & /lib/providers/add_school_provider.dart
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Gestion d'état avec Riverpod et invocation sécurisée de <code className="text-amber-300">supabase.functions.invoke('create-school')</code>.
              </p>
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed max-h-[500px]">
{`// Invocation depuis le Provider Riverpod
final response = await _supabase.functions.invoke(
  'create-school',
  body: {
    'school_name': schoolName.trim(),
    'slug': cleanSlug,
    'admin_name': adminName.trim(),
    'admin_email': adminEmail.trim().toLowerCase(),
    'temp_password': tempPassword,
  },
);`}
          </pre>
        </div>
      )}
    </div>
  );
};
