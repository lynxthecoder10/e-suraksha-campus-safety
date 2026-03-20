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
      {'name': 'Campus Security', 'number': '112', 'icon': Icons.security_rounded, 'color': Colors.indigo, 'tag': 'PRIMARY'},
      {'name': 'Medical Emergency', 'number': '102', 'icon': Icons.medical_services_rounded, 'color': Colors.redAccent, 'tag': '24/7'},
      {'name': 'Fire Department', 'number': '101', 'icon': Icons.local_fire_department_rounded, 'color': Colors.orangeAccent, 'tag': 'URGENT'},
      {'name': 'Student Helpline', 'number': '1800-123-4567', 'icon': Icons.support_agent_rounded, 'color': Colors.teal, 'tag': 'SUPPORT'},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('EMERGENCY CONTACTS'),
        titleTextStyle: const TextStyle(
          fontSize: 14, 
          fontWeight: FontWeight.w900, 
          letterSpacing: 2, 
          color: Color(0xFF64748B)
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(24),
        itemCount: contacts.length,
        separatorBuilder: (ctx, i) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final contact = contacts[index];
          final color = contact['color'] as Color;
          
          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 15, offset: const Offset(0, 5))
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: ListTile(
                onTap: () => _makePhoneCall(contact['number'] as String),
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                leading: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(contact['icon'] as IconData, color: color, size: 28),
                ),
                title: Row(
                  children: [
                    Expanded(
                      child: Text(
                        contact['name'] as String, 
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF1E293B)),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        contact['tag'] as String,
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.black, color: color, letterSpacing: 0.5),
                      ),
                    ),
                  ],
                ),
                subtitle: Text(
                  contact['number'] as String,
                  style: const TextStyle(fontSize: 14, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                ),
                trailing: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.call_rounded, color: Colors.green, size: 20),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
