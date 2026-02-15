import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String url = 'https://nhagzwbdryxqhwbhfskg.supabase.co';
  
  static const String anonKey = 'sb_publishable_xf2W52mpZkLPQBItk6Mksw_DStd30Tn';
  
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
    );
  }
  
  static SupabaseClient get client => Supabase.instance.client;
}
