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
    zoom: 14.4746,
  );

  @override
  void initState() {
    super.initState();
    _fetchAlerts();
    _subscribeToAlerts();
  }

  void _fetchAlerts() async {
    final response = await SupabaseConfig.client
        .from('alerts')
        .select()
        .eq('status', 'active');
        
    final List<dynamic> data = response as List<dynamic>;
    _updateMarkers(data);
  }

  void _subscribeToAlerts() {
    SupabaseConfig.client
        .channel('public:alerts')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'alerts',
          callback: (payload) {
            _fetchAlerts();
          },
        )
        .subscribe();
  }

  void _updateMarkers(List<dynamic> alerts) {
    final newMarkers = <MarkerId, Marker>{};
    
    for (final alert in alerts) {
      final markerId = MarkerId(alert['id'].toString());
      final lat = alert['latitude'] as double;
      final lng = alert['longitude'] as double;
      final type = alert['type'] as String;

      newMarkers[markerId] = Marker(
        markerId: markerId,
        position: LatLng(lat, lng),
        infoWindow: InfoWindow(
          title: '${type.toUpperCase()} ALERT',
          snippet: 'Tap for details',
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          type == 'medical' ? BitmapDescriptor.hueRed : BitmapDescriptor.hueOrange,
        ),
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
    return Scaffold(
      body: Stack(
        children: [
          GoogleMap(
            mapType: MapType.normal,
            initialCameraPosition: _kCampusCenter,
            markers: Set<Marker>.of(markers.values),
            onMapCreated: (GoogleMapController controller) {
              _controller.complete(controller);
              // TODO: Set dark map style
            },
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
          ),
          Positioned(
             top: 50,
             left: 20,
             right: 20,
             child: Card(
               color: Colors.black87,
               child: Padding(
                 padding: const EdgeInsets.all(12.0),
                 child: Row(
                   children: [
                     const Icon(Icons.shield, color: Colors.blue),
                     const SizedBox(width: 10),
                     Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         Text('Live Safety Map', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                         const Text('Real-time hazard monitoring', style: TextStyle(color: Colors.white70, fontSize: 12)),
                       ],
                     )
                   ],
                 ),
               ),
             ),
          ),
        ],
      ),
    );
  }
}
