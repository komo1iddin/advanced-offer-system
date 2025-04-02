"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
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

interface Province {
  _id: string;
  name: string;
  country: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProvinceTableProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function ProvinceTable({ refreshTrigger, onRefresh }: ProvinceTableProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [provinceToDelete, setProvinceToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchProvinces();
  }, [refreshTrigger]);
  
  // Fetch all provinces
  const fetchProvinces = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/provinces");
      if (response.ok) {
        const data = await response.json();
        setProvinces(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch provinces",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle toggle province active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/provinces/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentStatus }),
      });
      
      if (response.ok) {
        const updatedProvinces = provinces.map((province) => 
          province._id === id ? { ...province, active: !currentStatus } : province
        );
        setProvinces(updatedProvinces);
        
        toast({
          title: "Success",
          description: `Province ${!currentStatus ? "activated" : "deactivated"} successfully`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update province status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling province status:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Delete a province
  const handleDelete = async () => {
    if (!provinceToDelete) return;
    
    try {
      const response = await fetch(`/api/provinces/${provinceToDelete}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setProvinces(provinces.filter((province) => province._id !== provinceToDelete));
        toast({
          title: "Success",
          description: "Province deleted successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete province",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting province:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProvinceToDelete(null);
    }
  };
  
  // Filter provinces based on search term
  const filteredProvinces = provinces.filter(
    (province) =>
      province.name.toLowerCase().includes(filter.toLowerCase()) ||
      province.country.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by name or country..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProvinces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  {filter ? "No provinces match your filter" : "No provinces found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProvinces.map((province) => (
                <TableRow key={province._id}>
                  <TableCell className="font-medium">{province.name}</TableCell>
                  <TableCell>{province.country}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={province.active}
                        onCheckedChange={() => handleToggleActive(province._id, province.active)}
                      />
                      <span className={province.active ? "text-green-600" : "text-red-600"}>
                        {province.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setProvinceToDelete(province._id)}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the province "{province.name}" from {province.country}.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setProvinceToDelete(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 