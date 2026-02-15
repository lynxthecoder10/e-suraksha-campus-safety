import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:e_suraksha_mobile/core/config/supabase_config.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _alertsStream = SupabaseConfig.client
      .from('alerts')
      .stream(primaryKey: ['id'])
      .eq('status', 'active')
      .order('created_at', ascending: false);

  Future<void> _signOut() async {
    await SupabaseConfig.client.auth.signOut();
  }

  Future<void> _triggerSOS() async {
    try {
      // Mock location for now
      // TODO: Use geolocator to get real location
      await SupabaseConfig.client.from('alerts').insert({
        'user_id': SupabaseConfig.client.auth.currentUser!.id,
        'type': 'medical', // Defaulting to medical for the button
        'status': 'active',
        'latitude': 12.9716, // Bangalore
        'longitude': 77.5946,
        'extra_data': 'Triggered from Mobile App',
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('SOS Alert Triggered!')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to trigger SOS: $error'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Active Alerts'),
        actions: [
          IconButton(
            onPressed: _signOut,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: StreamBuilder<List<Map<String, dynamic>>>(
        stream: _alertsStream,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final alerts = snapshot.data!;
          if (alerts.isEmpty) {
            return const Center(child: Text('No active alerts'));
          }
          return ListView.builder(
            itemCount: alerts.length,
            itemBuilder: (context, index) {
              final alert = alerts[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  leading: const Icon(Icons.warning, color: Colors.red),
                  title: Text(alert['type'].toString().toUpperCase()),
                  subtitle: Text(
                      'Lat: ${alert['latitude']}, Lng: ${alert['longitude']}'),
                  trailing: const Chip(label: Text('active')),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _triggerSOS,
        label: const Text('SOS'),
        icon: const Icon(Icons.emergency),
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
      ),
    );
  }
}
