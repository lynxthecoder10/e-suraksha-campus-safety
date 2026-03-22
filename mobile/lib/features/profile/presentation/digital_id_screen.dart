import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/config/supabase_config.dart';

class DigitalIDScreen extends StatelessWidget {
  const DigitalIDScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = SupabaseConfig.client.auth.currentUser;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF020617) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('DIGITAL IDENTITY'),
        titleTextStyle: TextStyle(
          fontSize: 14, 
          fontWeight: FontWeight.w900, 
          letterSpacing: 2, 
          color: isDark ? Colors.white70 : const Color(0xFF64748B)
        ),
      ),
      body: FutureBuilder(
        future: SupabaseConfig.client
            .from('profiles')
            .select()
            .eq('id', user?.id ?? '')
            .single(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Error loading profile'));
          }

          final profile = snapshot.data as Map<String, dynamic>;
          final name = profile['name'] ?? 'Student';
          final role = (profile['role'] ?? 'student').toString().toUpperCase();
          final status = (profile['status'] ?? 'active').toString().toUpperCase();

          return SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(
              children: [
                const SizedBox(height: 20),
                // Premium ID Card
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF111827) : Colors.white,
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(color: isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(isDark ? 0.4 : 0.05),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      )
                    ],
                  ),
                  child: Column(
                    children: [
                      // Header Section
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.05),
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'E-SURAKSHA',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 1,
                                    fontSize: 10,
                                    color: Colors.red,
                                  ),
                                ),
                                Text(
                                  'CAMPUS SAFETY',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.5,
                                    fontSize: 8,
                                    color: Colors.red,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.green.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                status,
                                style: const TextStyle(
                                  color: Colors.green,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // QR Code
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: QrImageView(
                          data: user?.id ?? 'invalid-id',
                          version: QrVersions.auto,
                          size: 200.0,
                          eyeStyle: const QrEyeStyle(
                            eyeShape: QrEyeShape.square,
                            color: Color(0xFF0F172A),
                          ),
                          dataModuleStyle: const QrDataModuleStyle(
                            dataModuleShape: QrDataModuleShape.square,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // User Info
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Column(
                          children: [
                            Text(
                              name.toUpperCase(),
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                                letterSpacing: -0.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              role,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: Colors.blue.withOpacity(0.8),
                                letterSpacing: 2,
                              ),
                            ),
                            const SizedBox(height: 24),
                            const Divider(height: 1, color: Colors.white10),
                            const SizedBox(height: 20),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.verified_user_rounded, color: Colors.green.withOpacity(0.6), size: 16),
                                const SizedBox(width: 8),
                                Text(
                                  'VALID CAMPUS ACCESS',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    color: isDark ? Colors.white24 : Colors.grey.shade400,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 32),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 40),
                Text(
                  'SCAN AT CAMPUS GATES',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.amber.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.amber.withOpacity(0.1)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline_rounded, color: Colors.amber.shade600, size: 24),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Text(
                          'This Digital ID is strictly for on-campus verification. Do not share your QR code with anyone.',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? Colors.white60 : Colors.black54,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
