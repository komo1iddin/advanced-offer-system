"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { Layout, LayoutGrid, PlusCircle, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminForceAccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only check if authenticated - no role check
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/force");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p>You need to be signed in to access this page</p>
        <Button 
          className="mt-4" 
          onClick={() => router.push("/auth/signin?callbackUrl=/admin/force")}
        >
          Sign In
        </Button>
      </div>
    );
  }

  const currentRole = session.user.role || "viewer";

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        {currentRole !== "admin" && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md p-4 mb-6 text-yellow-800 dark:text-yellow-300">
            <p className="font-semibold mb-1">Warning: You don't have admin privileges</p>
            <p className="text-sm">
              Your current role is <span className="font-mono bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded">{currentRole}</span>. 
              Some features may not work correctly.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard (Forced Access)
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.name}. Manage your StudyBridge platform from here.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Study Offers Management Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  Study Offers
                </CardTitle>
                <CardDescription>Manage university study offers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link 
                    href="/admin/add-offer" 
                    className="flex items-center justify-between p-3 rounded-md text-sm bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add New Offer
                    </span>
                  </Link>
                  <Link 
                    href="/admin/offers" 
                    className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <Layout className="h-4 w-4" />
                      Manage All Offers
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* User Management Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Site Settings
                </CardTitle>
                <CardDescription>Configure application settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link 
                    href="/admin/settings" 
                    className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      General Settings
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Debug Information Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Session Information
                </CardTitle>
                <CardDescription>Debug your authorization status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-[100px]">
                    <p><strong>User ID:</strong> {session.user.id}</p>
                    <p><strong>Name:</strong> {session.user.name}</p>
                    <p><strong>Email:</strong> {session.user.email}</p>
                    <p><strong>Role:</strong> {session.user.role || "No role"}</p>
                  </div>
                  <Link 
                    href="/debug-session" 
                    className="flex items-center justify-between p-3 rounded-md text-sm bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      View Full Session Debug
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 