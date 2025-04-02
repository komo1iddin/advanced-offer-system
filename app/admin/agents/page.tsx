"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Edit, 
  Search, 
  Trash2, 
  UserPlus, 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare, 
  Facebook
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Agent {
  _id: string;
  name: string;
  description?: string;
  whatsapp?: string;
  whatsappGroup?: string;
  wechat?: string;
  wechatGroup?: string;
  telegram?: string;
  telegramGroup?: string;
  telephone?: string;
  facebookPage?: string;
  facebookGroup?: string;
  email?: string;
  website?: string;
  active: boolean;
  createdAt: string;
}

export default function AgentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is admin on client side
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/");
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin?callbackUrl=/admin/agents");
  }

  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);

  // Fetch agents
  useEffect(() => {
    async function fetchAgents() {
      try {
        setLoading(true);
        const response = await fetch('/api/agents');
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        setAgents(data.data);
        setFilteredAgents(data.data);
      } catch (error) {
        console.error('Error fetching agents:', error);
        toast({
          title: "Error",
          description: "Failed to load agents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
  }, []);

  // Filter agents based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAgents(agents);
    } else {
      const filtered = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredAgents(filtered);
    }
  }, [searchQuery, agents]);

  // Toggle agent active status
  const toggleAgentActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update agent');
      }

      setAgents(agents.map(agent => 
        agent._id === id ? { ...agent, active: !currentActive } : agent
      ));

      toast({
        title: "Success",
        description: `Agent ${!currentActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive",
      });
    }
  };

  // Delete agent
  const deleteAgent = async () => {
    if (!agentToDelete) return;

    try {
      const response = await fetch(`/api/agents/${agentToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      setAgents(agents.filter(agent => agent._id !== agentToDelete));
      setAgentToDelete(null);
      
      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      });
    }
  };

  // Show contact icons for agent
  const renderContactIcons = (agent: Agent) => {
    return (
      <div className="flex space-x-1">
        {agent.telephone && (
          <Badge variant="outline" className="px-2 py-0">
            <Phone className="h-3 w-3 mr-1" />
            Phone
          </Badge>
        )}
        {agent.email && (
          <Badge variant="outline" className="px-2 py-0">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Badge>
        )}
        {agent.website && (
          <Badge variant="outline" className="px-2 py-0">
            <Globe className="h-3 w-3 mr-1" />
            Web
          </Badge>
        )}
        {(agent.whatsapp || agent.whatsappGroup) && (
          <Badge variant="outline" className="px-2 py-0">
            <MessageSquare className="h-3 w-3 mr-1" />
            WhatsApp
          </Badge>
        )}
        {(agent.wechat || agent.wechatGroup) && (
          <Badge variant="outline" className="px-2 py-0">
            <MessageSquare className="h-3 w-3 mr-1" />
            WeChat
          </Badge>
        )}
        {(agent.telegram || agent.telegramGroup) && (
          <Badge variant="outline" className="px-2 py-0">
            <MessageSquare className="h-3 w-3 mr-1" />
            Telegram
          </Badge>
        )}
        {(agent.facebookPage || agent.facebookGroup) && (
          <Badge variant="outline" className="px-2 py-0">
            <Facebook className="h-3 w-3 mr-1" />
            Facebook
          </Badge>
        )}
      </div>
    );
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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Manage Agents</h1>
        </div>
        <Button onClick={() => router.push("/admin/agents/add")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Agent
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Agents</CardTitle>
          <CardDescription>
            View and manage your education agents and their contact information.
          </CardDescription>
          <div className="mt-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading agents...</div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No agents match your search criteria" : "No agents found. Add one to get started!"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Description</TableHead>
                    <TableHead className="font-medium">Contact Methods</TableHead>
                    <TableHead className="font-medium">Active</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent._id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {agent.description || "-"}
                      </TableCell>
                      <TableCell>{renderContactIcons(agent)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={agent.active}
                          onCheckedChange={() => toggleAgentActive(agent._id, agent.active)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/agents/edit/${agent._id}`)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setAgentToDelete(agent._id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this agent? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setAgentToDelete(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={deleteAgent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
} 