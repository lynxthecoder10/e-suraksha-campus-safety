import 'package:flutter/material.dart';

class AdminUsersScreen extends StatelessWidget {
  const AdminUsersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Management')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.people, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('User Management Module', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Coming in next update', style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
