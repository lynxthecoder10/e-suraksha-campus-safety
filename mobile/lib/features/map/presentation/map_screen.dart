import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/config/supabase_config.dart';

class SafetyMapScreen extends StatefulWidget {
  const SafetyMapScreen({super.key});

  @override
  State<SafetyMapScreen> createState() => _SafetyMapScreenState();
}

class _SafetyMapScreenState extends State<SafetyMapScreen> {
  final Completer<GoogleMapController> _controller = Completer<GoogleMapController>();
  Map<MarkerId, Marker> markers = {};
  
  // Default location (e.g., Campus Center)
  static const CameraPosition _kCampusCenter = CameraPosition(
    target: LatLng(12.9716, 77.5946),
    zoom: 15.0,
  );

  final String _darkMapStyle = '''
[
  {
    "elementType": "geometry",
    "stylers": [{"color": "#212121"}]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{"visibility": "off"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#757575"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#212121"}]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{"color": "#757575"}]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{"color": "#181818"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#2c2c2c"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#000000"}]
  }
]
''';

  @override
  void initState() {
    super.initState();
    _fetchData();
    _subscribeToChanges();
  }

  void _fetchData() async {
    final alertsRes = await SupabaseConfig.client
        .from('alerts')
        .select()
        .eq('status', 'active');
        
    final incidentsRes = await SupabaseConfig.client
        .from('incident_reports')
        .select()
        .eq('status', 'investigating');

    final List<dynamic> alerts = alertsRes as List<dynamic>;
    final List<dynamic> incidents = incidentsRes as List<dynamic>;
    
    _updateMarkers(alerts, incidents);
  }

  void _subscribeToChanges() {
    SupabaseConfig.client
        .channel('public:map_updates')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'alerts',
          callback: (payload) => _fetchData(),
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'incident_reports',
          callback: (payload) => _fetchData(),
        )
        .subscribe();
  }

  void _updateMarkers(List<dynamic> alerts, List<dynamic> incidents) {
    final newMarkers = <MarkerId, Marker>{};
    
    for (final alert in alerts) {
      final markerId = MarkerId('alert_${alert['id']}');
      newMarkers[markerId] = Marker(
        markerId: markerId,
        position: LatLng(alert['latitude'], alert['longitude']),
        infoWindow: InfoWindow(
          title: 'EMERGENCY: ${alert['type'].toString().toUpperCase()}',
          snippet: 'Emergency responders dispatched',
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
      );
    }

    for (final incident in incidents) {
      final markerId = MarkerId('incident_${incident['id']}');
      newMarkers[markerId] = Marker(
        markerId: markerId,
        position: LatLng(incident['latitude'], incident['longitude']),
        infoWindow: InfoWindow(
          title: 'REPORT: ${incident['description'] ?? 'Caution Area'}',
          snippet: 'Status: Investigation Active',
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
      );
    }

    if (mounted) {
      setState(() {
        markers = newMarkers;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Stack(
        children: [
          GoogleMap(
            mapType: MapType.normal,
            initialCameraPosition: _kCampusCenter,
            markers: Set<Marker>.of(markers.values),
            onMapCreated: (GoogleMapController controller) {
              _controller.complete(controller);
              if (isDark) {
                controller.setMapStyle(_darkMapStyle);
              }
            },
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
          ),
          
          // Premium Overlay Header
          Positioned(
             top: 60,
             left: 20,
             right: 20,
             child: Container(
               padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
               decoration: BoxDecoration(
                 color: isDark ? const Color(0xFF0F172A).withOpacity(0.9) : Colors.white.withOpacity(0.9),
                 borderRadius: BorderRadius.circular(24),
                 border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
                 boxShadow: [
                   BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, 10))
                 ],
               ),
               child: Row(
                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
                 children: [
                   Row(
                     children: [
                       Container(
                         padding: const EdgeInsets.all(8),
                         decoration: BoxDecoration(
                           color: Colors.blue.withOpacity(0.12),
                           borderRadius: BorderRadius.circular(12),
                         ),
                         child: const Icon(Icons.shield_rounded, color: Colors.blue, size: 20),
                       ),
                       const SizedBox(width: 16),
                       Column(
                         crossAxisAlignment: CrossAxisAlignment.start,
                         mainAxisSize: MainAxisSize.min,
                         children: [
                           Text(
                             'CAMPUS SAFETY INDEX',
                             style: TextStyle(
                               fontSize: 10,
                               fontWeight: FontWeight.w900,
                               letterSpacing: 1.5,
                               color: isDark ? Colors.white38 : Colors.grey.shade500,
                             ),
                           ),
                           const Row(
                             children: [
                               Text(
                                 '98.4',
                                 style: TextStyle(
                                   fontSize: 20,
                                   fontWeight: FontWeight.w900,
                                   color: Colors.green,
                                 ),
                               ),
                               SizedBox(width: 4),
                               Text(
                                 'OPTIMAL',
                                 style: TextStyle(
                                   fontSize: 10,
                                   fontWeight: FontWeight.w900,
                                   color: Colors.green,
                                 ),
                               ),
                             ],
                           ),
                         ],
                       ),
                     ],
                   ),
                   IconButton(
                     onPressed: _fetchData,
                     icon: Icon(Icons.refresh_rounded, color: isDark ? Colors.white60 : Colors.black54),
                   ),
                 ],
               ),
             ),
          ),

          // Map Controls
          Positioned(
            bottom: 32,
            right: 20,
            child: Column(
              children: [
                _buildMapControl(
                  icon: Icons.my_location_rounded,
                  onTap: () async {
                    final controller = await _controller.future;
                    controller.animateCamera(CameraUpdate.newCameraPosition(_kCampusCenter));
                  },
                  isDark: isDark,
                ),
              ],
            ),
          ),
          
          // Legend
          Positioned(
            bottom: 32,
            left: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A).withOpacity(0.9) : Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLegendItem(Colors.red, 'Active Emergency', isDark),
                  const SizedBox(height: 8),
                  _buildLegendItem(Colors.orange, 'Reported Hazard', isDark),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapControl({required IconData icon, required VoidCallback onTap, required bool isDark}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4))
          ],
        ),
        child: Icon(icon, color: isDark ? Colors.white : Colors.black87),
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label, bool isDark) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white70 : Colors.black87,
          ),
        ),
      ],
    );
  }
}
