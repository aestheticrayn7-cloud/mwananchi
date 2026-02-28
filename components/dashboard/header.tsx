'use client';

import { useAuth } from '@/hooks/use-auth';
import { Menu, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { offlineSync } from '@/lib/offline-sync';

interface HeaderProps {
  onMenuClick: () => void;
  isOnline: boolean;
  pendingSyncCount: number;
}

export default function Header({
  onMenuClick,
  isOnline,
  pendingSyncCount,
}: HeaderProps) {
  const { user, store } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{store?.name}</h1>
            <p className="text-sm text-gray-600">{user?.fullName}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Sync Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}

            {/* Pending Sync Count */}
            {pendingSyncCount > 0 && (
              <button
                onClick={() => offlineSync.syncWithServer()}
                className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100"
              >
                <RefreshCw className="w-4 h-4" />
                Sync ({pendingSyncCount})
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
