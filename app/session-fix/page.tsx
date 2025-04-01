"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AlertCircle, CheckCircle2, RefreshCw, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DiagnosticResult {
  success: boolean;
  message: string;
  sessionInfo?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  databaseInfo?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  mismatch?: boolean;
  nextSteps?: string;
}

export default function SessionFixPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [activeTab, setActiveTab] = useState("diagnosis");

  const diagnoseSession = async () => {
    try {
      setDiagnosing(true);
      const response = await fetch("/api/auth/update-session");
      
      if (!response.ok) {
        throw new Error("Failed to diagnose session");
      }
      
      const result = await response.json();
      setDiagnosticResult(result);
      setActiveTab(result.mismatch ? "fix" : "diagnosis");
      
      if (result.mismatch) {
        toast({
          title: "Role Mismatch Detected",
          description: `Your session role (${result.sessionInfo.role || 'undefined'}) doesn't match your database role (${result.databaseInfo.role})`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Session Looks Good",
          description: "Your session role matches the database role",
        });
      }
    } catch (error) {
      console.error("Error diagnosing session:", error);
      toast({
        title: "Error",
        description: "Failed to diagnose session",
        variant: "destructive",
      });
    } finally {
      setDiagnosing(false);
    }
  };
  
  const clearCookies = () => {
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    toast({
      title: "Cookies Cleared",
      description: "All browser cookies have been cleared",
    });
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      
      // First clear all cookies
      clearCookies();
      
      // Then sign out properly
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
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  // Run diagnostic automatically when page loads if user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      diagnoseSession();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading session information...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Please sign in to use this feature</p>
        <Button className="mt-4" onClick={() => router.push("/auth/signin?callbackUrl=/session-fix")}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Session Repair Tool
        </h1>
        
        <Tabs defaultValue="diagnosis" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="fix">Fix Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagnosis" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Session Diagnosis
                </CardTitle>
                <CardDescription>
                  Check if your session information matches the database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {diagnosticResult && (
                  <>
                    <div className="space-y-4">
                      {diagnosticResult.mismatch ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Role Mismatch Detected</AlertTitle>
                          <AlertDescription>
                            Your session doesn't match the database. This is likely why you can't access admin features.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/20">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <AlertTitle className="text-green-600 dark:text-green-400">Everything Looks Good</AlertTitle>
                          <AlertDescription>
                            Your session role matches your database role.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Session Information</h3>
                        <div className="bg-muted p-4 rounded-md text-sm">
                          <p><strong>User ID:</strong> {diagnosticResult.sessionInfo?.id}</p>
                          <p><strong>Name:</strong> {diagnosticResult.sessionInfo?.name}</p>
                          <p><strong>Email:</strong> {diagnosticResult.sessionInfo?.email}</p>
                          <p><strong>Role:</strong> <span className={
                            diagnosticResult.mismatch ? "text-red-500 font-mono" : "font-mono"
                          }>{diagnosticResult.sessionInfo?.role || "undefined"}</span></p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Database Information</h3>
                        <div className="bg-muted p-4 rounded-md text-sm">
                          <p><strong>User ID:</strong> {diagnosticResult.databaseInfo?.id}</p>
                          <p><strong>Name:</strong> {diagnosticResult.databaseInfo?.name}</p>
                          <p><strong>Email:</strong> {diagnosticResult.databaseInfo?.email}</p>
                          <p><strong>Role:</strong> <span className="font-mono">{diagnosticResult.databaseInfo?.role}</span></p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {!diagnosticResult && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Run a diagnosis to see the results</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={diagnoseSession} disabled={diagnosing}>
                  {diagnosing ? "Running Diagnosis..." : "Run Diagnosis"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="fix" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Fix Options
                </CardTitle>
                <CardDescription>
                  Solutions to fix session/database mismatches
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Option 1: Complete Sign Out</h3>
                  <p className="text-muted-foreground">
                    This will clear all cookies, sign you out completely, and let you sign back in with a fresh session.
                  </p>
                  <Button 
                    onClick={handleSignOut} 
                    disabled={loading}
                    variant="destructive"
                    className="w-full"
                  >
                    {loading ? "Signing Out..." : "Clear Cookies & Sign Out"}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Option 2: Use Force Access</h3>
                  <p className="text-muted-foreground">
                    Bypass role checks by using the force access admin page instead.
                  </p>
                  <Button 
                    onClick={() => router.push("/admin/force")}
                    variant="outline"
                    className="w-full"
                  >
                    Force Access Admin Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </div>
        
        <Toaster />
      </div>
    </div>
  );
} 