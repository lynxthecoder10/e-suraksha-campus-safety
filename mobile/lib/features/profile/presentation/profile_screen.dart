import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/supabase_config.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _loading = false;
  Map<String, dynamic>? _profile;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    final user = SupabaseConfig.client.auth.currentUser;
    if (user != null) {
      final data = await SupabaseConfig.client
          .from('profiles')
          .select()
          .eq('id', user.id)
          .maybeSingle();
      if (mounted) {
        setState(() {
          _profile = data;
        });
      }
    }
  }

  Future<void> _signOut() async {
    setState(() => _loading = true);
    await SupabaseConfig.client.auth.signOut();
    if (mounted) {
       // Router redirect will handle navigation to /auth
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = SupabaseConfig.client.auth.currentUser;
    final role = _profile?['role'] ?? 'user';

    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Center(
            child: Stack(
              children: [
                CircleAvatar(
                  radius: 60,
                  backgroundColor: Colors.grey.shade200,
                  backgroundImage: _profile?['profile_photo'] != null 
                    ? NetworkImage(_profile!['profile_photo']) 
                    : null,
                  child: _profile?['profile_photo'] == null 
                    ? const Icon(Icons.person, size: 60, color: Colors.grey) 
                    : null,
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.blue,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.edit, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          Text(
            _profile?['name'] ?? 'E-Suraksha User',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            user?.email ?? '',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey),
          ),
          const SizedBox(height: 16),
          Center(
             child: Chip(
               label: Text(role.toString().toUpperCase()),
               backgroundColor: role == 'admin' ? Colors.red.shade100 : Colors.blue.shade100,
               labelStyle: TextStyle(
                 color: role == 'admin' ? Colors.red.shade900 : Colors.blue.shade900,
                 fontWeight: FontWeight.bold
               ),
             ),
          ),
          
          const SizedBox(height: 40),
          const Divider(),
          
          ListTile(
            leading: const Icon(Icons.notifications_outlined),
            title: const Text('Notifications'),
            trailing: Switch(value: true, onChanged: (val){}),
          ),
          ListTile(
            leading: const Icon(Icons.offline_bolt_outlined),
            title: const Text('Offline Mode'),
            subtitle: const Text('Available'),
            trailing: const Icon(Icons.check_circle, color: Colors.green),
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Privacy & Security'),
            onTap: () {},
          ),
          
          const SizedBox(height: 24),
          
          ElevatedButton.icon(
            onPressed: _loading ? null : _signOut,
            icon: const Icon(Icons.logout),
            label: const Text('Sign Out'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade50,
              foregroundColor: Colors.red,
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
          
          const SizedBox(height: 24),
          const Center(
            child: Text(
              'v1.0.0 • E-Suraksha Campus Safety',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
