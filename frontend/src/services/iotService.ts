// IoT Smart Campus Integration Service
export interface PanicPole {
  id: string;
  location: { latitude: number; longitude: number };
  status: 'active' | 'triggered' | 'offline';
  lastMaintenance: Date;
}

export interface Wearable {
  id: string;
  userId: string;
  type: 'watch' | 'band' | 'pendant';
  batteryLevel: number;
  connected: boolean;
}

export interface SmartLock {
  id: string;
  location: string;
  status: 'locked' | 'unlocked' | 'emergency-open';
  accessLog: Array<{ timestamp: Date; user: string }>;
}

export class IoTService {
  private panicPoles: Map<string, PanicPole> = new Map();
  private wearables: Map<string, Wearable> = new Map();
  private smartLocks: Map<string, SmartLock> = new Map();

  constructor() {
    this.initializeMockDevices();
  }

  private initializeMockDevices(): void {
    // Mock panic poles
    this.panicPoles.set('pole1', {
      id: 'pole1',
      location: { latitude: 28.4855, longitude: 77.3953 },
      status: 'active',
      lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    this.panicPoles.set('pole2', {
      id: 'pole2',
      location: { latitude: 28.4850, longitude: 77.3970 },
      status: 'active',
      lastMaintenance: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    });
  }

  // Panic Pole Methods
  async triggerPanicPole(poleId: string): Promise<boolean> {
    const pole = this.panicPoles.get(poleId);
    if (!pole) return false;

    pole.status = 'triggered';
    this.panicPoles.set(poleId, pole);
    console.log(`Panic pole ${poleId} triggered at`, pole.location);
    return true;
  }

  getPanicPoles(): PanicPole[] {
    return Array.from(this.panicPoles.values());
  }

  // Wearable Methods
  async connectWearable(wearableId: string, userId: string): Promise<boolean> {
    const wearable: Wearable = {
      id: wearableId,
      userId,
      type: 'watch',
      batteryLevel: 85,
      connected: true,
    };
    this.wearables.set(wearableId, wearable);
    console.log(`Wearable ${wearableId} connected for user ${userId}`);
    return true;
  }

  async getWearableStatus(wearableId: string): Promise<Wearable | null> {
    return this.wearables.get(wearableId) || null;
  }

  // Smart Lock Methods
  async unlockEmergencyAccess(lockId: string): Promise<boolean> {
    const lock = this.smartLocks.get(lockId);
    if (!lock) {
      // Create mock lock
      const newLock: SmartLock = {
        id: lockId,
        location: 'Emergency Exit',
        status: 'emergency-open',
        accessLog: [{ timestamp: new Date(), user: 'Emergency System' }],
      };
      this.smartLocks.set(lockId, newLock);
      console.log(`Emergency access granted for lock ${lockId}`);
      return true;
    }

    lock.status = 'emergency-open';
    lock.accessLog.push({ timestamp: new Date(), user: 'Emergency System' });
    this.smartLocks.set(lockId, lock);
    return true;
  }

  getSmartLocks(): SmartLock[] {
    return Array.from(this.smartLocks.values());
  }
}

export const iotService = new IoTService();
