"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function AddUniversityDirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is admin on client side
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/");
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin?callbackUrl=/admin/university-directs/add");
  }

  // University Direct state
  const [universityName, setUniversityName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [wechat, setWechat] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [active, setActive] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!universityName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a university name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const universityDirectData = {
        universityName: universityName.trim(),
        departmentName: departmentName.trim() || undefined,
        contactPersonName: contactPersonName.trim() || undefined,
        position: position.trim() || undefined,
        description: description.trim() || undefined,
        wechat: wechat.trim() || undefined,
        telephone: telephone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        active,
      };
      
      const response = await fetch('/api/university-directs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(universityDirectData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create university contact');
      }
      
      toast({
        title: "Success",
        description: "University contact has been added successfully",
      });
      
      setTimeout(() => {
        router.push("/admin/university-directs");
      }, 1500);
      
    } catch (error) {
      console.error('Error creating university contact:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create university contact",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/university-directs" className="inline-flex items-center text-sm mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to University Contacts
        </Link>
        
        <Card className="border shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-xl">Add New University Contact</CardTitle>
              <CardDescription>Create a new direct university contact</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">University Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="universityName">
                    University Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="universityName"
                    value={universityName}
                    onChange={(e) => setUniversityName(e.target.value)}
                    placeholder="Enter university name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input
                    id="departmentName"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="Enter department name (optional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a brief description (optional)"
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={active}
                    onCheckedChange={setActive}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Person</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonName">Contact Person Name</Label>
                    <Input
                      id="contactPersonName"
                      value={contactPersonName}
                      onChange={(e) => setContactPersonName(e.target.value)}
                      placeholder="Enter contact person name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Enter position/title"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Telephone</Label>
                    <Input
                      id="telephone"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="Enter telephone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Enter website URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="wechat">WeChat</Label>
                    <Input
                      id="wechat"
                      value={wechat}
                      onChange={(e) => setWechat(e.target.value)}
                      placeholder="Enter WeChat ID"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/university-directs")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save University Contact"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Toaster />
      </div>
    </div>
  );
} 