import 'package:e_suraksha_mobile/core/config/supabase_config.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_theme.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final _searchController = TextEditingController();
  final _usersStream = SupabaseConfig.client
      .from('profiles')
      .stream(primaryKey: ['id'])
      .order('created_at', ascending: false);

  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _updateRole(String userId, String newRole) async {
    try {
      await SupabaseConfig.client
          .from('profiles')
          .update({ 'role': newRole })
          .eq('id', userId);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Role updated to ${newRole.toUpperCase()}'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update role. Check permissions.'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _updateStatus(String userId, String currentStatus) async {
    final newStatus = currentStatus == 'active' ? 'suspended' : 'active';
    try {
      await SupabaseConfig.client
          .from('profiles')
          .update({ 'status': newStatus })
          .eq('id', userId);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('User ${newStatus == 'active' ? 'activated' : 'suspended'}'),
            backgroundColor: newStatus == 'active' ? Colors.green : Colors.orange,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update status.'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _showActionDialog(Map<String, dynamic> user, bool isDark) {
    String currentRole = user['role'] ?? 'user';
    String currentStatus = user['status'] ?? 'active';
    
    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: isDark ? Colors.white12 : Colors.grey.shade100,
                  radius: 28,
                  child: Text(
                    (user['name'] ?? '?')[0].toUpperCase(), 
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87)
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user['name'] ?? 'Unknown', 
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: isDark ? Colors.white : const Color(0xFF0F172A))
                      ),
                      Text(
                        'Current Role: ${currentRole.toUpperCase()}', 
                        style: TextStyle(color: isDark ? Colors.white60 : const Color(0xFF64748B), fontWeight: FontWeight.w600, fontSize: 13)
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            Text(
              'ROLE MANAGEMENT', 
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: isDark ? Colors.white38 : const Color(0xFF94A3B8), letterSpacing: 1.5)
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _roleChip(user['id'], 'user', currentRole, isDark),
                _roleChip(user['id'], 'admin', currentRole, isDark),
                _roleChip(user['id'], 'responder', currentRole, isDark),
                _roleChip(user['id'], 'security', currentRole, isDark),
              ],
            ),
            const SizedBox(height: 24),
            const Divider(height: 1, color: Colors.white10),
            const SizedBox(height: 24),
            Text(
              'ACCOUNT STATUS', 
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: isDark ? Colors.white38 : const Color(0xFF94A3B8), letterSpacing: 1.5)
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: (currentStatus == 'active' ? Colors.red : Colors.green).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  currentStatus == 'active' ? Icons.block_rounded : Icons.check_circle_rounded,
                  color: currentStatus == 'active' ? Colors.red : Colors.green,
                  size: 24,
                ),
              ),
              title: Text(
                currentStatus == 'active' ? 'Suspend Account' : 'Activate Account',
                style: TextStyle(
                  color: currentStatus == 'active' ? Colors.red : Colors.green,
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                ),
              ),
              subtitle: Text(
                currentStatus == 'active' 
                  ? 'User will lose access to the system.' 
                  : 'Restore full access for this user.',
                style: TextStyle(fontSize: 12, color: isDark ? Colors.white38 : const Color(0xFF94A3B8)),
              ),
              onTap: () {
                Navigator.pop(context);
                _updateStatus(user['id'], currentStatus);
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _roleChip(String userId, String role, String currentRole, bool isDark) {
    final isSelected = role == currentRole;
    return ChoiceChip(
      label: Text(role.toUpperCase()),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          Navigator.pop(context);
          _updateRole(userId, role);
        }
      },
      backgroundColor: isDark ? Colors.white.withOpacity(0.05) : Colors.grey.shade100,
      selectedColor: AppTheme.primaryColor.withOpacity(0.2),
      labelStyle: TextStyle(
        fontSize: 11,
        color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.white60 : Colors.black54),
        fontWeight: FontWeight.w900,
        letterSpacing: 0.5,
      ),
      side: BorderSide(
        color: isSelected ? AppTheme.primaryColor.withOpacity(0.5) : Colors.transparent,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      showCheckmark: false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF020617) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('USER MANAGEMENT'),
        titleTextStyle: TextStyle(
          fontSize: 14, 
          fontWeight: FontWeight.w900, 
          letterSpacing: 2, 
          color: isDark ? Colors.white70 : const Color(0xFF64748B)
        ),
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24.0),
            child: TextField(
              controller: _searchController,
              style: TextStyle(color: isDark ? Colors.white : Colors.black87),
              decoration: InputDecoration(
                hintText: 'Search by name or role...',
                hintStyle: TextStyle(color: isDark ? Colors.white24 : Colors.grey.shade400),
                prefixIcon: Icon(Icons.search_rounded, color: isDark ? Colors.white24 : Colors.grey.shade400),
                filled: true,
                fillColor: isDark ? const Color(0xFF111827) : Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: isDark ? const BorderSide(color: Colors.white10) : BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: isDark ? const BorderSide(color: Colors.white10) : BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 20),
              ),
            ),
          ),
          Expanded(
            child: StreamBuilder<List<Map<String, dynamic>>>(
              stream: _usersStream,
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return Center(child: Text('Error loading users', style: TextStyle(color: isDark ? Colors.white38 : Colors.grey)));
                }
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                final users = snapshot.data!;
                final filteredUsers = users.where((user) {
                  final name = (user['name'] ?? '').toString().toLowerCase();
                  final role = (user['role'] ?? '').toString().toLowerCase();
                  return name.contains(_searchQuery) || role.contains(_searchQuery);
                }).toList();

                if (filteredUsers.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                         Icon(Icons.person_off_rounded, size: 64, color: isDark ? Colors.white10 : Colors.grey.shade200),
                         const SizedBox(height: 16),
                         Text('No users found', style: TextStyle(color: isDark ? Colors.white24 : Colors.grey)),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  itemCount: filteredUsers.length,
                  itemBuilder: (context, index) {
                    final user = filteredUsers[index];
                    return _UserCard(
                      user: user,
                      isDark: isDark,
                      onEdit: () => _showActionDialog(user, isDark),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _UserCard extends StatelessWidget {
  final Map<String, dynamic> user;
  final bool isDark;
  final VoidCallback onEdit;

  const _UserCard({required this.user, required this.isDark, required this.onEdit});

  Color _getRoleColor(String role) {
    switch (role) {
      case 'admin': return Colors.red;
      case 'responder': return Colors.orange;
      case 'security': return Colors.blue;
      default: return Colors.teal;
    }
  }

  @override
  Widget build(BuildContext context) {
    final role = (user['role'] ?? 'user').toString();
    final status = (user['status'] ?? 'active').toString();
    final isSuspended = status != 'active';
    final roleColor = _getRoleColor(role);
    final isMe = user['id'] == SupabaseConfig.client.auth.currentUser?.id;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111827) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(isDark ? 0.3 : 0.02), blurRadius: 10, offset: const Offset(0, 4))
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onEdit,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 26,
                      backgroundColor: isSuspended ? (isDark ? Colors.white10 : Colors.grey.shade100) : roleColor.withOpacity(0.12),
                      child: Text(
                        (user['name'] ?? '?')[0].toUpperCase(),
                        style: TextStyle(
                          color: isSuspended ? (isDark ? Colors.white24 : Colors.grey) : roleColor, 
                          fontWeight: FontWeight.w900, 
                          fontSize: 20
                        ),
                      ),
                    ),
                    if (isSuspended)
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(color: isDark ? const Color(0xFF111827) : Colors.white, shape: BoxShape.circle),
                          child: const Icon(Icons.block_rounded, size: 12, color: Colors.red),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              user['name'] ?? 'Unknown User',
                              style: TextStyle(
                                fontWeight: FontWeight.w800, 
                                fontSize: 16,
                                color: isSuspended ? (isDark ? Colors.white24 : Colors.grey) : (isDark ? Colors.white : const Color(0xFF1E293B)),
                                decoration: isSuspended ? TextDecoration.lineThrough : null,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (isMe)
                            Container(
                              margin: const EdgeInsets.only(left: 8),
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.green.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text('YOU', style: TextStyle(fontSize: 8, color: Colors.green, fontWeight: FontWeight.w900)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isSuspended ? (isDark ? Colors.white.withOpacity(0.05) : Colors.grey.shade100) : roleColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              role.toUpperCase(),
                              style: TextStyle(
                                color: isSuspended ? (isDark ? Colors.white24 : Colors.grey) : roleColor,
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          if (status == 'pending')
                            Container(
                              margin: const EdgeInsets.only(left: 8),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.amber.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'PENDING APPROVAL',
                                style: TextStyle(color: Colors.amber, fontSize: 9, fontWeight: FontWeight.w900),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
                Icon(Icons.more_horiz_rounded, color: isDark ? Colors.white24 : Colors.grey.shade300),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
