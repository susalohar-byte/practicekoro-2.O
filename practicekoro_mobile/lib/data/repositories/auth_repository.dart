import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

class AuthRepository {
  SupabaseClient? get _supabase {
    try {
      return Supabase.instance.client;
    } catch (_) {
      return null;
    }
  }

  User? get currentUser => _supabase?.auth.currentUser;

  bool get isAuthenticated => currentUser != null;

  Stream<AuthState>? get authStateChanges => _supabase?.auth.onAuthStateChange;

  Future<AuthResponse?> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final client = _supabase;
    if (client == null) return null;
    return await client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  Future<AuthResponse?> signUpWithEmail({
    required String email,
    required String password,
    required String fullName,
  }) async {
    final client = _supabase;
    if (client == null) return null;
    return await client.auth.signUp(
      email: email,
      password: password,
      data: {'full_name': fullName},
    );
  }

  Future<void> signOut() async {
    await _supabase?.auth.signOut();
  }
}
