"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AlertCircle, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SetAdminPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Get error information from URL
  const error = searchParams.get("error");
  const role = searchParams.get("role");

  // Display toast message once when error params are present
  useEffect(() => {
    if (error) {
      let errorMessage = "You need admin privileges to access that page";
      
      if (error === "NotAdmin") {
        errorMessage = `Access denied: Your current role is "${role || "viewer"}" but "admin" role is required`;
      }
      
      toast({
        title: "Access Restricted",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [error, role]);

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Please sign in to use this feature</p>
        <Button className="mt-4" onClick={() => router.push("/auth/signin?callbackUrl=/set-admin")}>
          Sign In
        </Button>
      </div>
    );
  }

  const handleSetAdmin = async () => {
    try {
      setLoading(true);

      // Update user to admin in database
      const response = await fetch("/api/users/set-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user role");
      }

      // Update session with new role
      await update({
        ...session,
        user: {
          ...session?.user,
          role: "admin",
        },
      });

      toast({
        title: "Success",
        description: "Your account has been updated with admin privileges",
      });

      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (error) {
      console.error("Error setting admin role:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentRole = session?.user?.role || "viewer";
  const isAlreadyAdmin = currentRole === "admin";

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
              {error === "NotAdmin" 
                ? `Your current role is "${role || "viewer"}" but "admin" role is required.` 
                : "You need admin privileges to access that page."}
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="border shadow-sm">
          <CardHeader className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              {isAlreadyAdmin 
                ? "You already have admin privileges" 
                : "Update your account with admin privileges"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md text-sm">
              <p><strong>Current User:</strong> {session?.user?.name}</p>
              <p><strong>Email:</strong> {session?.user?.email}</p>
              <p><strong>Current Role:</strong> {currentRole}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSetAdmin} 
              disabled={loading || isAlreadyAdmin}
            >
              {loading 
                ? "Updating..." 
                : isAlreadyAdmin 
                  ? "Already an Admin" 
                  : "Grant Admin Privileges"}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>

        <Toaster />
      </div>
    </div>
  );
} 