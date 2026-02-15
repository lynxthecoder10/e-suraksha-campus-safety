import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class EmergencyContactsScreen extends StatelessWidget {
  const EmergencyContactsScreen({super.key});

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    } else {
      throw 'Could not launch $launchUri';
    }
  }

  @override
  Widget build(BuildContext context) {
    final contacts = [
      {'name': 'Campus Security', 'number': '112', 'icon': Icons.security, 'color': Colors.blue},
      {'name': 'Medical Emergency', 'number': '102', 'icon': Icons.medical_services, 'color': Colors.red},
      {'name': 'Fire Department', 'number': '101', 'icon': Icons.local_fire_department, 'color': Colors.orange},
      {'name': 'Student Helpline', 'number': '1800-123-4567', 'icon': Icons.support_agent, 'color': Colors.green},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Emergency Contacts')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: contacts.length,
        separatorBuilder: (ctx, i) => const Divider(),
        itemBuilder: (context, index) {
          final contact = contacts[index];
          return ListTile(
            leading: CircleAvatar(
              backgroundColor: (contact['color'] as Color).withOpacity(0.1),
              child: Icon(contact['icon'] as IconData, color: contact['color'] as Color),
            ),
            title: Text(contact['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(contact['number'] as String),
            trailing: IconButton(
              icon: const Icon(Icons.call, color: Colors.green),
              onPressed: () => _makePhoneCall(contact['number'] as String),
            ),
            onTap: () => _makePhoneCall(contact['number'] as String),
          );
        },
      ),
    );
  }
}
