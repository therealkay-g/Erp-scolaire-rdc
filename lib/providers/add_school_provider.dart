import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Modèle représentant le résultat de création d'une école
class CreatedSchoolResult {
  final String tenantId;
  final String schoolCode;
  final String schoolName;
  final String adminEmail;
  final String message;

  CreatedSchoolResult({
    required this.tenantId,
    required this.schoolCode,
    required this.schoolName,
    required this.adminEmail,
    required this.message,
  });

  factory CreatedSchoolResult.fromJson(Map<String, dynamic> json) {
    return CreatedSchoolResult(
      tenantId: json['tenant_id'] ?? '',
      schoolCode: json['school_code'] ?? '',
      schoolName: json['school_name'] ?? '',
      adminEmail: json['admin_email'] ?? '',
      message: json['message'] ?? 'École créée avec succès.',
    );
  }
}

/// État du processus de création d'école
class AddSchoolState {
  final bool isLoading;
  final String? errorMessage;
  final CreatedSchoolResult? successResult;

  const AddSchoolState({
    this.isLoading = false,
    this.errorMessage,
    this.successResult,
  });

  AddSchoolState copyWith({
    bool? isLoading,
    String? errorMessage,
    CreatedSchoolResult? successResult,
  }) {
    return AddSchoolState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      successResult: successResult ?? this.successResult,
    );
  }
}

/// Notifier Riverpod gérant l'appel sécurisé à l'Edge Function Supabase
class AddSchoolNotifier extends StateNotifier<AddSchoolState> {
  final SupabaseClient _supabase;

  AddSchoolNotifier(this._supabase) : super(const AddSchoolState());

  /// Réinitialise l'état du formulaire
  void reset() {
    state = const AddSchoolState();
  }

  /// Appelle l'Edge Function `create-school`
  Future<bool> createSchool({
    required String schoolName,
    required String slug,
    required String adminName,
    required String adminEmail,
    required String tempPassword,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      // Nettoyage et formatage du slug (minuscules, sans espaces)
      final cleanSlug = slug.trim().toLowerCase().replaceAll(RegExp(r'\s+'), '-');

      // Appel sécurisé à l'Edge Function Supabase (transmet automatiquement le Bearer JWT de l'utilisateur connecté)
      final response = await _supabase.functions.invoke(
        'create-school',
        body: {
          'school_name': schoolName.trim(),
          'slug': cleanSlug,
          'admin_name': adminName.trim(),
          'admin_email': adminEmail.trim().toLowerCase(),
          'temp_password': tempPassword,
        },
      );

      // Traitement du résultat
      if (response.status == 201 || response.status == 200) {
        final data = response.data is Map<String, dynamic> 
            ? response.data 
            : Map<String, dynamic>.from(response.data as Map);
        
        final result = CreatedSchoolResult.fromJson(data);
        state = state.copyWith(isLoading: false, successResult: result);
        return true;
      } else {
        // Erreur renvoyée par l'Edge Function
        final errorMsg = response.data is Map && response.data['error'] != null
            ? response.data['error']
            : 'Une erreur inattendue est survenue (Code ${response.status}).';

        state = state.copyWith(isLoading: false, errorMessage: errorMsg.toString());
        return false;
      }
    } on FunctionException catch (e) {
      // Erreurs d'invocation de la fonction Edge (ex: 403 Forbidden, 409 Conflict)
      String message = 'Erreur lors de la communication avec le serveur.';
      if (e.details is Map && e.details['error'] != null) {
        message = e.details['error'];
      } else if (e.status == 403) {
        message = 'Accès refusé. Seul le Super Admin est habilité à créer une école.';
      } else if (e.status == 409) {
        message = 'Le code école ou l’adresse email administrateur est déjà utilisé.';
      } else if (e.reasonPhrase != null) {
        message = e.reasonPhrase!;
      }

      state = state.copyWith(isLoading: false, errorMessage: message);
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false, 
        errorMessage: 'Erreur réseau ou connexion impossible : ${e.toString()}'
      );
      return false;
    }
  }
}

/// Provider d'accès au client Supabase
final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

/// Provider Riverpod pour l'écran Ajouter une école
final addSchoolProvider = StateNotifierProvider.autoDispose<AddSchoolNotifier, AddSchoolState>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  return AddSchoolNotifier(supabase);
});
