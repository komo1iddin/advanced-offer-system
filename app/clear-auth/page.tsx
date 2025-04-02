"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ClearAuthPage() {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    setCleared(true);
  }, []);

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-6">
      <h1 className="text-2xl font-bold">Authentication State Cleared</h1>
      
      <div className="p-4 border rounded bg-muted">
        <p>All authentication data has been cleared from this browser.</p>
        <p>This includes cookies, localStorage, and sessionStorage.</p>
      </div>
      
      {cleared && (
        <div className="flex flex-col space-y-4">
          <Button onClick={() => router.push("/")}>
            Go to Home Page
          </Button>
          <Button variant="outline" onClick={() => router.push("/auth/signin")}>
            Go to Sign In
          </Button>
        </div>
      )}
    </div>
  );
} 