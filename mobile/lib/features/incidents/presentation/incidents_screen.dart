import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/supabase_config.dart';
import 'package:intl/intl.dart';

class IncidentsListScreen extends StatefulWidget {
  const IncidentsListScreen({super.key});

  @override
  State<IncidentsListScreen> createState() => _IncidentsListScreenState();
}

class _IncidentsListScreenState extends State<IncidentsListScreen> {
  final _incidentsStream = SupabaseConfig.client
      .from('incident_reports')
      .stream(primaryKey: ['id'])
      .order('created_at', ascending: false);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Community Reports')),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: _incidentsStream,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final incidents = snapshot.data!;
          if (incidents.isEmpty) {
            return const Center(child: Text('No incidents reported yet.'));
          }
          return ListView.builder(
            itemCount: incidents.length,
            padding: const EdgeInsets.all(16),
            itemBuilder: (context, index) {
              final incident = incidents[index];
              final date = DateTime.parse(incident['created_at']);
              final formattedDate = DateFormat.yMMMd().add_jm().format(date);

              return Card(
                elevation: 2,
                margin: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: Colors.orangeAccent,
                        child: Icon(Icons.report, color: Colors.white),
                      ),
                      title: Text(incident['description'] ?? 'No Description'),
                      subtitle: Text(formattedDate),
                      trailing: Chip(
                        label: Text(incident['status'] ?? 'open'),
                        backgroundColor: _getStatusColor(incident['status']),
                      ),
                    ),
                    if (incident['media_urls'] != null && (incident['media_urls'] as List).isNotEmpty)
                      Container(
                        height: 150,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                        ),
                        child: Image.network(
                          (incident['media_urls'] as List).first,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Center(child: Icon(Icons.broken_image)),
                        ),
                      ),
                     Padding(
                       padding: const EdgeInsets.all(12.0),
                       child: Row(
                         children: [
                           const Icon(Icons.location_on, size: 16, color: Colors.grey),
                           const SizedBox(width: 4),
                           Text('Lat: ${incident['latitude'].toStringAsFixed(4)}, Lng: ${incident['longitude'].toStringAsFixed(4)}', style: const TextStyle(color: Colors.grey)),
                         ],
                       ),
                     ),
                  ],
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/incidents/add'),
        icon: const Icon(Icons.add),
        label: const Text('Report'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'resolved':
        return Colors.green.shade100;
      case 'in_progress':
        return Colors.blue.shade100;
      default:
        return Colors.orange.shade100;
    }
  }
}
