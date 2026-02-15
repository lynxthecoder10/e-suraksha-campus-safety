import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import '../../../../core/config/supabase_config.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Determine status color helper
    Color getStatusColor(String type) {
      switch (type) {
        case 'medical': return Colors.red;
        case 'fire': return Colors.orange;
        case 'security': return Colors.blue;
        default: return Colors.grey;
      }
    }

    IconData getStatusIcon(String type) {
      switch (type) {
        case 'medical': return Icons.medical_services;
        case 'fire': return Icons.local_fire_department;
        case 'security': return Icons.security;
        default: return Icons.notifications;
      }
    }

    final alertsStream = SupabaseConfig.client
        .from('alerts')
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false)
        .limit(20);

    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: alertsStream,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
             return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData) {
             return const Center(child: CircularProgressIndicator());
          }
          
          final alerts = snapshot.data!;
          
          if (alerts.isEmpty) {
             return const Center(child: Text('No notifications received'));
          }

          return ListView.builder(
            itemCount: alerts.length,
            itemBuilder: (context, index) {
              final alert = alerts[index];
              final type = alert['type'] as String;
              final date = DateTime.fromMillisecondsSinceEpoch((alert['created_at'] is int) ? alert['created_at'] : DateTime.parse(alert['created_at'].toString()).millisecondsSinceEpoch);
              
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: getStatusColor(type).withOpacity(0.1),
                  child: Icon(getStatusIcon(type), color: getStatusColor(type)),
                ),
                title: Text('${type.toUpperCase()} ALERT', style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(alert['extra_data'] ?? 'Emergency reported'),
                trailing: Text(DateFormat('h:mm a').format(date), style: const TextStyle(color: Colors.grey, fontSize: 12)),
              );
            },
          );
        },
      ),
    );
  }
}
