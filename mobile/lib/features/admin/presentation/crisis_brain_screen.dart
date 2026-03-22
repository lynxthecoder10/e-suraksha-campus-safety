import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/config/supabase_config.dart';

class CrisisBrainScreen extends StatefulWidget {
  const CrisisBrainScreen({super.key});

  @override
  State<CrisisBrainScreen> createState() => _CrisisBrainScreenState();
}

class _CrisisBrainScreenState extends State<CrisisBrainScreen> {
  final _alertsStream = SupabaseConfig.client
      .from('alerts')
      .stream(primaryKey: ['id'])
      .order('created_at', ascending: false);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF020617) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('CRISIS BRAIN V3.4'),
        titleTextStyle: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w900,
          letterSpacing: 2,
          color: isDark ? Colors.purple.shade300 : Colors.purple.shade700,
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: _alertsStream,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final alerts = snapshot.data ?? [];
          final activeAlerts = alerts.where((a) => a['status'] == 'active').length;

          // Process simple risk zones based on alert types
          final Map<String, int> typeCounts = {};
          for (var alert in alerts) {
            final type = alert['type'] ?? 'unknown';
            typeCounts[type] = (typeCounts[type] ?? 0) + 1;
          }

          final sortedTypes = typeCounts.entries.toList()
            ..sort((a, b) => b.value.compareTo(a.value));

          return ListView(
            padding: const EdgeInsets.all(24),
            children: [
              // AI Header
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF9333EA), Color(0xFF4F46E5)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF9333EA).withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    )
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.psychology_rounded, color: Colors.white, size: 40),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'AI PREDICTIVE ENGINE',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                             'System Analyzing',
                             style: TextStyle(
                               color: Colors.white,
                               fontSize: 20,
                               fontWeight: FontWeight.bold,
                             ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                             '$activeAlerts active risk vectors detected',
                             style: const TextStyle(
                               color: Colors.white,
                               fontSize: 12,
                             ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              Text(
                'HIGH-RISK ZONES',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 16),
              
              if (sortedTypes.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Text('Insufficient data to map risk zones.', style: TextStyle(color: isDark ? Colors.white54 : Colors.grey)),
                  ),
                )
              else
                ...sortedTypes.take(3).map((entry) {
                   return Container(
                     margin: const EdgeInsets.only(bottom: 12),
                     padding: const EdgeInsets.all(20),
                     decoration: BoxDecoration(
                       color: isDark ? const Color(0xFF1E293B) : Colors.white,
                       borderRadius: BorderRadius.circular(20),
                       border: Border.all(color: isDark ? Colors.white10 : Colors.grey.shade200),
                     ),
                     child: Row(
                       children: [
                         Container(
                           padding: const EdgeInsets.all(10),
                           decoration: BoxDecoration(
                             color: Colors.orange.withOpacity(0.1),
                             shape: BoxShape.circle,
                           ),
                           child: const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 24),
                         ),
                         const SizedBox(width: 16),
                         Expanded(
                           child: Column(
                             crossAxisAlignment: CrossAxisAlignment.start,
                             children: [
                               Text(
                                 entry.key.toString().toUpperCase(),
                                 style: TextStyle(
                                   fontSize: 16,
                                   fontWeight: FontWeight.bold,
                                   color: isDark ? Colors.white : const Color(0xFF0F172A),
                                 ),
                               ),
                               const SizedBox(height: 4),
                               Text(
                                 'Probability index: High',
                                 style: TextStyle(
                                   fontSize: 12,
                                   color: isDark ? Colors.white60 : Colors.blueGrey,
                                 ),
                               ),
                             ],
                           ),
                         ),
                         Text(
                           '${entry.value} incidents',
                           style: TextStyle(
                             fontSize: 14,
                             fontWeight: FontWeight.w900,
                             color: isDark ? Colors.orange.shade300 : Colors.orange.shade700,
                           ),
                         ),
                       ],
                     ),
                   );
                }).toList(),

              const SizedBox(height: 32),
              Text(
                'PEAK ACTIVITY TIMELINE',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 16),
              
              Container(
                 padding: const EdgeInsets.all(24),
                 decoration: BoxDecoration(
                   color: isDark ? const Color(0xFF111827) : Colors.white,
                   borderRadius: BorderRadius.circular(24),
                   border: Border.all(color: isDark ? Colors.white10 : Colors.grey.shade200),
                 ),
                 child: Column(
                   children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                           _buildTimeSlot('00:00', 0.2, isDark),
                           _buildTimeSlot('06:00', 0.1, isDark),
                           _buildTimeSlot('12:00', 0.6, isDark),
                           _buildTimeSlot('18:00', 0.9, isDark),
                           _buildTimeSlot('23:00', 0.4, isDark),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.insights_rounded, color: Colors.purple, size: 16),
                          const SizedBox(width: 8),
                          Text(
                            'Highest risk window: 18:00 - 22:00',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white70 : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                   ],
                 ),
              ),
              const SizedBox(height: 40),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTimeSlot(String label, double intensity, bool isDark) {
    return Column(
      children: [
        Container(
          width: 8,
          height: 60,
          decoration: BoxDecoration(
            color: isDark ? Colors.white10 : Colors.grey.shade200,
            borderRadius: BorderRadius.circular(4),
          ),
          alignment: Alignment.bottomCenter,
          child: Container(
            width: 8,
            height: 60 * intensity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.purple.shade400, Colors.red.shade400],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
             fontSize: 10,
             fontWeight: FontWeight.bold,
             color: isDark ? Colors.white54 : Colors.grey,
          ),
        ),
      ],
    );
  }
}
