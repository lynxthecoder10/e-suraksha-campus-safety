import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Console'),
        backgroundColor: Colors.red.shade900,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _AdminMenuCard(
            title: 'Incident Management',
            icon: Icons.report_problem,
            color: Colors.orange,
            description: 'View reports, update status, and add comments.',
            onTap: () => context.push('/admin/incidents'),
          ),
          const SizedBox(height: 16),
          _AdminMenuCard(
            title: 'User Management',
            icon: Icons.manage_accounts,
            color: Colors.blue,
            description: 'Manage roles and account status.',
            onTap: () => context.push('/admin/users'), 
          ),
          const SizedBox(height: 16),
          _AdminMenuCard(
            title: 'System Analytics',
            icon: Icons.bar_chart,
            color: Colors.purple,
            description: 'View system health and usage stats.',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Coming Soon')),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _AdminMenuCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final String description;
  final VoidCallback onTap;

  const _AdminMenuCard({
    required this.title,
    required this.icon,
    required this.color,
    required this.description,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}
