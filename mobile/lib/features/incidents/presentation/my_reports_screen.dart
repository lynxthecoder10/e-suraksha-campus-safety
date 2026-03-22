import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import '../../../core/config/supabase_config.dart';

class MyReportsScreen extends StatefulWidget {
  const MyReportsScreen({super.key});

  @override
  State<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen> {
  late final Stream<List<Map<String, dynamic>>> _myReportsStream;

  @override
  void initState() {
    super.initState();
    final userId = SupabaseConfig.client.auth.currentUser?.id;
    _myReportsStream = SupabaseConfig.client
        .from('incident_reports')
        .stream(primaryKey: ['id'])
        .eq('reporter_id', userId ?? '')
        .order('created_at', ascending: false);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF020617) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('MY REPORTS'),
        titleTextStyle: TextStyle(
          fontSize: 14, 
          fontWeight: FontWeight.w900, 
          letterSpacing: 2, 
          color: isDark ? Colors.white70 : const Color(0xFF64748B)
        ),
      ),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: _myReportsStream,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.red)));
          }
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final reports = snapshot.data!;
          if (reports.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.assignment_turned_in_rounded, size: 64, color: isDark ? Colors.white10 : Colors.grey.shade200),
                  const SizedBox(height: 16),
                  Text(
                    'No reports submitted yet',
                    style: TextStyle(color: isDark ? Colors.white24 : Colors.grey, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: reports.length,
            padding: const EdgeInsets.all(24),
            itemBuilder: (context, index) {
              final report = reports[index];
              final date = DateTime.parse(report['created_at']);
              final formattedDate = DateFormat.yMMMd().add_jm().format(date);
              final status = (report['status'] ?? 'open').toString().toLowerCase();

              return Container(
                margin: const EdgeInsets.only(bottom: 20),
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
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _getStatusColor(status).withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  status.toUpperCase(),
                                  style: TextStyle(
                                    color: _getStatusColor(status),
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ),
                              Text(
                                formattedDate,
                                style: TextStyle(
                                  fontSize: 10,
                                  color: isDark ? Colors.white24 : Colors.grey.shade400,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            report['description'] ?? 'No Description',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: isDark ? Colors.white : const Color(0xFF1E293B),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (report['admin_comments'] != null)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.blue.withOpacity(0.1)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.comment_rounded, size: 14, color: Colors.blue),
                                SizedBox(width: 8),
                                Text(
                                  'ADMIN RESPONSE',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.blue,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              report['admin_comments'],
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark ? Colors.white70 : Colors.black87,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 8),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      child: Row(
                        children: [
                          Icon(Icons.location_on_rounded, size: 14, color: isDark ? Colors.white24 : Colors.grey.shade300),
                          const SizedBox(width: 6),
                          Text(
                            'Campus Sector ${report['latitude'].toString().substring(0, 4)}',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.white24 : Colors.grey.shade400,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
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
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'resolved':
        return Colors.green;
      case 'investigating':
        return Colors.blue;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }
}
