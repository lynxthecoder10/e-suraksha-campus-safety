import 'package:e_suraksha_mobile/core/models/base_model.dart';

class UserProfile {
  final String id;
  final String name;
  final String role; // 'admin', 'user', 'responder', 'security'
  final String? email;
  final String? profilePhoto;

  UserProfile({
    required this.id,
    required this.name,
    required this.role,
    this.email,
    this.profilePhoto,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      name: json['name'] as String? ?? 'Unknown',
      role: json['role'] as String? ?? 'user',
      email: json['email'] as String?, // Might need to join with auth.users or fetch separately if not in profiles
      profilePhoto: json['profile_photo'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role': role,
      'email': email,
      'profile_photo': profilePhoto,
    };
  }
}
