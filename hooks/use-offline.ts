import { useEffect, useState } from 'react';
import { indexedDB } from '@/lib/indexeddb';
import { offlineSync } from '@/lib/offline-sync';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const initializeOffline = async () => {
      try {
        // Initialize IndexedDB
        await indexedDB.init();
        console.log('[v0] IndexedDB initialized');

        // Register service worker
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('[v0] Service Worker registered:', registration);
          }).catch(error => {
            console.error('[v0] Service Worker registration failed:', error);
          });
        }

        // Start auto sync
        offlineSync.startAutoSync(30000); // Every 30 seconds

        setIsInitialized(true);
      } catch (error) {
        console.error('[v0] Offline initialization failed:', error);
      }
    };

    initializeOffline();

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('[v0] Coming online');
      setIsOnline(true);
      offlineSync.syncWithServer();
    };

    const handleOffline = () => {
      console.log('[v0] Going offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending sync count periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updatePendingCount = async () => {
      const pending = await offlineSync.getPendingItems();
      setPendingSyncCount(pending.length);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  return {
    isOnline,
    isInitialized,
    pendingSyncCount,
    syncNow: () => offlineSync.syncWithServer(),
  };
}
