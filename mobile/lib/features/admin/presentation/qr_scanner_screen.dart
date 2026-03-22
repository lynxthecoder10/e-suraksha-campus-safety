import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../core/config/supabase_config.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final MobileScannerController controller = MobileScannerController();
  bool _isScanning = true;

  void _onDetect(BarcodeCapture capture) async {
    if (!_isScanning) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isNotEmpty) {
      final String? userId = barcodes.first.rawValue;
      if (userId != null) {
        setState(() => _isScanning = false);
        _verifyUser(userId);
      }
    }
  }

  Future<void> _verifyUser(String userId) async {
    try {
      final profile = await SupabaseConfig.client
          .from('profiles')
          .select()
          .eq('id', userId)
          .single();

      if (mounted) {
        _showResultSheet(profile);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invalid QR Code or User Not Found')),
        );
        setState(() => _isScanning = true);
      }
    }
  }

  void _showResultSheet(Map<String, dynamic> profile) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 60,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white10 : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 32),
            const Icon(Icons.verified_user_rounded, color: Colors.green, size: 64),
            const SizedBox(height: 16),
            Text(
              'Identity Verified',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 32),
            _buildInfoRow('NAME', profile['name'] ?? 'Unknown', isDark),
            const SizedBox(height: 16),
            _buildInfoRow('ROLE', (profile['role'] ?? 'student').toString().toUpperCase(), isDark),
            const SizedBox(height: 16),
            _buildInfoRow('STATUS', (profile['status'] ?? 'active').toString().toUpperCase(), isDark),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  setState(() => _isScanning = true);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: const Text('SCAN NEXT', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1)),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w900,
            color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
            letterSpacing: 1.5,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : const Color(0xFF1E293B),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        title: const Text('VERIFY IDENTITY'),
        titleTextStyle: const TextStyle(
          fontSize: 14, 
          fontWeight: FontWeight.w900, 
          letterSpacing: 2, 
          color: Colors.white70,
        ),
        actions: [
          IconButton(
            onPressed: () => controller.toggleTorch(),
            icon: const Icon(Icons.flashlight_on_rounded),
          ),
          IconButton(
            onPressed: () => controller.switchCamera(),
            icon: const Icon(Icons.cameraswitch_rounded),
          ),
        ],
      ),
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          MobileScanner(
            controller: controller,
            onDetect: _onDetect,
          ),
          // Scanner Overlay
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.blue, width: 4),
                borderRadius: BorderRadius.circular(32),
              ),
            ),
          ),
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: const Text(
                  'Align QR code within the frame',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
