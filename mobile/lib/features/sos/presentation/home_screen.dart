import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:e_suraksha_mobile/core/config/supabase_config.dart';
import 'package:e_suraksha_mobile/core/theme/app_theme.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  Map<String, dynamic>? _profile;
  
  final _alertsStream = SupabaseConfig.client
      .from('alerts')
      .stream(primaryKey: ['id'])
      .eq('status', 'active')
      .order('created_at', ascending: false)
      .limit(5);

  @override
  void initState() {
     super.initState();
     _controller = AnimationController(
       vsync: this,
       duration: const Duration(seconds: 1),
     )..repeat(reverse: true);
     _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final user = SupabaseConfig.client.auth.currentUser;
      if (user != null) {
        final data = await SupabaseConfig.client
            .from('profiles')
            .select()
            .eq('id', user.id)
            .maybeSingle();
        if (mounted) {
          setState(() {
            _profile = data;
          });
          
          if (data?['status'] == 'pending') {
            if (mounted) context.go('/pending');
          }
        }
      }
    } catch (e) {
      // Silent error
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _triggerSOS() async {
    try {
      final user = SupabaseConfig.client.auth.currentUser;
      if (user == null) return;

      await SupabaseConfig.client.from('alerts').insert({
        'user_id': user.id,
        'type': 'medical', 
        'status': 'active',
        'latitude': 12.9716, 
        'longitude': 77.5946,
        'extra_data': 'Mobile SOS Triggered',
      });
      if (mounted) {
        _showFeedback('SOS Signal Broadcasted! Help is arriving.');
      }
    } catch (error) {
      _showFeedback('Failed: $error', isError: true);
    }
  }

  void _showFeedback(String message, {bool isError = false}) {
     if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            behavior: SnackBarBehavior.floating,
            backgroundColor: isError ? Colors.red : Colors.green,
          ),
        );
     }
  }

  @override
  Widget build(BuildContext context) {
    final isAdmin = _profile?['role'] == 'admin';

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
              child: Row(
                children: [
                   Expanded(
                     child: Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         Text('E-SURAKSHA', 
                           style: TextStyle(
                             fontWeight: FontWeight.w900, 
                             letterSpacing: 3,
                             fontSize: 12,
                             color: AppTheme.primaryColor.withOpacity(0.6)
                           )
                         ),
                         const Text('Command Center', 
                           style: TextStyle(
                             fontSize: 26, 
                             fontWeight: FontWeight.w900,
                             color: Color(0xFF0F172A)
                           )
                         ),
                       ],
                     ),
                   ),
                   IconButton.filledTonal(
                     onPressed: () => context.push('/notifications'),
                     icon: const Icon(Icons.notifications_active_outlined),
                   ),
                ],
              ),
            ),

            // Mesh Status Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.bluetooth_connected, size: 18, color: Colors.green),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Mesh Network Active', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text('You are connected to 8 neighbors', style: TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                    ),
                    if (isAdmin)
                      IconButton(
                        icon: const Icon(Icons.admin_panel_settings, color: Color(0xFF4F46E5)),
                        onPressed: () => context.push('/admin'),
                      ),
                  ],
                ),
              ),
            ),

            // SOS Button (Main Interaction)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    GestureDetector(
                      onLongPress: _triggerSOS,
                      onTap: () => _showFeedback('Hold for 2s to trigger emergency'),
                      child: AnimatedBuilder(
                        animation: _controller,
                        builder: (context, child) {
                           return Container(
                             padding: EdgeInsets.all(30 + (_controller.value * 20)),
                             decoration: BoxDecoration(
                               color: Colors.red.withOpacity(0.15 - (_controller.value * 0.1)),
                               shape: BoxShape.circle,
                             ),
                             child: child,
                           );
                        },
                        child: Container(
                          width: 220,
                          height: 220,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Color(0xFFEF4444), Color(0xFFDC2626), Color(0xFF991B1B)],
                            ),
                            shape: BoxShape.circle,
                            boxShadow: [
                               BoxShadow(
                                 color: Colors.red.withOpacity(0.4), 
                                 blurRadius: 30, 
                                 spreadRadius: 10,
                                 offset: const Offset(0, 15)
                               )
                            ],
                            border: Border.all(color: Colors.white.withOpacity(0.2), width: 8),
                          ),
                          child: const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                               Icon(Icons.touch_app, color: Colors.white, size: 40),
                               SizedBox(height: 12),
                               Text('SIGNAL', 
                                 style: TextStyle(
                                   color: Colors.white, 
                                   fontWeight: FontWeight.w900, 
                                   fontSize: 28,
                                   letterSpacing: 4
                                 )
                               ),
                               Text('FOR HELP', 
                                 style: TextStyle(
                                   color: Colors.white70, 
                                   fontWeight: FontWeight.bold, 
                                   fontSize: 12,
                                   letterSpacing: 1
                                 )
                               ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                    const Text('LONG PRESS FOR 2 SECONDS', 
                      style: TextStyle(
                        fontSize: 12, 
                        fontWeight: FontWeight.w800, 
                        letterSpacing: 1,
                        color: Colors.blueGrey
                      )
                    ),
                  ],
                ),
              ),
            ),
            
            // Bottom Sheet Section
            Container(
              height: 280,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(40),
                  topRight: Radius.circular(40),
                ),
                boxShadow: [
                  BoxShadow(color: Colors.black12, blurRadius: 20, offset: Offset(0, -10))
                ],
              ),
              child: Column(
                children: [
                   const SizedBox(height: 12),
                   Container(
                     width: 40,
                     height: 4,
                     decoration: BoxDecoration(
                       color: Colors.grey.shade200,
                       borderRadius: BorderRadius.circular(2),
                     ),
                   ),
                   Padding(
                     padding: const EdgeInsets.fromLTRB(28, 20, 16, 12),
                     child: Row(
                       mainAxisAlignment: MainAxisAlignment.spaceBetween,
                       children: [
                         const Text('Safety Feed', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Color(0xFF0F172A))),
                         TextButton.icon(
                            onPressed: () => context.go('/map'), 
                            icon: const Icon(Icons.map_outlined, size: 18),
                            label: const Text('View Map')
                         ),
                       ],
                     ),
                   ),
                   Expanded(
                     child: StreamBuilder<List<Map<String, dynamic>>>(
                       stream: _alertsStream,
                       builder: (context, snapshot) {
                         if (!snapshot.hasData || (snapshot.data ?? []).isEmpty) {
                           return Center(
                             child: Column(
                               mainAxisAlignment: MainAxisAlignment.center,
                               children: [
                                  Icon(Icons.verified_user, color: Colors.green.shade400, size: 48),
                                  const SizedBox(height: 12),
                                  const Text('Zone Secured', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                               ],
                             ),
                           );
                         }
                         
                         return ListView.builder(
                           padding: const EdgeInsets.symmetric(horizontal: 24),
                           itemCount: snapshot.data!.length,
                           itemBuilder: (context, index) {
                             final alert = snapshot.data![index];
                             return Container(
                               margin: const EdgeInsets.only(bottom: 12),
                               padding: const EdgeInsets.all(16),
                               decoration: BoxDecoration(
                                 color: const Color(0xFFFFF1F2),
                                 borderRadius: BorderRadius.circular(20),
                                 border: Border.all(color: Colors.red.shade100),
                               ),
                               child: Row(
                                 children: [
                                   const Icon(Icons.warning_amber_rounded, color: Colors.red),
                                   const SizedBox(width: 16),
                                   Expanded(
                                     child: Column(
                                       crossAxisAlignment: CrossAxisAlignment.start,
                                       children: [
                                         Text(alert['type'].toString().toUpperCase(), 
                                           style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Colors.red)
                                         ),
                                         Text(alert['extra_data'] ?? 'Emergency reported', 
                                           style: const TextStyle(fontSize: 12, color: Colors.blueGrey)
                                         ),
                                       ],
                                     ),
                                   ),
                                   const Text('NEW', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.red)),
                                 ],
                               ),
                             );
                           },
                         );
                       },
                     ),
                   ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
