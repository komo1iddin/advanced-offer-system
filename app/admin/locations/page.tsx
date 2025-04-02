"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminNav from "@/components/AdminNav";

// Import custom hook and components
import { useLocationManager } from "./hooks/useLocationManager";
import LocationsTable from "./components/LocationsTable";
import LocationDialogs from "./components/LocationDialogs";

export default function LocationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Use our custom hook for managing locations
  const locationManager = useLocationManager();
  const { 
    provinces, 
    cities, 
    locations, 
    isLoading,
    loadData,
    handleAddProvince,
    handleUpdateProvince,
    handleDeleteProvince,
    handleEditProvince,
    handleAddCity,
    handleUpdateCity,
    handleDeleteCity,
    handleEditCity,
    dialogControls
  } = locationManager;

  // Memoize the check admin status callback
  const checkAdminStatus = useCallback(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/locations");
      return;
    }
    
    if (session?.user?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Check admin status on component mount
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // Fetch data on component mount - only once
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      loadData();
    }
  }, [status, session, loadData]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated or not admin, don't render anything (router will redirect)
  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav />
      
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Location Management</h1>
          
          {/* All dialogs are contained in this component */}
          <LocationDialogs
            provinces={provinces}
            dialogs={dialogControls}
            onAddProvince={handleAddProvince}
            onUpdateProvince={handleUpdateProvince}
            onAddCity={handleAddCity}
            onUpdateCity={handleUpdateCity}
          />
        </div>
        
        {/* Locations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
            <CardDescription>
              Manage provinces/states and cities in your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationsTable
              locations={locations}
              isLoading={isLoading}
              provinces={provinces}
              cities={cities}
              onEditProvince={handleEditProvince}
              onEditCity={handleEditCity}
              onDeleteProvince={handleDeleteProvince}
              onDeleteCity={handleDeleteCity}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 