import 'package:e_suraksha_mobile/core/config/supabase_config.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

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
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update role. Check admin permissions.'),
            backgroundColor: Colors.red,
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
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update status. Check permissions.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showActionDialog(Map<String, dynamic> user) {
    String currentRole = user['role'] ?? 'user';
    String currentStatus = user['status'] ?? 'active';
    
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.grey.shade200,
                  radius: 24,
                  child: Text((user['name'] ?? '?')[0].toUpperCase(), style: const TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(user['name'] ?? 'Unknown', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Text('Current Role: ${currentRole.toUpperCase()}', style: TextStyle(color: Colors.grey.shade600)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Role Management', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: [
                _roleChip(user['id'], 'user', currentRole),
                _roleChip(user['id'], 'admin', currentRole),
                _roleChip(user['id'], 'responder', currentRole),
                _roleChip(user['id'], 'security', currentRole),
              ],
            ),
            const Divider(height: 32),
            const Text('Account Status', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(
                currentStatus == 'active' ? Icons.block : Icons.check_circle,
                color: currentStatus == 'active' ? Colors.red : Colors.green,
                size: 28,
              ),
              title: Text(
                currentStatus == 'active' ? 'Suspend Account' : 'Activate Account',
                style: TextStyle(
                  color: currentStatus == 'active' ? Colors.red : Colors.green,
                  fontWeight: FontWeight.bold,
                ),
              ),
              subtitle: Text(
                currentStatus == 'active' 
                  ? 'User will lose access to the app.' 
                  : 'Restore access for this user.',
              ),
              onTap: () {
                Navigator.pop(context);
                _updateStatus(user['id'], currentStatus);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _roleChip(String userId, String role, String currentRole) {
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
      selectedColor: Colors.blue.shade100,
      labelStyle: TextStyle(
        color: isSelected ? Colors.blue.shade900 : Colors.black87,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text('User Management'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16.0),
            color: Colors.white,
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search users by name or role...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
          Expanded(
            child: StreamBuilder<List<Map<String, dynamic>>>(
              stream: _usersStream,
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return Center(child: Text('Error loading users: ${snapshot.error}'));
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
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                         Icon(Icons.person_off, size: 64, color: Colors.grey),
                         SizedBox(height: 16),
                         Text('No users found'),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filteredUsers.length,
                  itemBuilder: (context, index) {
                    final user = filteredUsers[index];
                    return _UserCard(
                      user: user,
                      onEdit: () => _showActionDialog(user),
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
  final VoidCallback onEdit;

  const _UserCard({required this.user, required this.onEdit});

  Color _getRoleColor(String role) {
    switch (role) {
      case 'admin': return Colors.red;
      case 'responder': return Colors.orange;
      case 'security': return Colors.blue;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final role = (user['role'] ?? 'user').toString();
    final status = (user['status'] ?? 'active').toString();
    final isSuspended = status != 'active';
    final roleColor = _getRoleColor(role);
    final isMe = user['id'] == SupabaseConfig.client.auth.currentUser?.id;

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onEdit,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: isSuspended ? Colors.grey.shade300 : roleColor.withOpacity(0.1),
                    child: Text(
                      (user['name'] ?? '?')[0].toUpperCase(),
                      style: TextStyle(
                        color: isSuspended ? Colors.grey : roleColor, 
                        fontWeight: FontWeight.bold, 
                        fontSize: 18
                      ),
                    ),
                  ),
                  if (isSuspended)
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                        child: const Icon(Icons.block, size: 14, color: Colors.red),
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
                        Text(
                          user['name'] ?? 'Unknown User',
                          style: TextStyle(
                            fontWeight: FontWeight.bold, 
                            fontSize: 16,
                            color: isSuspended ? Colors.grey : Colors.black87,
                            decoration: isSuspended ? TextDecoration.lineThrough : null,
                          ),
                        ),
                        if (isMe)
                          Container(
                            margin: const EdgeInsets.only(left: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.green.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text('YOU', style: TextStyle(fontSize: 10, color: Colors.green, fontWeight: FontWeight.bold)),
                          ),
                        if (isSuspended)
                           Container(
                            margin: const EdgeInsets.only(left: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.red.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text('SUSPENDED', style: TextStyle(fontSize: 10, color: Colors.red, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isSuspended ? Colors.grey.shade200 : roleColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        role.toUpperCase(),
                        style: TextStyle(
                          color: isSuspended ? Colors.grey : roleColor,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.more_vert, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}
