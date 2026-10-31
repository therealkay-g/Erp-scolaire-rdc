import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateSchoolPayload {
  school_name: string;
  slug: string;
  admin_name: string;
  admin_email: string;
  temp_password: string;
}

serve(async (req: Request) => {
  // Gestion du prévol CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Configuration serveur incomplète (clés Supabase manquantes).");
    }

    // 1. VÉRIFICATION DU RÔLE DE L'APPELANT (SÉCURITÉ CRITIQUE)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "En-tête d'autorisation manquant (JWT requis)." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Client pour valider le jeton JWT de l'utilisateur appelant
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !callerUser) {
      return new Response(
        JSON.stringify({ error: "Session invalide ou expirée." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Contrôle strict du rôle : Seul 'super_admin' est autorisé à créer une école
    const callerRole = callerUser.app_metadata?.role;
    if (callerRole !== "super_admin") {
      return new Response(
        JSON.stringify({ 
          error: "Accès refusé. Cette opération requiert les privilèges Super Administrateur." 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. PARSING ET VALIDATION DES ENTRÉES
    const body: CreateSchoolPayload = await req.json();
    const { school_name, slug, admin_name, admin_email, temp_password } = body;

    if (!school_name?.trim()) {
      return new Response(
        JSON.stringify({ error: "Le nom de l'école est obligatoire." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validation du slug (minuscules, sans espaces, caractères alphanumériques et tirets)
    const cleanSlug = slug?.trim().toLowerCase();
    const slugRegex = /^[a-z0-9-]+$/;
    if (!cleanSlug || !slugRegex.test(cleanSlug)) {
      return new Response(
        JSON.stringify({ error: "Le code école (slug) doit être en minuscules, sans espaces ni caractères spéciaux (ex: boboto-kin)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!admin_name?.trim()) {
      return new Response(
        JSON.stringify({ error: "Le nom complet de l'administrateur est obligatoire." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanEmail = admin_email?.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return new Response(
        JSON.stringify({ error: "L'adresse email de l'administrateur est invalide." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!temp_password || temp_password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe temporaire doit comporter au moins 8 caractères." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Client Admin Supabase avec la clé service_role (côté serveur uniquement)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3. VÉRIFICATION D'UNICITÉ (SLUG ET EMAIL)
    // Vérification slug dans tenants
    const { data: existingTenant, error: slugCheckError } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (slugCheckError) {
      throw new Error(`Erreur lors de la vérification du code école: ${slugCheckError.message}`);
    }

    if (existingTenant) {
      return new Response(
        JSON.stringify({ error: "Ce code école (slug) est déjà utilisé par un autre établissement." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. CRÉATION AVEC MÉCANISME DE ROLLBACK
    let createdTenantId: string | null = null;
    let createdAuthUserId: string | null = null;

    try {
      // Étape 4.1: Créer le tenant dans la table tenants
      const { data: tenantData, error: tenantInsertError } = await supabaseAdmin
        .from("tenants")
        .insert({
          name: school_name.trim(),
          slug: cleanSlug,
        })
        .select("id, name, slug")
        .single();

      if (tenantInsertError || !tenantData) {
        throw new Error(`Échec de création du tenant: ${tenantInsertError?.message}`);
      }

      createdTenantId = tenantData.id;

      // Étape 4.2: Créer l'administrateur d'école (Préfet) dans Supabase Auth via l'API Admin
      const { data: authUserResult, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: temp_password,
        email_confirm: true, // Pré-confirmé pour permettre la première connexion
        user_metadata: {
          full_name: admin_name.trim(),
        },
        app_metadata: {
          school_id: createdTenantId,
          role: "prefet", // Rôle officiel d'administrateur de l'école selon le PRD
        },
      });

      if (authCreateError || !authUserResult.user) {
        // Déclencher le rollback si l'email existe déjà ou autre erreur Auth
        if (authCreateError?.message?.includes("already registered") || authCreateError?.status === 422) {
          throw new Error("Cette adresse email est déjà enregistrée pour un autre utilisateur.");
        }
        throw new Error(`Échec de création du compte administrateur: ${authCreateError?.message}`);
      }

      createdAuthUserId = authUserResult.user.id;

      // Étape 4.3: Créer la fiche profile correspondante
      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id: createdAuthUserId,
        school_id: createdTenantId,
        full_name: admin_name.trim(),
        role: "prefet",
      });

      if (profileError) {
        throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
      }

      // Tout s'est déroulé avec succès
      return new Response(
        JSON.stringify({
          success: true,
          tenant_id: createdTenantId,
          school_code: tenantData.slug,
          school_name: tenantData.name,
          admin_email: cleanEmail,
          message: `École « ${tenantData.name} » créée avec succès.`,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (transactionError: any) {
      // 5. GESTION DU ROLLBACK (EN CAS D'ÉCHEC TRANSACTIONNEL)
      console.error("Erreur durant la création. Déclenchement du rollback...", transactionError);

      // Si un compte Auth a été créé mais que la suite a échoué, on le supprime
      if (createdAuthUserId) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
          console.log(`[Rollback] Utilisateur Auth ${createdAuthUserId} supprimé.`);
        } catch (cleanupAuthErr) {
          console.error("[Rollback Échec] Impossible de supprimer l'utilisateur Auth:", cleanupAuthErr);
        }
      }

      // Si le tenant a été inséré, on le supprime
      if (createdTenantId) {
        try {
          await supabaseAdmin.from("tenants").delete().eq("id", createdTenantId);
          console.log(`[Rollback] Tenant ${createdTenantId} supprimé.`);
        } catch (cleanupTenantErr) {
          console.error("[Rollback Échec] Impossible de supprimer le tenant:", cleanupTenantErr);
        }
      }

      const isConflict = transactionError.message?.includes("déjà enregistrée") || transactionError.message?.includes("déjà utilisé");
      return new Response(
        JSON.stringify({ error: transactionError.message || "Échec de création de l'école." }),
        { status: isConflict ? 409 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Erreur interne du serveur." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
