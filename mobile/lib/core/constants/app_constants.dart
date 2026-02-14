class AppConstants {
  // App Info
  static const String appName = 'E-Suraksha';
  static const String appVersion = '1.0.0';
  
  // API Endpoints
  static const String supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const String supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  
  // Database Tables
  static const String alertsTable = 'alerts';
  static const String reportsTable = 'reports';
  static const String usersTable = 'users';
  
  // Alert Types
  static const String alertTypeMedical = 'medical';
  static const String alertTypeFire = 'fire';
  static const String alertTypeSecurity = 'security';
  static const String alertTypeOther = 'other';
  
  // Alert Status
  static const String alertStatusActive = 'active';
  static const String alertStatusResolved = 'resolved';
  
  // Permissions
  static const String permissionLocation = 'location';
  static const String permissionCamera = 'camera';
  static const String permissionStorage = 'storage';
  
  // Map Settings
  static const double defaultLatitude = 0.0;
  static const double defaultLongitude = 0.0;
  static const double defaultZoom = 15.0;
  
  // Timeouts
  static const int apiTimeout = 30; // seconds
  static const int locationTimeout = 10; // seconds
}
