// Offline queue service for storing SOS events when offline
import type { SOSType, GeoLocation } from 'declarations/backend';

export interface QueuedSOSEvent {
  id: string;
  sosType: SOSType;
  location: GeoLocation;
  extraData: string | null;
  timestamp: number;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'sos_offline_queue';
const MAX_RETRY_COUNT = 5;

export class OfflineQueueService {
  private queue: QueuedSOSEvent[] = [];
  private syncInProgress = false;

  constructor() {
    this.loadQueue();
    this.setupSyncListener();
  }

  // Setup listener for sync events
  private setupSyncListener(): void {
    window.addEventListener('sync-offline-queue', () => {
      this.processSyncRequest();
    });
  }

  // Process sync request
  private async processSyncRequest(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    console.log('[Offline Queue] Processing sync request');
    // Dispatch event for components to handle
    window.dispatchEvent(new CustomEvent('process-offline-queue', {
      detail: { queue: this.getQueue() }
    }));
  }

  // Add event to queue
  addToQueue(sosType: SOSType, location: GeoLocation, extraData: string | null): string {
    const event: QueuedSOSEvent = {
      id: `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sosType,
      location,
      extraData,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(event);
    this.saveQueue();

    // Notify service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'QUEUE_SOS_ALERT',
      });
    }

    return event.id;
  }

  // Get all queued events
  getQueue(): QueuedSOSEvent[] {
    return [...this.queue];
  }

  // Remove event from queue
  removeFromQueue(eventId: string): void {
    this.queue = this.queue.filter(event => event.id !== eventId);
    this.saveQueue();
  }

  // Increment retry count
  incrementRetry(eventId: string): boolean {
    const event = this.queue.find(e => e.id === eventId);
    if (!event) return false;

    event.retryCount++;

    if (event.retryCount >= MAX_RETRY_COUNT) {
      this.removeFromQueue(eventId);
      return false;
    }

    this.saveQueue();
    return true;
  }

  // Clear all queued events
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }

  // Check if queue has events
  hasQueuedEvents(): boolean {
    return this.queue.length > 0;
  }

  // Get queue size
  getQueueSize(): number {
    return this.queue.length;
  }

  // Set sync in progress flag
  setSyncInProgress(inProgress: boolean): void {
    this.syncInProgress = inProgress;
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }
}

export const offlineQueueService = new OfflineQueueService();
