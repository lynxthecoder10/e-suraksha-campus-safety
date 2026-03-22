import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class IoTDevicesScreen extends StatefulWidget {
  const IoTDevicesScreen({super.key});

  @override
  State<IoTDevicesScreen> createState() => _IoTDevicesScreenState();
}

class _IoTDevicesScreenState extends State<IoTDevicesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _panicPoles = [
    {
      'id': 'PP-101',
      'location': 'Library Plaza',
      'status': 'active',
      'lastMaintenance': '2023-11-15'
    },
    {
      'id': 'PP-102',
      'location': 'North Parking Lot',
      'status': 'offline',
      'lastMaintenance': '2023-10-02'
    },
    {
      'id': 'PP-103',
      'location': 'Science Building C',
      'status': 'triggered',
      'lastMaintenance': '2023-12-01'
    },
  ];

  final List<Map<String, dynamic>> _smartLocks = [
    {
      'id': 'SL-201',
      'location': 'Main Server Room',
      'status': 'locked',
      'lastAccess': '10 Mins ago'
    },
    {
      'id': 'SL-202',
      'location': 'Chemistry Lab Support',
      'status': 'unlocked',
      'lastAccess': '1 Hour ago'
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
      case 'locked':
        return Colors.green;
      case 'triggered':
        return Colors.red;
      case 'unlocked':
        return Colors.orange;
      case 'offline':
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF020617) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('IOT DEVICES'),
        titleTextStyle: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w900,
          letterSpacing: 2,
          color: isDark ? Colors.blue.shade300 : Colors.blue.shade700,
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => context.pop(),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: isDark ? Colors.blue.shade300 : Colors.blue.shade700,
          unselectedLabelColor: isDark ? Colors.white54 : Colors.grey,
          indicatorColor: isDark ? Colors.blue.shade300 : Colors.blue.shade700,
          tabs: const [
            Tab(icon: Icon(Icons.location_on_rounded), text: 'Poles'),
            Tab(icon: Icon(Icons.watch_rounded), text: 'Wearables'),
            Tab(icon: Icon(Icons.lock_rounded), text: 'Locks'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Panic Poles Tab
          ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _panicPoles.length,
            itemBuilder: (context, index) {
              final pole = _panicPoles[index];
              final color = _getStatusColor(pole['status'] as String);
              return _buildDeviceCard(
                title: 'Panic Pole ${pole['id']}',
                subtitle: pole['location'] as String,
                details: 'Maintenance: ${pole['lastMaintenance']}',
                status: pole['status'] as String,
                color: color,
                icon: Icons.location_on_rounded,
                isDark: isDark,
              );
            },
          ),
          
          // Wearables Tab (Empty State)
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.watch_off_rounded, size: 60, color: isDark ? Colors.white24 : Colors.grey.shade300),
                const SizedBox(height: 16),
                Text('No wearables connected', style: TextStyle(color: isDark ? Colors.white54 : Colors.grey)),
              ],
            ),
          ),
          
          // Smart Locks Tab
          ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _smartLocks.length,
            itemBuilder: (context, index) {
              final lock = _smartLocks[index];
              final color = _getStatusColor(lock['status'] as String);
              return _buildDeviceCard(
                title: 'Smart Lock ${lock['id']}',
                subtitle: lock['location'] as String,
                details: 'Last access: ${lock['lastAccess']}',
                status: lock['status'] as String,
                color: color,
                icon: lock['status'] == 'locked' ? Icons.lock_rounded : Icons.lock_open_rounded,
                isDark: isDark,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceCard({
    required String title,
    required String subtitle,
    required String details,
    required String status,
    required Color color,
    required IconData icon,
    required bool isDark,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.white10 : Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? Colors.white70 : Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  details,
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? Colors.white38 : Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              status.toUpperCase(),
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
