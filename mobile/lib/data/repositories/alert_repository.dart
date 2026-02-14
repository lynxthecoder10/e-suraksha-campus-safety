import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/emergency_alert.dart';
import '../../core/config/supabase_config.dart';
import '../../core/constants/app_constants.dart';

class AlertRepository {
  final SupabaseClient _client = SupabaseConfig.client;
  
  /// Get all active alerts
  Future<List<EmergencyAlert>> getActiveAlerts() async {
    try {
      final response = await _client
          .from(AppConstants.alertsTable)
          .select()
          .eq('status', AppConstants.alertStatusActive)
          .order('created_at', ascending: false);
      
      return (response as List)
          .map((json) => EmergencyAlert.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch active alerts: $e');
    }
  }
  
  /// Create a new emergency alert
  Future<EmergencyAlert> createAlert({
    required SOSType type,
    required GeoLocation location,
    String? extraData,
  }) async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) {
        throw Exception('User not authenticated');
      }
      
      final response = await _client
          .from(AppConstants.alertsTable)
          .insert({
            'user_id': userId,
            'type': type.name,
            'status': AppConstants.alertStatusActive,
            'latitude': location.latitude,
            'longitude': location.longitude,
            'extra_data': extraData,
          })
          .select()
          .single();
      
      return EmergencyAlert.fromJson(response);
    } catch (e) {
      throw Exception('Failed to create alert: $e');
    }
  }
  
  /// Update alert status
  Future<void> updateAlertStatus(int alertId, AlertStatus status) async {
    try {
      await _client
          .from(AppConstants.alertsTable)
          .update({'status': status.name})
          .eq('id', alertId);
    } catch (e) {
      throw Exception('Failed to update alert status: $e');
    }
  }
  
  /// Get user's alerts
  Future<List<EmergencyAlert>> getUserAlerts() async {
    try {
      final userId = _client.auth.currentUser?.id;
      if (userId == null) {
        throw Exception('User not authenticated');
      }
      
      final response = await _client
          .from(AppConstants.alertsTable)
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);
      
      return (response as List)
          .map((json) => EmergencyAlert.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch user alerts: $e');
    }
  }
  
  /// Subscribe to real-time alert updates
  Stream<List<EmergencyAlert>> subscribeToAlerts() {
    return _client
        .from(AppConstants.alertsTable)
        .stream(primaryKey: ['id'])
        .eq('status', AppConstants.alertStatusActive)
        .map((data) => data.map((json) => EmergencyAlert.fromJson(json)).toList());
  }
}
