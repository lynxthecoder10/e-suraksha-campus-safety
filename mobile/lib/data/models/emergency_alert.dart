class GeoLocation {
  final double latitude;
  final double longitude;
  
  GeoLocation({
    required this.latitude,
    required this.longitude,
  });
  
  factory GeoLocation.fromJson(Map<String, dynamic> json) {
    return GeoLocation(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

enum SOSType {
  medical,
  fire,
  security,
  other;
  
  String get displayName {
    switch (this) {
      case SOSType.medical:
        return 'Medical Emergency';
      case SOSType.fire:
        return 'Fire Emergency';
      case SOSType.security:
        return 'Security Threat';
      case SOSType.other:
        return 'Other Emergency';
    }
  }
}

enum AlertStatus {
  active,
  resolved;
  
  String get displayName {
    switch (this) {
      case AlertStatus.active:
        return 'Active';
      case AlertStatus.resolved:
        return 'Resolved';
    }
  }
}

class EmergencyAlert {
  final int alertId;
  final String userId;
  final SOSType sosType;
  final AlertStatus status;
  final GeoLocation location;
  final DateTime timestamp;
  final String? extraData;
  
  EmergencyAlert({
    required this.alertId,
    required this.userId,
    required this.sosType,
    required this.status,
    required this.location,
    required this.timestamp,
    this.extraData,
  });
  
  factory EmergencyAlert.fromJson(Map<String, dynamic> json) {
    return EmergencyAlert(
      alertId: json['id'] as int,
      userId: json['user_id'] as String,
      sosType: SOSType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => SOSType.other,
      ),
      status: AlertStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => AlertStatus.active,
      ),
      location: GeoLocation(
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
      ),
      timestamp: DateTime.parse(json['created_at'] as String),
      extraData: json['extra_data'] as String?,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': alertId,
      'user_id': userId,
      'type': sosType.name,
      'status': status.name,
      'latitude': location.latitude,
      'longitude': location.longitude,
      'created_at': timestamp.toIso8601String(),
      'extra_data': extraData,
    };
  }
}
