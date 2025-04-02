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
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare, 
  User
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

interface UniversityDirect {
  _id: string;
  universityName: string;
  departmentName?: string;
  contactPersonName?: string;
  position?: string;
  description?: string;
  wechat?: string;
  telephone?: string;
  email?: string;
  website?: string;
  active: boolean;
  createdAt: string;
}

export default function UniversityDirectsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check if user is admin on client side
  if (status === "authenticated" && session?.user?.role !== "admin") {
    redirect("/");
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin?callbackUrl=/admin/university-directs");
  }

  const [universityDirects, setUniversityDirects] = useState<UniversityDirect[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [universityDirectToDelete, setUniversityDirectToDelete] = useState<string | null>(null);
  const [filteredUniversityDirects, setFilteredUniversityDirects] = useState<UniversityDirect[]>([]);

  // Fetch university directs
  useEffect(() => {
    async function fetchUniversityDirects() {
      try {
        setLoading(true);
        const response = await fetch('/api/university-directs');
        if (!response.ok) {
          throw new Error('Failed to fetch university directs');
        }
        const data = await response.json();
        setUniversityDirects(data.data);
        setFilteredUniversityDirects(data.data);
      } catch (error) {
        console.error('Error fetching university directs:', error);
        toast({
          title: "Error",
          description: "Failed to load university directs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUniversityDirects();
  }, []);

  // Filter university directs based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUniversityDirects(universityDirects);
    } else {
      const filtered = universityDirects.filter(
        (universityDirect) =>
          universityDirect.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (universityDirect.departmentName && universityDirect.departmentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (universityDirect.contactPersonName && universityDirect.contactPersonName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUniversityDirects(filtered);
    }
  }, [searchQuery, universityDirects]);

  // Toggle university direct active status
  const toggleUniversityDirectActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/university-directs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update university direct');
      }

      setUniversityDirects(universityDirects.map(universityDirect => 
        universityDirect._id === id ? { ...universityDirect, active: !currentActive } : universityDirect
      ));

      toast({
        title: "Success",
        description: `University direct ${!currentActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating university direct:', error);
      toast({
        title: "Error",
        description: "Failed to update university direct status",
        variant: "destructive",
      });
    }
  };

  // Delete university direct
  const deleteUniversityDirect = async () => {
    if (!universityDirectToDelete) return;

    try {
      const response = await fetch(`/api/university-directs/${universityDirectToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete university direct');
      }

      setUniversityDirects(universityDirects.filter(universityDirect => universityDirect._id !== universityDirectToDelete));
      setUniversityDirectToDelete(null);
      
      toast({
        title: "Success",
        description: "University direct deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting university direct:', error);
      toast({
        title: "Error",
        description: "Failed to delete university direct",
        variant: "destructive",
      });
    }
  };

  // Show contact icons for university direct
  const renderContactIcons = (universityDirect: UniversityDirect) => {
    return (
      <div className="flex space-x-1">
        {universityDirect.telephone && (
          <Badge variant="outline" className="px-2 py-0">
            <Phone className="h-3 w-3 mr-1" />
            Phone
          </Badge>
        )}
        {universityDirect.email && (
          <Badge variant="outline" className="px-2 py-0">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Badge>
        )}
        {universityDirect.website && (
          <Badge variant="outline" className="px-2 py-0">
            <Globe className="h-3 w-3 mr-1" />
            Web
          </Badge>
        )}
        {universityDirect.wechat && (
          <Badge variant="outline" className="px-2 py-0">
            <MessageSquare className="h-3 w-3 mr-1" />
            WeChat
          </Badge>
        )}
      </div>
    );
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/university-directs/edit/${id}`);
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
          <h1 className="text-2xl font-bold">Manage University Directs</h1>
        </div>
        <Button onClick={() => router.push("/admin/university-directs/add")}>
          <Building2 className="mr-2 h-4 w-4" />
          Add New University Direct
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>University Directs</CardTitle>
          <CardDescription>
            View and manage your direct university contacts and their information.
          </CardDescription>
          <div className="mt-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search university directs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading university directs...</div>
          ) : filteredUniversityDirects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No university directs match your search criteria" : "No university directs found. Add one to get started!"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">University</TableHead>
                    <TableHead className="font-medium">Department</TableHead>
                    <TableHead className="font-medium">Contact Person</TableHead>
                    <TableHead className="font-medium">Contact Methods</TableHead>
                    <TableHead className="font-medium">Active</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUniversityDirects.map((universityDirect) => (
                    <TableRow key={universityDirect._id}>
                      <TableCell className="font-medium">{universityDirect.universityName}</TableCell>
                      <TableCell>{universityDirect.departmentName || "-"}</TableCell>
                      <TableCell>
                        {universityDirect.contactPersonName ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{universityDirect.contactPersonName}</span>
                            {universityDirect.position && (
                              <span className="text-xs text-muted-foreground">
                                ({universityDirect.position})
                              </span>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{renderContactIcons(universityDirect)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={universityDirect.active}
                          onCheckedChange={() => toggleUniversityDirectActive(universityDirect._id, universityDirect.active)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(universityDirect._id)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setUniversityDirectToDelete(universityDirect._id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete University Direct</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this university direct? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setUniversityDirectToDelete(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={deleteUniversityDirect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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