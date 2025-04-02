'use client';

import dynamic from 'next/dynamic';

// Dynamically import the OfflineNotification component with no SSR
const OfflineNotificationComponent = dynamic(
  () => import("@/components/offline-notification").then(mod => mod.OfflineNotification),
  { ssr: false }
);

export function OfflineNotificationWrapper() {
  return <OfflineNotificationComponent />;
} 