"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

interface EditUniversityDirectPageProps {
  params: {
    id: string;
  };
}

export default function EditUniversityDirectPage({ params }: EditUniversityDirectPageProps) {
  const universityDirectId = params.id;
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is admin on client side
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/");
  }

  if (status === "unauthenticated") {
    redirect(`/auth/signin?callbackUrl=/admin/university-directs/edit/${universityDirectId}`);
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
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch university direct data
  useEffect(() => {
    const fetchUniversityDirect = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/university-directs/${universityDirectId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("University contact not found");
          } else {
            throw new Error("Failed to fetch university contact");
          }
        }
        
        const data = await response.json();
        
        // Set state with fetched data - directly use the data as it's no longer wrapped
        setUniversityName(data.universityName || "");
        setDepartmentName(data.departmentName || "");
        setContactPersonName(data.contactPersonName || "");
        setPosition(data.position || "");
        setDescription(data.description || "");
        setWechat(data.wechat || "");
        setTelephone(data.telephone || "");
        setEmail(data.email || "");
        setWebsite(data.website || "");
        setActive(data.active ?? true);
        
      } catch (error) {
        console.error('Error fetching university contact:', error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (universityDirectId && status === "authenticated") {
      fetchUniversityDirect();
    }
  }, [universityDirectId, status]);

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
      
      const response = await fetch(`/api/university-directs/${universityDirectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(universityDirectData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = 'Failed to update university contact';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Ignore JSON parsing error
        }
        throw new Error(errorMessage);
      }
      
      toast({
        title: "Success",
        description: "University contact has been updated successfully",
      });
      
      setTimeout(() => {
        router.push("/admin/university-directs");
      }, 1500);
      
    } catch (error) {
      console.error('Error updating university contact:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update university contact",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/admin/university-directs" className="inline-flex items-center text-sm mb-6 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to University Contacts
          </Link>
          
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-destructive/10">
              <CardTitle className="text-xl text-destructive">Error</CardTitle>
              <CardDescription className="text-destructive/90">{error}</CardDescription>
            </CardHeader>
            <CardFooter className="p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/university-directs")}
              >
                Go Back
              </Button>
            </CardFooter>
          </Card>
        </div>
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
              <CardTitle className="text-xl">Edit University Contact</CardTitle>
              <CardDescription>Update university contact information</CardDescription>
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
                {isSubmitting ? "Saving..." : "Update University Contact"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Toaster />
      </div>
    </div>
  );
} 