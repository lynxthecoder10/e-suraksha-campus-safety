import 'package:flutter/material.dart';

class SafetyGuidelinesScreen extends StatelessWidget {
  const SafetyGuidelinesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Safety Protocols')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          SafetyCard(
            title: 'Fire Safety',
            icon: Icons.local_fire_department,
            color: Colors.orange,
            content: '1. PIN: Pull, Aim, Squeeze, Sweep.\n2. Evacuate via nearest exit.\n3. Do not use elevators.\n4. Crawl if there is smoke.',
          ),
          SizedBox(height: 16),
          SafetyCard(
            title: 'Earthquake',
            icon: Icons.vibration,
            color: Colors.brown,
            content: '1. Drop, Cover, and Hold On.\n2. Stay away from windows.\n3. If outdoors, stay specifically away from buildings and wires.',
          ),
          SizedBox(height: 16),
          SafetyCard(
            title: 'Medical Emergency',
            icon: Icons.medical_services,
            color: Colors.red,
            content: '1. Check the scene for safety.\n2. Call for help (102).\n3. Perform CPR if trained.\n4. Use AED if available.',
          ),
          SizedBox(height: 16),
          SafetyCard(
            title: 'Campus Lockdown',
            icon: Icons.lock,
            color: Colors.blueGrey,
            content: '1. Lock doors and turn off lights.\n2. Stay away from windows.\n3. Keep quiet and silence phones.\n4. Wait for official "All Clear".',
          ),
        ],
      ),
    );
  }
}

class SafetyCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final String content;

  const SafetyCard({
    super.key,
    required this.title,
    required this.icon,
    required this.color,
    required this.content,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: ExpansionTile(
        leading: Icon(icon, color: color, size: 32),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    content,
                    style: const TextStyle(height: 1.5, fontSize: 16),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
