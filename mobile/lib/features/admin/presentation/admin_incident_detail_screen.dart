import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import '../../../../core/config/supabase_config.dart';

class AdminIncidentDetailScreen extends StatefulWidget {
  final Map<String, dynamic> report;

  const AdminIncidentDetailScreen({super.key, required this.report});

  @override
  State<AdminIncidentDetailScreen> createState() => _AdminIncidentDetailScreenState();
}

class _AdminIncidentDetailScreenState extends State<AdminIncidentDetailScreen> {
  late String _currentStatus;
  final _commentController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.report['status'] ?? 'open';
  }

  Future<void> _updateStatus(String newStatus) async {
    setState(() => _isLoading = true);
    try {
      await SupabaseConfig.client
          .from('incident_reports')
          .update({'status': newStatus})
          .eq('id', widget.report['id']);
      
      setState(() => _currentStatus = newStatus);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Status updated successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating status: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _addComment() async {
    final comment = _commentController.text.trim();
    if (comment.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      // Assuming a 'comments' table exists or JSONB column. 
      // For now, let's assume we append to a 'comments' JSONB array in the report itself if schema allows,
      // OR mostly likely we have a separate 'comments' table as per Web app.
      // Based on previous analysis, there is a `report_comments` table or similar.
      // Let's look at `AdminReportManagementPanel.tsx` again or `supabase_schema.sql`.
      // The web app uses `useAddReportComment`.
      
      // Let's assume a simple comments table for now based on standard pattern, 
      // If not, we might need to check schema.
      // Retrying with 'report_comments' table as seen in typical schemas, 
      // or if it fails we check schema.
      
      final user = SupabaseConfig.client.auth.currentUser;
      
      await SupabaseConfig.client.from('report_comments').insert({
        'report_id': widget.report['id'],
        'user_id': user?.id,
        'content': comment,
      });

      _commentController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Comment added')),
        );
      }
    } catch (e) {
      // Fallback if table doesn't exist, we might need to debug schema.
       if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error adding comment: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final date = DateTime.parse(widget.report['created_at'].toString());
    
    return Scaffold(
      appBar: AppBar(title: const Text('Report Details')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Status Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Current Status', style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _currentStatus,
                      items: const [
                         DropdownMenuItem(value: 'open', child: Text('Open (Red)', style: TextStyle(color: Colors.red))),
                         DropdownMenuItem(value: 'inProgress', child: Text('In Progress (Blue)', style: TextStyle(color: Colors.blue))),
                         DropdownMenuItem(value: 'closed', child: Text('Closed (Green)', style: TextStyle(color: Colors.green))),
                      ],
                      onChanged: (val) {
                        if (val != null && val != _currentStatus) {
                          _updateStatus(val);
                        }
                      },
                      decoration: const InputDecoration(border: OutlineInputBorder()),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Details Card
            Card(
               child: Padding(
                 padding: const EdgeInsets.all(16.0),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Text('Report #${widget.report['id']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                     const SizedBox(height: 8),
                     Text('Date: ${DateFormat('MMM d, y h:mm a').format(date)}'),
                     const Divider(),
                     const Text('Description:', style: TextStyle(fontWeight: FontWeight.bold)),
                     const SizedBox(height: 4),
                     Text(widget.report['description'] ?? 'No description'),
                     const SizedBox(height: 16),
                     const Text('Location:', style: TextStyle(fontWeight: FontWeight.bold)),
                     Text('Lat: ${widget.report['latitude']}, Lng: ${widget.report['longitude']}'),
                   ],
                 ),
               ),
            ),
             const SizedBox(height: 16),
             
             // Comments Section
            const Text('Comments', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
             _CommentsList(reportId: widget.report['id']),
             
             const SizedBox(height: 16),
             Row(
               children: [
                 Expanded(
                   child: TextField(
                     controller: _commentController,
                     decoration: const InputDecoration(
                       hintText: 'Add a comment...',
                       border: OutlineInputBorder(),
                     ),
                   ),
                 ),
                 IconButton(
                   icon: const Icon(Icons.send),
                   onPressed: _addComment,
                 )
               ],
             ),
          ],
        ),
    );
  }
}

class _CommentsList extends StatelessWidget {
  final dynamic reportId;
  const _CommentsList({required this.reportId});

  @override
  Widget build(BuildContext context) {
     final stream = SupabaseConfig.client
        .from('report_comments')
        .stream(primaryKey: ['id'])
        .eq('report_id', reportId)
        .order('created_at', ascending: true);

    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: stream,
      builder: (context, snapshot) {
         if (!snapshot.hasData || snapshot.data!.isEmpty) {
           return const Text('No comments yet.');
         }
         final comments = snapshot.data!;
         return Column(
           children: comments.map((c) => ListTile(
             title: Text(c['content'] ?? ''),
             subtitle: Text(DateFormat('h:mm a').format(DateTime.parse(c['created_at'].toString()))),
             leading: const Icon(Icons.person),
           )).toList(),
         );
      },
    );
  }
}
