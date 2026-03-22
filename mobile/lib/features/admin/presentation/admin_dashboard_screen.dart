import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/supabase_config.dart';
import '../../../core/theme/app_theme.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF020617) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('ADMIN CONSOLE'),
        titleTextStyle: TextStyle(
          fontSize: 14, 
          fontWeight: FontWeight.w900, 
          letterSpacing: 2, 
          color: isDark ? Colors.white70 : const Color(0xFF64748B)
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_outlined),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          // Dashboard Header
          Text(
            'System Overview',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 24),

          // Stats Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1.4,
            children: [
              _buildStatCard(
                title: 'ACTIVE ALERTS',
                value: '0',
                icon: Icons.notifications_active_rounded,
                color: Colors.red,
                isDark: isDark,
                stream: SupabaseConfig.client.from('alerts').stream(primaryKey: ['id']).eq('status', 'active'),
              ),
              _buildStatCard(
                title: 'TOTAL USERS',
                value: '0',
                icon: Icons.people_rounded,
                color: Colors.blue,
                isDark: isDark,
                stream: SupabaseConfig.client.from('profiles').stream(primaryKey: ['id']),
              ),
              _buildStatCard(
                title: 'OPEN REPORTS',
                value: '0',
                icon: Icons.assignment_rounded,
                color: Colors.orange,
                isDark: isDark,
                stream: SupabaseConfig.client.from('incident_reports').stream(primaryKey: ['id']).eq('status', 'open'),
              ),
              _buildStatCard(
                title: 'MESH NODES',
                value: '24',
                icon: Icons.hub_rounded,
                color: Colors.teal,
                isDark: isDark,
              ),
            ],
          ),

          const SizedBox(height: 32),
          Text(
            'CONTROL PANELS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 16),

          _AdminCategoryCard(
            title: 'Incident Management',
            description: 'Monitor, update, and resolve campus safety reports.',
            icon: Icons.security_rounded,
            color: Colors.orange,
            isDark: isDark,
            onTap: () => context.push('/admin/incidents'),
          ),
          const SizedBox(height: 12),
          _AdminCategoryCard(
            title: 'Identity Verification',
            description: 'Verify student digital IDs and access permissions.',
            icon: Icons.qr_code_scanner_rounded,
            color: Colors.indigo,
            isDark: isDark,
            onTap: () => context.push('/admin/scan'),
          ),
          const SizedBox(height: 12),
          _AdminCategoryCard(
            title: 'User Access Control',
            description: 'Manage user roles, status, and account security.',
            icon: Icons.manage_accounts_rounded,
            color: Colors.blue,
            isDark: isDark,
            onTap: () => context.push('/admin/users'),
          ),
          const SizedBox(height: 12),
          _AdminCategoryCard(
            title: 'System Analytics',
            description: 'Heatmaps and crisis predictions (Crisis Brain).',
            icon: Icons.analytics_rounded,
            color: Colors.purple,
            isDark: isDark,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Crisis Brain v3.4 Coming Soon')),
              );
            },
          ),
          const SizedBox(height: 40),
          
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(100),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle_rounded, color: Colors.green, size: 14),
                  SizedBox(width: 8),
                  Text(
                    'SYSTEMS OPERATIONAL',
                    style: TextStyle(
                      color: Colors.green,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
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
    Stream<List<Map<String, dynamic>>>? stream,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111827) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(isDark ? 0.2 : 0.02), blurRadius: 10, offset: const Offset(0, 4))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              Icon(Icons.trending_up, color: Colors.green.withOpacity(0.5), size: 14),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              stream != null
                ? StreamBuilder<List<Map<String, dynamic>>>(
                    stream: stream,
                    builder: (context, snapshot) {
                      final count = snapshot.data?.length ?? 0;
                      return Text(
                        count.toString(),
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                        ),
                      );
                    },
                  )
                : Text(
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
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AdminCategoryCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;

  const _AdminCategoryCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111827) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(isDark ? 0.2 : 0.02), blurRadius: 10, offset: const Offset(0, 4))
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(icon, color: color, size: 28),
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
                          fontWeight: FontWeight.w800,
                          color: isDark ? Colors.white : const Color(0xFF1E293B),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        description,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.white60 : const Color(0xFF64748B),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 14,
                  color: isDark ? Colors.white24 : const Color(0xFFCBD5E1),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
