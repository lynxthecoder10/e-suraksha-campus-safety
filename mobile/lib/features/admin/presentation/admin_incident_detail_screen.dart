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
          SnackBar(content: Text('Status updated to ${newStatus.toUpperCase()}')),
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
      final user = SupabaseConfig.client.auth.currentUser;
      
      await SupabaseConfig.client.from('report_comments').insert({
        'report_id': widget.report['id'],
        'user_id': user?.id,
        'content': comment,
      });

      _commentController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Comment added successfully')),
        );
      }
    } catch (e) {
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final date = DateTime.parse(widget.report['created_at'].toString());
    final formattedDate = DateFormat.yMMMd().add_jm().format(date);
    
    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF020617) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('INCIDENT REPORT'),
        titleTextStyle: TextStyle(
          fontSize: 14, 
          fontWeight: FontWeight.w900, 
          letterSpacing: 2, 
          color: isDark ? Colors.white70 : const Color(0xFF64748B)
        ),
      ),
      body: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.all(24),
            children: [
              // Incident Info Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF111827) : Colors.white,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(isDark ? 0.3 : 0.03), blurRadius: 20, offset: const Offset(0, 10))
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _getStatusColor(_currentStatus).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            _currentStatus.toUpperCase(),
                            style: TextStyle(
                              color: _getStatusColor(_currentStatus),
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                        Text(
                          formattedDate,
                          style: TextStyle(fontSize: 11, color: isDark ? Colors.white24 : Colors.grey.shade400, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Text(
                      widget.report['description'] ?? 'No Description Provided',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Divider(height: 1, color: Colors.white10),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Icon(Icons.location_on_rounded, size: 18, color: Colors.blue.shade400),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'LOCATION DETAILS',
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: isDark ? Colors.white38 : Colors.grey.shade400, letterSpacing: 1),
                            ),
                            Text(
                              'Lat: ${widget.report['latitude'].toStringAsFixed(4)}, Lng: ${widget.report['longitude'].toStringAsFixed(4)}',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isDark ? Colors.white70 : Colors.black87),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Status Management
              Text('WORKFLOW ACTIONS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: isDark ? Colors.white38 : const Color(0xFF94A3B8), letterSpacing: 1.5)),
              const SizedBox(height: 16),
              Row(
                children: [
                  _buildActionButton(
                    label: 'INVESTIGATE',
                    icon: Icons.search_rounded,
                    color: Colors.blue,
                    isActive: _currentStatus == 'investigating',
                    onTap: () => _updateStatus('investigating'),
                  ),
                  const SizedBox(width: 12),
                  _buildActionButton(
                    label: 'RESOLVE',
                    icon: Icons.check_circle_rounded,
                    color: Colors.green,
                    isActive: _currentStatus == 'resolved',
                    onTap: () => _updateStatus('resolved'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildActionButton(
                label: 'REJECT / SPAM',
                icon: Icons.block_flipped,
                color: Colors.red,
                isActive: _currentStatus == 'rejected',
                onTap: () => _updateStatus('rejected'),
                isFullWidth: true,
              ),
              
              const SizedBox(height: 40),
              
              // Comments Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('ADMIN ACTIVITY LOG', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: isDark ? Colors.white38 : const Color(0xFF94A3B8), letterSpacing: 1.5)),
                  StreamBuilder<List<Map<String, dynamic>>>(
                    stream: SupabaseConfig.client.from('report_comments').stream(primaryKey: ['id']).eq('report_id', widget.report['id']),
                    builder: (context, snapshot) => Text(
                      '${snapshot.data?.length ?? 0} NOTES',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.blue),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _CommentsList(reportId: widget.report['id']),
              const SizedBox(height: 100), // Space for input
            ],
          ),
          
          // Comment Input Overlay
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(context).padding.bottom + 16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : Colors.white,
                border: Border(top: BorderSide(color: isDark ? Colors.white10 : Colors.black12)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: TextField(
                        controller: _commentController,
                        style: TextStyle(color: isDark ? Colors.white : Colors.black87),
                        decoration: const InputDecoration(
                          hintText: 'Add an administrative note...',
                          hintStyle: TextStyle(fontSize: 14, color: Colors.grey),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: _addComment,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          if (_isLoading)
            Container(
              color: Colors.black26,
              child: const Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required IconData icon,
    required Color color,
    required bool isActive,
    required VoidCallback onTap,
    bool isFullWidth = false,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Expanded(
      flex: isFullWidth ? 1 : 1,
      child: InkWell(
        onTap: isActive ? null : onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: isFullWidth ? double.infinity : null,
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isActive ? color : color.withOpacity(0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isActive ? color : color.withOpacity(0.2)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 18, color: isActive ? Colors.white : color),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: isActive ? Colors.white : color,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
        ),
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

class _CommentsList extends StatelessWidget {
  final dynamic reportId;
  const _CommentsList({required this.reportId});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final stream = SupabaseConfig.client
        .from('report_comments')
        .stream(primaryKey: ['id'])
        .eq('report_id', reportId)
        .order('created_at', ascending: true);

    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: stream,
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 32),
              child: Text(
                'NO RECENT ACTIVITY',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: isDark ? Colors.white10 : Colors.grey.shade200, letterSpacing: 1),
              ),
            ),
          );
        }
        final comments = snapshot.data!;
        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: comments.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final c = comments[index];
            final time = DateFormat('h:mm a').format(DateTime.parse(c['created_at'].toString()));
            
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF111827) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 10,
                            backgroundColor: Colors.blue.withOpacity(0.1),
                            child: const Icon(Icons.person_rounded, size: 12, color: Colors.blue),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'ADMINISTRATOR',
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.blue, letterSpacing: 0.5),
                          ),
                        ],
                      ),
                      Text(
                        time,
                        style: TextStyle(fontSize: 10, color: isDark ? Colors.white24 : Colors.grey.shade400, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    c['content'] ?? '',
                    style: TextStyle(fontSize: 14, color: isDark ? Colors.white70 : Colors.black87, height: 1.4),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
