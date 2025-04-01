"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function DebugSessionPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const refreshSession = async () => {
    try {
      setRefreshing(true);
      await update(); // Force a session refresh
      toast({
        title: "Session refreshed",
        description: "Your session has been refreshed",
      });
      setRefreshing(false);
    } catch (error) {
      console.error("Failed to refresh session:", error);
      toast({
        title: "Error",
        description: "Failed to refresh session",
        variant: "destructive",
      });
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut({ redirect: false });
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      // Redirect to sign in page after a short delay
      setTimeout(() => {
        router.push("/auth/signin?callbackUrl=/admin");
      }, 1500);
    } catch (error) {
      console.error("Failed to sign out:", error);
      setSigningOut(false);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border shadow-sm mb-8">
          <CardHeader>
            <CardTitle>Session Debug</CardTitle>
            <CardDescription>View your current session information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Status</h3>
              <p className="px-4 py-2 bg-muted rounded">{status}</p>
            </div>

            {session && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2">User</h3>
                  <pre className="px-4 py-2 bg-muted rounded overflow-auto text-xs">
                    {JSON.stringify(session.user, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Full Session</h3>
                  <pre className="px-4 py-2 bg-muted rounded overflow-auto text-xs">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {!session && status === "unauthenticated" && (
              <div className="text-center">
                <p className="mb-4">You are not signed in</p>
                <Button onClick={() => router.push("/auth/signin?callbackUrl=/debug-session")}>
                  Sign In
                </Button>
              </div>
            )}

            {status === "authenticated" && (
              <div className="flex flex-col gap-4">
                <Button 
                  onClick={refreshSession}
                  disabled={refreshing}
                >
                  {refreshing ? "Refreshing..." : "Refresh Session"}
                </Button>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={() => router.push("/admin/force")}
                    variant="outline"
                  >
                    Force Access Admin Dashboard
                  </Button>
                  
                  <Button 
                    onClick={() => router.push("/")}
                    variant="ghost"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Troubleshooting Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Possible Issues</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Session not updated after MongoDB change:</strong> If you manually updated your role in 
                  MongoDB, your session might still have the old role value. Try signing out and signing back in.
                </li>
                <li>
                  <strong>NextAuth JWT token:</strong> Your role is stored in the JWT token which may not be updated 
                  until the token expires or you sign in again.
                </li>
                <li>
                  <strong>Case sensitivity:</strong> Ensure the role in MongoDB is exactly "admin" (all lowercase).
                </li>
              </ul>
            </div>

            <Button
              onClick={handleSignOut}
              variant="destructive"
              disabled={signingOut}
            >
              {signingOut ? "Signing Out..." : "Sign Out & Sign In Again"}
            </Button>
          </CardContent>
        </Card>

        <Toaster />
      </div>
    </div>
  );
} 