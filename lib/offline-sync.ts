import { indexedDB } from './indexeddb';

export interface SyncQueueItem {
  id: string;
  operation_type: 'CREATE' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  data: Record<string, any>;
  status: 'pending' | 'synced' | 'failed';
  created_at: string;
  synced_at?: string;
}

class OfflineSyncService {
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'created_at' | 'status'>): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      ...item,
    };

    console.log('[v0] Adding to sync queue:', queueItem);
    await indexedDB.set('sync_queue', queueItem);
  }

  async getPendingItems(): Promise<SyncQueueItem[]> {
    const allItems = await indexedDB.getAll('sync_queue');
    return allItems.filter(item => item.status === 'pending');
  }

  async syncWithServer(): Promise<void> {
    if (this.syncInProgress) {
      console.log('[v0] Sync already in progress');
      return;
    }

    this.syncInProgress = true;

    try {
      const pendingItems = await this.getPendingItems();

      if (pendingItems.length === 0) {
        console.log('[v0] No pending items to sync');
        return;
      }

      console.log(`[v0] Syncing ${pendingItems.length} pending items...`);

      for (const item of pendingItems) {
        try {
          const success = await this.syncItem(item);

          if (success) {
            item.status = 'synced';
            item.synced_at = new Date().toISOString();
            await indexedDB.set('sync_queue', item);
            console.log(`[v0] Synced item: ${item.id}`);
          } else {
            item.status = 'failed';
            await indexedDB.set('sync_queue', item);
          }
        } catch (error) {
          console.error('[v0] Error syncing item:', error);
          item.status = 'failed';
          await indexedDB.set('sync_queue', item);
        }
      }

      console.log('[v0] Sync completed');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      return response.ok;
    } catch (error) {
      console.error('[v0] Network error during sync:', error);
      return false;
    }
  }

  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      console.log('[v0] Auto sync already started');
      return;
    }

    console.log('[v0] Starting auto sync every', intervalMs, 'ms');
    this.syncInterval = setInterval(() => {
      this.syncWithServer();
    }, intervalMs);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[v0] Auto sync stopped');
    }
  }
}

export const offlineSync = new OfflineSyncService();
