'use client';

import { useServiceWorker } from "@/hooks/use-service-worker";
import { useState, useEffect } from "react";
import { AlertCircle, WifiOff, RefreshCw } from "lucide-react";

export function OfflineNotification() {
  const { isOffline, isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const [visible, setVisible] = useState(false);
  
  // Show notification after a short delay to avoid flashing on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(isOffline || isUpdateAvailable);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isOffline, isUpdateAvailable]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto z-50 max-w-md">
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg flex items-center">
          <WifiOff className="h-5 w-5 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium">You are offline</p>
            <p className="text-sm">Some features may be limited while offline.</p>
          </div>
        </div>
      )}
      
      {!isOffline && isUpdateAvailable && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Update available</p>
              <p className="text-sm">Refresh to see the latest version.</p>
            </div>
            <button 
              onClick={updateServiceWorker}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center text-sm ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 