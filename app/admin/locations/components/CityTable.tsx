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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface City {
  _id: string;
  name: string;
  provinceId: string | {
    _id: string;
    name: string;
    country: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Province {
  _id: string;
  name: string;
  country: string;
  active: boolean;
}

interface CityTableProps {
  refreshTrigger: number;
  onRefresh: () => void;
  onRefreshProvinces: () => void;
}

export default function CityTable({ refreshTrigger, onRefresh, onRefreshProvinces }: CityTableProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [cityToDelete, setCityToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchCities();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchProvinces();
  }, []);
  
  // Fetch all cities with province details
  const fetchCities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cities?includeProvince=true");
      if (response.ok) {
        const data = await response.json();
        setCities(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch cities",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all provinces for filtering
  const fetchProvinces = async () => {
    try {
      const response = await fetch("/api/provinces");
      if (response.ok) {
        const data = await response.json();
        setProvinces(data.data);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };
  
  // Handle toggle city active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/cities/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentStatus }),
      });
      
      if (response.ok) {
        const updatedCities = cities.map((city) => 
          city._id === id ? { ...city, active: !currentStatus } : city
        );
        setCities(updatedCities);
        
        toast({
          title: "Success",
          description: `City ${!currentStatus ? "activated" : "deactivated"} successfully`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update city status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling city status:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Delete a city
  const handleDelete = async () => {
    if (!cityToDelete) return;
    
    try {
      const response = await fetch(`/api/cities/${cityToDelete}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setCities(cities.filter((city) => city._id !== cityToDelete));
        toast({
          title: "Success",
          description: "City deleted successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete city",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting city:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setCityToDelete(null);
    }
  };
  
  // Get province name from province ID or object
  const getProvinceName = (provinceData: string | {_id: string, name: string, country: string}) => {
    if (typeof provinceData === 'string') {
      const province = provinces.find(p => p._id === provinceData);
      return province ? province.name : 'Unknown Province';
    } else {
      return provinceData.name;
    }
  };

  // Get country name from province ID or object
  const getCountryName = (provinceData: string | {_id: string, name: string, country: string}) => {
    if (typeof provinceData === 'string') {
      const province = provinces.find(p => p._id === provinceData);
      return province ? province.country : 'Unknown Country';
    } else {
      return provinceData.country;
    }
  };

  // Get province ID consistently
  const getProvinceId = (provinceData: string | {_id: string, name: string, country: string}) => {
    return typeof provinceData === 'string' ? provinceData : provinceData._id;
  };
  
  // Filter cities based on search term and province filter
  const filteredCities = cities.filter((city) => {
    const nameMatch = city.name.toLowerCase().includes(filter.toLowerCase());
    const provinceMatch = 
      provinceFilter === "all" || 
      getProvinceId(city.provinceId) === provinceFilter;
    
    return nameMatch && provinceMatch;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Input
            placeholder="Filter by city name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <Select value={provinceFilter} onValueChange={setProvinceFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by province" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Provinces</SelectItem>
              {provinces.map((province) => (
                <SelectItem key={province._id} value={province._id}>
                  {province.name} ({province.country})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {filter || provinceFilter !== "all" ? "No cities match your filter" : "No cities found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCities.map((city) => (
                <TableRow key={city._id}>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>{getProvinceName(city.provinceId)}</TableCell>
                  <TableCell>{getCountryName(city.provinceId)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={city.active}
                        onCheckedChange={() => handleToggleActive(city._id, city.active)}
                      />
                      <span className={city.active ? "text-green-600" : "text-red-600"}>
                        {city.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setCityToDelete(city._id)}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the city "{city.name}" 
                            from {getProvinceName(city.provinceId)}, {getCountryName(city.provinceId)}.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setCityToDelete(null)}>
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