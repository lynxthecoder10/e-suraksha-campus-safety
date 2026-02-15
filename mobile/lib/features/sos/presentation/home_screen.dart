import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:e_suraksha_mobile/core/config/supabase_config.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  
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
       duration: const Duration(seconds: 2),
     )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _triggerSOS() async {
    try {
      // Mock location
      await SupabaseConfig.client.from('alerts').insert({
        'user_id': SupabaseConfig.client.auth.currentUser!.id,
        'type': 'medical', 
        'status': 'active',
        'latitude': 12.9716,
        'longitude': 77.5946,
        'extra_data': 'Mobile SOS Trigger',
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('SOS Signal Broadcasted! Help is on the way.')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Failed: $error')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('E-SURAKSHA', 
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          fontWeight: FontWeight.bold, 
                          letterSpacing: 2,
                          color: Colors.grey
                        )
                      ),
                      const Text('Command Center', 
                        style: TextStyle(
                          fontSize: 24, 
                          fontWeight: FontWeight.w800
                        )
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.bluetooth, size: 16, color: Colors.green),
                        const SizedBox(width: 4),
                        Text('MESH: ON', style: TextStyle(
                          fontSize: 12, 
                          fontWeight: FontWeight.bold,
                          color: Colors.green.shade900
                        )),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => context.push('/notifications'),
                    icon: const Icon(Icons.notifications_outlined),
                  ),
                ],
              ),
            ),

            // SOS Button (Hero)
            Expanded(
              flex: 3,
              child: Center(
                child: GestureDetector(
                  onLongPress: _triggerSOS,
                  onTap: () {
                     ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Hold button for 2 seconds to trigger SOS')),
                     );
                  },
                  child: AnimatedBuilder(
                    animation: _controller,
                    builder: (context, child) {
                       return Container(
                         width: 200 + (_controller.value * 20),
                         height: 200 + (_controller.value * 20),
                         decoration: BoxDecoration(
                           color: Colors.red.withOpacity(0.2 - (_controller.value * 0.1)),
                           shape: BoxShape.circle,
                         ),
                         child: child,
                       );
                    },
                    child: Container(
                      width: 200,
                      height: 200,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFFEF4444), Color(0xFFB91C1C)],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                           BoxShadow(color: Colors.red.withOpacity(0.5), blurRadius: 20, spreadRadius: 5)
                        ]
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                           Icon(Icons.touch_app, color: Colors.white, size: 48),
                           SizedBox(height: 8),
                           Text('HOLD SOS', 
                             style: TextStyle(
                               color: Colors.white, 
                               fontWeight: FontWeight.bold, 
                               fontSize: 24,
                               letterSpacing: 2
                             )
                           ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            
            // Recent Alerts Section
            Expanded(
              flex: 2,
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(30),
                    topRight: Radius.circular(30),
                  ),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                       Row(
                         mainAxisAlignment: MainAxisAlignment.spaceBetween,
                         children: [
                           const Text('Active Alerts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                           TextButton(onPressed: () => context.go('/map'), child: const Text('View Map')),
                         ],
                       ),
                       Expanded(
                         child: StreamBuilder<List<Map<String, dynamic>>>(
                           stream: _alertsStream,
                           builder: (context, snapshot) {
                             if (!snapshot.hasData || (snapshot.data ?? []).isEmpty) {
                               return const Center(
                                 child: Column(
                                   mainAxisAlignment: MainAxisAlignment.center,
                                   children: [
                                      Icon(Icons.check_circle_outline, color: Colors.green, size: 40),
                                      SizedBox(height: 8),
                                      Text('Campus is Secure'),
                                   ],
                                 ),
                               );
                             }
                             
                             return ListView.builder(
                               itemCount: snapshot.data!.length,
                               itemBuilder: (context, index) {
                                 final alert = snapshot.data![index];
                                 return ListTile(
                                    leading: Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: const BoxDecoration(
                                        color: Colors.redAccent,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.warning_amber, color: Colors.white, size: 20),
                                    ),
                                    title: Text(alert['type'].toString().toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold)),
                                    subtitle: Text(alert['extra_data'] ?? 'Emergency Alert'),
                                    trailing: const Text('Just Now', style: TextStyle(color: Colors.grey, fontSize: 12)),
                                 );
                               },
                             );
                           },
                         ),
                       ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
