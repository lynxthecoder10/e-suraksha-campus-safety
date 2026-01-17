// Shake detection service using device accelerometer
export interface ShakeDetectionConfig {
  sensitivity: number; // 1-10, higher = more sensitive
  onShakeDetected: () => void;
  onError?: (error: Error) => void;
}

export class ShakeDetectionService {
  private isListening = false;
  private config: ShakeDetectionConfig | null = null;
  private lastX = 0;
  private lastY = 0;
  private lastZ = 0;
  private lastTime = 0;
  private shakeThreshold = 15; // Base threshold

  startListening(config: ShakeDetectionConfig): boolean {
    if (!('DeviceMotionEvent' in window)) {
      config.onError?.(new Error('Device motion not supported on this device'));
      return false;
    }

    this.config = config;
    this.isListening = true;
    
    // Adjust threshold based on sensitivity (1-10)
    // Lower threshold = more sensitive
    this.shakeThreshold = 25 - (config.sensitivity * 2);

    // Request permission for iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            this.attachListener();
          } else {
            config.onError?.(new Error('Device motion permission denied'));
            this.isListening = false;
          }
        })
        .catch((error: Error) => {
          config.onError?.(error);
          this.isListening = false;
        });
    } else {
      // Non-iOS or older iOS
      this.attachListener();
    }

    return true;
  }

  private attachListener(): void {
    window.addEventListener('devicemotion', this.handleMotion);
  }

  private handleMotion = (event: DeviceMotionEvent): void => {
    if (!this.isListening || !this.config) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastTime;

    if (timeDiff > 100) { // Check every 100ms
      const x = acceleration.x ?? 0;
      const y = acceleration.y ?? 0;
      const z = acceleration.z ?? 0;

      const deltaX = Math.abs(x - this.lastX);
      const deltaY = Math.abs(y - this.lastY);
      const deltaZ = Math.abs(z - this.lastZ);

      const totalDelta = deltaX + deltaY + deltaZ;

      if (totalDelta > this.shakeThreshold) {
        this.config.onShakeDetected();
      }

      this.lastX = x;
      this.lastY = y;
      this.lastZ = z;
      this.lastTime = currentTime;
    }
  };

  stopListening(): void {
    this.isListening = false;
    window.removeEventListener('devicemotion', this.handleMotion);
    this.config = null;
  }

  isSupported(): boolean {
    return 'DeviceMotionEvent' in window;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const shakeDetectionService = new ShakeDetectionService();
