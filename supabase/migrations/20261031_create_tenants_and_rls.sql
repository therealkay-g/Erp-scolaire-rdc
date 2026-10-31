-- ==============================================================================
-- MIGRATION: Création de la table tenants et politiques RLS multi-tenant
-- Contexte: ERP Éducatif RDC (Supabase PostgreSQL / Paris eu-west-3)
-- ==============================================================================

-- 1. Table des Tenants (Écoles)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_slug_format CHECK (slug ~ '^[a-z0-9-]+$') -- minuscules, chiffres et tirets uniquement, sans espaces
);

-- Index pour recherche rapide par slug / code école
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants (slug);

-- 2. Activation de la sécurité au niveau des lignes (Row Level Security)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS sur la table `tenants`
-- Règle: Seul le Super Admin peut lire tous les tenants ; les autres utilisateurs ne voient que le leur.

DROP POLICY IF EXISTS "Lecture des tenants selon le rôle et le tenant_id" ON public.tenants;
CREATE POLICY "Lecture des tenants selon le rôle et le tenant_id"
ON public.tenants
FOR SELECT
TO authenticated
USING (
    -- Super Admin peut voir l'ensemble des écoles
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    OR
    -- Tout autre utilisateur ne voit que sa propre école
    id = ((auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID)
);

DROP POLICY IF EXISTS "Création et modification des tenants réservée au Super Admin" ON public.tenants;
CREATE POLICY "Création et modification des tenants réservée au Super Admin"
ON public.tenants
FOR ALL
TO authenticated
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
);

-- 4. Table `profiles` et ses politiques RLS associées (isolation multi-tenant)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'prefet', 'directeur_etudes', 'directeur_discipline', 'surveillant', 'enseignant', 'comptable', 'secretaire')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index sur school_id pour les filtres RLS performants
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles (school_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS sur `profiles`
DROP POLICY IF EXISTS "Lecture des profils par école ou Super Admin" ON public.profiles;
CREATE POLICY "Lecture des profils par école ou Super Admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    OR
    school_id = ((auth.jwt() -> 'app_metadata' ->> 'school_id')::UUID)
);

DROP POLICY IF EXISTS "Mise à jour des profils" ON public.profiles;
CREATE POLICY "Mise à jour des profils"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
);
