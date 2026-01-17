// Location service for GPS tracking and streaming
export interface LocationUpdate {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export class LocationService {
  private watchId: number | null = null;
  private lastKnownLocation: LocationUpdate | null = null;
  private onLocationUpdate: ((location: LocationUpdate) => void) | null = null;

  // Request location permission and get current position
  async getCurrentLocation(): Promise<LocationUpdate> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationUpdate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            accuracy: position.coords.accuracy,
          };
          this.lastKnownLocation = location;
          resolve(location);
        },
        (error) => {
          // If current location fails, try to return last known
          if (this.lastKnownLocation) {
            resolve(this.lastKnownLocation);
          } else {
            reject(this.getLocationError(error));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  // Start streaming location updates
  startLocationStream(callback: (location: LocationUpdate) => void): void {
    this.onLocationUpdate = callback;

    if (!('geolocation' in navigator)) {
      console.error('Geolocation not supported');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationUpdate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
          accuracy: position.coords.accuracy,
        };
        this.lastKnownLocation = location;
        if (this.onLocationUpdate) {
          this.onLocationUpdate(location);
        }
      },
      (error) => {
        console.error('Location stream error:', error);
        // Continue with last known location if available
        if (this.lastKnownLocation && this.onLocationUpdate) {
          this.onLocationUpdate(this.lastKnownLocation);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  // Stop streaming location updates
  stopLocationStream(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.onLocationUpdate = null;
  }

  // Get last known location (fallback)
  getLastKnownLocation(): LocationUpdate | null {
    return this.lastKnownLocation;
  }

  // Check if location permission is granted
  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!('permissions' in navigator)) {
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch {
      return 'prompt';
    }
  }

  private getLocationError(error: GeolocationPositionError): Error {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new Error('Location access denied. Please enable location permissions in your browser settings.');
      case error.POSITION_UNAVAILABLE:
        return new Error('Location information unavailable. Please try again.');
      case error.TIMEOUT:
        return new Error('Location request timed out. Please try again.');
      default:
        return new Error('An unknown error occurred while getting location.');
    }
  }
}

export const locationService = new LocationService();
