'use client';

import { useState, useEffect } from 'react';

// Function to register service worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker available');
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Error registering service worker:', error);
      return null;
    }
  }
  
  console.warn('Service workers are not supported in this browser');
  return null;
};

// Hook to manage service worker registration and updates
export function useServiceWorker() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [waitingServiceWorker, setWaitingServiceWorker] = useState<ServiceWorker | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  
  useEffect(() => {
    // Only run in production and in the browser
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
      return;
    }
    
    // Set up service worker
    const setupServiceWorker = async () => {
      const registration = await registerServiceWorker();
      
      if (!registration) return;
      
      // Check for existing waiting service worker
      if (registration.waiting) {
        setWaitingServiceWorker(registration.waiting);
        setIsUpdateAvailable(true);
      }
      
      // Listen for new service workers
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingServiceWorker(newWorker);
            setIsUpdateAvailable(true);
          }
        });
      });
      
      // Detect controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    };
    
    setupServiceWorker();
    
    // Handle online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Function to update the service worker
  const updateServiceWorker = () => {
    if (!waitingServiceWorker) return;
    
    waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
  };
  
  return {
    isOffline,
    isUpdateAvailable,
    updateServiceWorker
  };
} 