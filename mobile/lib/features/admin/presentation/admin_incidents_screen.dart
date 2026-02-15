import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../core/config/supabase_config.dart';

class AdminIncidentsScreen extends StatelessWidget {
  const AdminIncidentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Incident Management'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Open'),
              Tab(text: 'In Progress'),
              Tab(text: 'Closed'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _IncidentList(statusFilter: 'open'),
            _IncidentList(statusFilter: 'inProgress'),
            _IncidentList(statusFilter: 'closed'),
          ],
        ),
      ),
    );
  }
}

class _IncidentList extends StatelessWidget {
  final String statusFilter;

  const _IncidentList({required this.statusFilter});

  @override
  Widget build(BuildContext context) {
    final stream = SupabaseConfig.client
        .from('incident_reports')
        .stream(primaryKey: ['id'])
        .eq('status', statusFilter)
        .order('created_at', ascending: false);

    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: stream,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }

        final reports = snapshot.data!;
        if (reports.isEmpty) {
          return const Center(child: Text('No reports found.'));
        }

        return ListView.builder(
          padding: const EdgeInsets.all(8),
          itemCount: reports.length,
          itemBuilder: (context, index) {
            final report = reports[index];
            final date = DateTime.parse(report['created_at'].toString());

            return Card(
              margin: const EdgeInsets.symmetric(vertical: 4),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: _getStatusColor(report['status']).withOpacity(0.1),
                  child: Icon(Icons.report, color: _getStatusColor(report['status'])),
                ),
                title: Text(
                  report['description'] ?? 'No description',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ID: ${report['id'].toString().substring(0, 8)}...'),
                    Text(DateFormat('MMM d, y h:mm a').format(date)),
                  ],
                ),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  context.push('/admin/incidents/detail', extra: report);
                },
              ),
            );
          },
        );
      },
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'open': return Colors.red;
      case 'inProgress': return Colors.blue;
      case 'closed': return Colors.green;
      default: return Colors.grey;
    }
  }
}
