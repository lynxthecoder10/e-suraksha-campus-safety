import 'package:e_suraksha_mobile/core/config/supabase_config.dart';
import 'package:flutter/material.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final _searchController = TextEditingController();
  List<Map<String, dynamic>> _users = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    setState(() { 
      _isLoading = true; 
      _error = null;
    });

    try {
      final response = await SupabaseConfig.client
          .from('profiles')
          .select('*')
          .order('created_at', { 'ascending': false });

      setState(() {
        _users = List<Map<String, dynamic>>.from(response);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _updateRole(String userId, String newRole) async {
    try {
      await SupabaseConfig.client
          .from('profiles')
          .update({ 'role': newRole })
          .eq('id', userId);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Updated role to $newRole')),
        );
        _fetchUsers(); // Refresh list
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating role: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _showEditRoleDialog(Map<String, dynamic> user) {
    String currentRole = user['role'] ?? 'user';
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Edit Role: ${user['name']}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _roleOption(user['id'], 'user', currentRole),
            _roleOption(user['id'], 'admin', currentRole),
            _roleOption(user['id'], 'responder', currentRole),
            _roleOption(user['id'], 'security', currentRole),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  Widget _roleOption(String userId, String role, String currentRole) {
    return RadioListTile<String>(
      title: Text(role.toUpperCase()),
      value: role,
      groupValue: currentRole,
      onChanged: (value) {
        if (value != null) {
          Navigator.pop(context);
          _updateRole(userId, value);
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredUsers = _users.where((user) {
      final query = _searchController.text.toLowerCase();
      final name = (user['name'] ?? '').toString().toLowerCase();
      final role = (user['role'] ?? '').toString().toLowerCase();
      return name.contains(query) || role.contains(query);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('User Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchUsers,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Search Users',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _error != null 
                  ? Center(child: Text('Error: $_error'))
                  : filteredUsers.isEmpty
                    ? const Center(child: Text('No users found'))
                    : ListView.builder(
                        itemCount: filteredUsers.length,
                        itemBuilder: (context, index) {
                          final user = filteredUsers[index];
                          final role = user['role'] ?? 'user';
                          final isMe = user['id'] == SupabaseConfig.client.auth.currentUser?.id;

                          return ListTile(
                            leading: CircleAvatar(
                              child: Text((user['name'] ?? '?')[0].toUpperCase()),
                            ),
                            title: Text('${user['name']} ${isMe ? '(You)' : ''}'),
                            subtitle: Text('Role: ${role.toUpperCase()}'),
                            trailing: IconButton(
                              icon: const Icon(Icons.edit),
                              onPressed: () => _showEditRoleDialog(user),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
