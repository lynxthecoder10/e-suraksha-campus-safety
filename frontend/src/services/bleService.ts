// BLE Multi-Hop Fallback Service for offline SOS relay
export interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
  lastSeen: number;
}

export interface BLEMessage {
  id: string;
  type: 'sos' | 'relay';
  payload: any;
  hops: number;
  timestamp: number;
}

export class BLEService {
  private bleSupported = false;
  private isScanning = false;
  private devices: Map<string, BLEDevice> = new Map();
  private messageQueue: BLEMessage[] = [];
  private maxHops = 5;

  constructor() {
    this.checkSupport();
  }

  private checkSupport(): void {
    this.bleSupported = 'bluetooth' in navigator;
  }

  async startScanning(): Promise<boolean> {
    if (!this.bleSupported) {
      console.warn('BLE not supported');
      return false;
    }

    try {
      // Request BLE device access
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'],
      });

      this.isScanning = true;
      console.log('BLE scanning started');
      return true;
    } catch (error) {
      console.error('BLE scanning failed:', error);
      return false;
    }
  }

  stopScanning(): void {
    this.isScanning = false;
    console.log('BLE scanning stopped');
  }

  async broadcastSOS(sosData: any): Promise<boolean> {
    if (!this.bleSupported) {
      console.warn('BLE not supported, cannot broadcast SOS');
      return false;
    }

    const message: BLEMessage = {
      id: `ble_${Date.now()}`,
      type: 'sos',
      payload: sosData,
      hops: 0,
      timestamp: Date.now(),
    };

    this.messageQueue.push(message);
    console.log('SOS message queued for BLE broadcast:', message);

    // In a real implementation, this would use Web Bluetooth API
    // to broadcast the message to nearby devices
    return true;
  }

  async relayMessage(message: BLEMessage): Promise<boolean> {
    if (message.hops >= this.maxHops) {
      console.log('Message reached max hops, not relaying');
      return false;
    }

    const relayMessage: BLEMessage = {
      ...message,
      hops: message.hops + 1,
    };

    this.messageQueue.push(relayMessage);
    console.log('Message relayed:', relayMessage);
    return true;
  }

  getQueuedMessages(): BLEMessage[] {
    return [...this.messageQueue];
  }

  clearQueue(): void {
    this.messageQueue = [];
  }

  getNearbyDevices(): BLEDevice[] {
    return Array.from(this.devices.values());
  }

  checkIsSupported(): boolean {
    return this.bleSupported;
  }

  getIsScanning(): boolean {
    return this.isScanning;
  }
}

export const bleService = new BLEService();
