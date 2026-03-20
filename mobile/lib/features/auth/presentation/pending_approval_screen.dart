import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:e_suraksha_mobile/core/config/supabase_config.dart';
import 'package:e_suraksha_mobile/core/theme/app_theme.dart';

class PendingApprovalScreen extends StatefulWidget {
  const PendingApprovalScreen({super.key});

  @override
  State<PendingApprovalScreen> createState() => _PendingApprovalScreenState();
}

class _PendingApprovalScreenState extends State<PendingApprovalScreen> {
  bool _isLoading = false;
  String? _status;
  String? _role;

  @override
  void initState() {
    super.initState();
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    setState(() => _isLoading = true);
    try {
      final user = SupabaseConfig.client.auth.currentUser;
      if (user != null) {
        final data = await SupabaseConfig.client
            .from('profiles')
            .select('status, role')
            .eq('id', user.id)
            .maybeSingle();
        
        if (mounted) {
          setState(() {
            _status = data?['status'];
            _role = data?['role'];
          });

          // If active, redirect to home
          if (_status == 'active' || _status == null) {
             if (mounted) context.go('/home');
          }
        }
      }
    } catch (e) {
      // Handle error
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signOut() async {
    await SupabaseConfig.client.auth.signOut();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.verified_user_outlined,
                  size: 64,
                  color: Colors.amber.shade700,
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Identity Verification',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              const Text(
                'Your account is currently being reviewed by campus security admins. This process typically takes less than 24 hours.',
                style: TextStyle(
                  fontSize: 15,
                  color: Color(0xFF64748B),
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))
                  ],
                ),
                child: Column(
                  children: [
                    const Text(
                      'CURRENT STATUS',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                        color: Color(0xFF94A3B8),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        (_status ?? 'Review in Progress').toUpperCase(),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.black,
                          color: Colors.amber.shade900,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 48),
              
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _checkStatus,
                icon: _isLoading 
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) 
                  : const Icon(Icons.refresh_rounded),
                label: const Text('REFRESH STATUS', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1)),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(60),
                ),
              ),
              
              const SizedBox(height: 16),
              
              OutlinedButton.icon(
                onPressed: _signOut,
                icon: const Icon(Icons.logout_rounded, size: 18),
                label: const Text('SIGN OUT', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1)),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(60),
                  foregroundColor: const Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
