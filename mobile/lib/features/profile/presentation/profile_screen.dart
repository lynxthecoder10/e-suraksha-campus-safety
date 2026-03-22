import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:e_suraksha_mobile/core/config/supabase_config.dart';
import 'package:e_suraksha_mobile/core/theme/app_theme.dart';

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
  }

  @override
  Widget build(BuildContext context) {
    final user = SupabaseConfig.client.auth.currentUser;
    final role = _profile?['role'] ?? 'user';
    final isAdmin = role == 'admin';
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF020617) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('ACCOUNT SETTINGS'),
        titleTextStyle: TextStyle(
          fontSize: 14, 
          fontWeight: FontWeight.w900, 
          letterSpacing: 2, 
          color: isDark ? Colors.white70 : const Color(0xFF64748B)
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        children: [
          // Hero Profile Section
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF111827) : Colors.white,
              borderRadius: BorderRadius.circular(32),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(isDark ? 0.3 : 0.03), blurRadius: 20, offset: const Offset(0, 10))
              ],
              border: isDark ? Border.all(color: Colors.white10) : null,
            ),
            child: Column(
              children: [
                Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: AppTheme.primaryGradient,
                      ),
                      child: CircleAvatar(
                        radius: 50,
                        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                        backgroundImage: _profile?['profile_photo'] != null 
                          ? NetworkImage(_profile!['profile_photo']) 
                          : null,
                        child: _profile?['profile_photo'] == null 
                          ? const Icon(Icons.person_rounded, size: 50, color: Color(0xFF94A3B8)) 
                          : null,
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor,
                          shape: BoxShape.circle,
                          border: Border.all(color: isDark ? const Color(0xFF111827) : Colors.white, width: 3),
                        ),
                        child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 14),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  _profile?['name'] ?? 'Authorized User',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: isDark ? Colors.white : const Color(0xFF0F172A)),
                ),
                Text(
                  user?.email ?? '',
                  style: TextStyle(fontSize: 14, color: isDark ? Colors.white60 : const Color(0xFF64748B), fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: isAdmin ? const Color(0xFFFEF2F2).withOpacity(isDark ? 0.2 : 1) : const Color(0xFFEEF2FF).withOpacity(isDark ? 0.2 : 1),
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Text(
                    role.toString().toUpperCase(),
                    style: TextStyle(
                      fontSize: 10, 
                      fontWeight: FontWeight.w900, 
                      letterSpacing: 1,
                      color: isAdmin ? const Color(0xFFEF4444) : AppTheme.primaryColor
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          Text('GENERAL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: isDark ? Colors.white38 : const Color(0xFF94A3B8), letterSpacing: 1.5)),
          const SizedBox(height: 12),
          
          _buildSettingsCard(
            isDark: isDark,
            children: [
              _buildSettingTile(
                isDark: isDark,
                icon: Icons.badge_rounded,
                iconColor: Colors.deepPurple,
                title: 'Digital Identity',
                subtitle: 'Your QR-based campus access card',
                onTap: () => context.go('/profile/digital-id'),
              ),
              Divider(height: 1, indent: 56, color: isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
              _buildSettingTile(
                isDark: isDark,
                icon: Icons.contact_phone_rounded,
                iconColor: Colors.blue,
                title: 'Emergency Contacts',
                subtitle: 'Manage your primary responders',
                onTap: () => context.go('/profile/contacts'),
              ),
              Divider(height: 1, indent: 56, color: isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
              _buildSettingTile(
                isDark: isDark,
                icon: Icons.security_rounded,
                iconColor: Colors.teal,
                title: 'Campus Safety Kit',
                subtitle: 'Guidelines and local resources',
                onTap: () => context.go('/profile/safety'),
              ),
              Divider(height: 1, indent: 56, color: isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
              _buildSettingTile(
                isDark: isDark,
                icon: Icons.notifications_active_rounded,
                iconColor: Colors.orange,
                title: 'Broadcast Alerts',
                subtitle: 'Push notification settings',
                trailing: Switch.adaptive(value: true, onChanged: (v) {}),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          Text('SYSTEM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: isDark ? Colors.white38 : const Color(0xFF94A3B8), letterSpacing: 1.5)),
          const SizedBox(height: 12),
          
          _buildSettingsCard(
            isDark: isDark,
            children: [
              _buildSettingTile(
                isDark: isDark,
                icon: Icons.offline_bolt_rounded,
                iconColor: Colors.indigo,
                title: 'Offline Mesh Protocol',
                subtitle: 'Active and available',
                trailing: const Icon(Icons.check_circle_rounded, color: Colors.green, size: 20),
              ),
              Divider(height: 1, indent: 56, color: isDark ? Colors.white10 : const Color(0xFFF1F5F9)),
              _buildSettingTile(
                isDark: isDark,
                icon: Icons.privacy_tip_rounded,
                iconColor: Colors.blueGrey,
                title: 'Privacy Center',
                subtitle: 'Data consent and security',
                onTap: () {},
              ),
            ],
          ),
          
          const SizedBox(height: 32),
          
          ElevatedButton.icon(
            onPressed: _loading ? null : _signOut,
            icon: const Icon(Icons.logout_rounded, size: 18),
            label: const Text('SECURE SIGN OUT', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFEF2F2).withOpacity(isDark ? 0.1 : 1),
              foregroundColor: const Color(0xFFEF4444),
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
          ),
          
          const SizedBox(height: 40),
          Center(
            child: Text(
              'v1.1.0 • E-SURAKSHA PROTOCOL',
              style: TextStyle(color: isDark ? Colors.white24 : const Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildSettingsCard({required List<Widget> children, required bool isDark}) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF111827) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(isDark ? 0.2 : 0.02), blurRadius: 15, offset: const Offset(0, 5))
        ],
        border: isDark ? Border.all(color: Colors.white10) : null,
      ),
      child: Column(children: children),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required bool isDark,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: iconColor.withOpacity(0.12),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Icon(icon, color: iconColor, size: 22),
      ),
      title: Text(title, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: isDark ? Colors.white : const Color(0xFF1E293B))),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : const Color(0xFF64748B))),
      trailing: trailing ?? Icon(Icons.chevron_right_rounded, color: isDark ? Colors.white24 : const Color(0xFFCBD5E1)),
    );
  }
}
