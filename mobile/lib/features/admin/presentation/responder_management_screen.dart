import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class Responder {
  final String id;
  final String name;
  final String role;
  bool onDuty;
  final int assignedIncidents;
  final String lastActive;

  Responder({
    required this.id,
    required this.name,
    required this.role,
    required this.onDuty,
    required this.assignedIncidents,
    required this.lastActive,
  });
}

class ResponderManagementScreen extends StatefulWidget {
  const ResponderManagementScreen({super.key});

  @override
  State<ResponderManagementScreen> createState() => _ResponderManagementScreenState();
}

class _ResponderManagementScreenState extends State<ResponderManagementScreen> {
  final List<Responder> _responders = [
    Responder(
      id: '1',
      name: 'Officer John Smith',
      role: 'Security',
      onDuty: true,
      assignedIncidents: 2,
      lastActive: 'Just now',
    ),
    Responder(
      id: '2',
      name: 'Dr. Sarah Johnson',
      role: 'Medical',
      onDuty: true,
      assignedIncidents: 1,
      lastActive: '1 hr ago',
    ),
    Responder(
      id: '3',
      name: 'Officer Mike Davis',
      role: 'Security',
      onDuty: false,
      assignedIncidents: 0,
      lastActive: '2 hrs ago',
    ),
  ];

  void _toggleDutyStatus(int index) {
    setState(() {
      _responders[index].onDuty = !_responders[index].onDuty;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Duty status updated')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    final onDutyCount = _responders.where((r) => r.onDuty).length;
    final totalIncidents = _responders.fold(0, (sum, r) => sum + r.assignedIncidents);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF020617) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('RESPONDERS'),
        titleTextStyle: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w900,
          letterSpacing: 2,
          color: isDark ? Colors.red.shade300 : Colors.red.shade700,
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          // Top Stats Row
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  title: 'Total',
                  value: _responders.length.toString(),
                  icon: Icons.people_alt_rounded,
                  color: Colors.blue,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  title: 'On Duty',
                  value: onDutyCount.toString(),
                  icon: Icons.how_to_reg_rounded,
                  color: Colors.green,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  title: 'Active Tasks',
                  value: totalIncidents.toString(),
                  icon: Icons.warning_rounded,
                  color: Colors.red,
                  isDark: isDark,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 32),
          Text(
            'RESPONDER LIST',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 16),
          
          ...List.generate(_responders.length, (index) {
             final responder = _responders[index];
             return Container(
               margin: const EdgeInsets.only(bottom: 12),
               padding: const EdgeInsets.all(16),
               decoration: BoxDecoration(
                 color: isDark ? const Color(0xFF1E293B) : Colors.white,
                 borderRadius: BorderRadius.circular(20),
                 border: Border.all(color: isDark ? Colors.white10 : Colors.grey.shade200),
               ),
               child: Row(
                 children: [
                   CircleAvatar(
                     radius: 24,
                     backgroundColor: Colors.blue.withOpacity(0.1),
                     child: Text(
                       responder.name.split(' ').map((e) => e[0]).take(2).join(''),
                       style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue),
                     ),
                   ),
                   const SizedBox(width: 16),
                   Expanded(
                     child: Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         Text(
                           responder.name,
                           style: TextStyle(
                             fontSize: 16,
                             fontWeight: FontWeight.bold,
                             color: isDark ? Colors.white : const Color(0xFF0F172A),
                           ),
                         ),
                         const SizedBox(height: 4),
                         Row(
                           children: [
                             Container(
                               padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                               decoration: BoxDecoration(
                                 color: isDark ? Colors.black26 : Colors.grey.shade100,
                                 borderRadius: BorderRadius.circular(4),
                               ),
                               child: Text(
                                 responder.role,
                                 style: TextStyle(fontSize: 10, color: isDark ? Colors.white70 : Colors.blueGrey),
                               ),
                             ),
                             if (responder.assignedIncidents > 0) ...[
                               const SizedBox(width: 8),
                               Container(
                                 padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                 decoration: BoxDecoration(
                                   color: Colors.red.withOpacity(0.1),
                                   borderRadius: BorderRadius.circular(4),
                                 ),
                                 child: Text(
                                   '${responder.assignedIncidents} assigned',
                                   style: const TextStyle(fontSize: 10, color: Colors.red),
                                 ),
                               ),
                             ],
                           ],
                         ),
                         const SizedBox(height: 6),
                         Text(
                           'Last active: ${responder.lastActive}',
                           style: TextStyle(fontSize: 11, color: isDark ? Colors.white38 : Colors.grey),
                         ),
                       ],
                     ),
                   ),
                   Column(
                     crossAxisAlignment: CrossAxisAlignment.end,
                     children: [
                       Text(
                         responder.onDuty ? 'On Duty' : 'Off Duty',
                         style: TextStyle(
                           fontSize: 10,
                           fontWeight: FontWeight.bold,
                           color: responder.onDuty ? Colors.green : Colors.grey,
                         ),
                       ),
                       const SizedBox(height: 4),
                       Switch(
                         value: responder.onDuty,
                         onChanged: (val) => _toggleDutyStatus(index),
                         activeColor: Colors.green,
                       ),
                     ],
                   ),
                 ],
               ),
             );
          })
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111827) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? Colors.white10 : Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          Text(
            title,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white60 : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}
