"use client";

import { useState, useEffect } from "react";
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

interface EditAgentPageProps {
  params: {
    id: string;
  };
}

export default function EditAgentPage({ params }: EditAgentPageProps) {
  const agentId = params.id;
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is admin on client side
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/");
  }

  if (status === "unauthenticated") {
    redirect(`/auth/signin?callbackUrl=/admin/agents/edit/${agentId}`);
  }

  // Agent state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappGroup, setWhatsappGroup] = useState("");
  const [wechat, setWechat] = useState("");
  const [wechatGroup, setWechatGroup] = useState("");
  const [telegram, setTelegram] = useState("");
  const [telegramGroup, setTelegramGroup] = useState("");
  const [telephone, setTelephone] = useState("");
  const [facebookPage, setFacebookPage] = useState("");
  const [facebookGroup, setFacebookGroup] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [active, setActive] = useState(true);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch agent data
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/agents/${agentId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Agent not found");
          } else {
            throw new Error("Failed to fetch agent");
          }
        }
        
        const data = await response.json();
        
        // Set state with fetched data - directly use the data as it's no longer wrapped
        setName(data.name || "");
        setDescription(data.description || "");
        setWhatsapp(data.whatsapp || "");
        setWhatsappGroup(data.whatsappGroup || "");
        setWechat(data.wechat || "");
        setWechatGroup(data.wechatGroup || "");
        setTelegram(data.telegram || "");
        setTelegramGroup(data.telegramGroup || "");
        setTelephone(data.telephone || "");
        setFacebookPage(data.facebookPage || "");
        setFacebookGroup(data.facebookGroup || "");
        setEmail(data.email || "");
        setWebsite(data.website || "");
        setActive(data.active ?? true);
        
      } catch (error) {
        console.error('Error fetching agent:', error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId && status === "authenticated") {
      fetchAgent();
    }
  }, [agentId, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an agent name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const agentData = {
        name: name.trim(),
        description: description.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        whatsappGroup: whatsappGroup.trim() || undefined,
        wechat: wechat.trim() || undefined,
        wechatGroup: wechatGroup.trim() || undefined,
        telegram: telegram.trim() || undefined,
        telegramGroup: telegramGroup.trim() || undefined,
        telephone: telephone.trim() || undefined,
        facebookPage: facebookPage.trim() || undefined,
        facebookGroup: facebookGroup.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        active,
      };
      
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = 'Failed to update agent';
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
        description: "Agent has been updated successfully",
      });
      
      setTimeout(() => {
        router.push("/admin/agents");
      }, 1500);
      
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update agent",
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
          <Link href="/admin/agents" className="inline-flex items-center text-sm mb-6 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
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
                onClick={() => router.push("/admin/agents")}
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
        <Link href="/admin/agents" className="inline-flex items-center text-sm mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agents
        </Link>
        
        <Card className="border shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="text-xl">Edit Agent</CardTitle>
              <CardDescription>Update agent information</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Agent Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter agent name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a brief description of the agent"
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
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Social Media</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Enter WhatsApp contact"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsappGroup">WhatsApp Group</Label>
                    <Input
                      id="whatsappGroup"
                      value={whatsappGroup}
                      onChange={(e) => setWhatsappGroup(e.target.value)}
                      placeholder="Enter WhatsApp group link"
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="wechatGroup">WeChat Group</Label>
                    <Input
                      id="wechatGroup"
                      value={wechatGroup}
                      onChange={(e) => setWechatGroup(e.target.value)}
                      placeholder="Enter WeChat group info"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="Enter Telegram username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telegramGroup">Telegram Group</Label>
                    <Input
                      id="telegramGroup"
                      value={telegramGroup}
                      onChange={(e) => setTelegramGroup(e.target.value)}
                      placeholder="Enter Telegram group link"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="facebookPage">Facebook Page</Label>
                    <Input
                      id="facebookPage"
                      value={facebookPage}
                      onChange={(e) => setFacebookPage(e.target.value)}
                      placeholder="Enter Facebook page URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="facebookGroup">Facebook Group</Label>
                    <Input
                      id="facebookGroup"
                      value={facebookGroup}
                      onChange={(e) => setFacebookGroup(e.target.value)}
                      placeholder="Enter Facebook group URL"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/agents")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Update Agent"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Toaster />
      </div>
    </div>
  );
} 