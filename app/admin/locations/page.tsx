"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminNav from "@/components/AdminNav";
import { z } from "zod";
import { PlusCircle, MapPin, Pencil, Trash2 } from "lucide-react";

interface Province {
  _id: string;
  name: string;
  active: boolean;
}

interface City {
  _id: string;
  name: string;
  provinceId: {
    _id: string;
    name: string;
  };
  active: boolean;
}

// Combined interface for the table view
interface LocationRow {
  id: string;
  type: 'province' | 'city';
  name: string;
  provinceName?: string;
  provinceId?: string;
  active: boolean;
}

// Validation schemas
const provinceSchema = z.object({
  name: z.string().min(1, "Province name is required"),
});

const citySchema = z.object({
  name: z.string().min(1, "City name is required"),
  provinceId: z.string().min(1, "Province is required"),
});

export default function LocationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  // Data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProvince, setIsAddingProvince] = useState(false);
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [isEditingProvince, setIsEditingProvince] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  
  // Form states
  const [provinceForm, setProvinceForm] = useState({ name: "", active: true });
  const [cityForm, setCityForm] = useState({ name: "", provinceId: "", active: true });
  const [provinceErrors, setProvinceErrors] = useState<Record<string, string>>({});
  const [cityErrors, setCityErrors] = useState<Record<string, string>>({});
  const [isSubmittingProvince, setIsSubmittingProvince] = useState(false);
  const [isSubmittingCity, setIsSubmittingCity] = useState(false);

  // Check admin status on component mount
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/locations");
      return;
    }
    
    if (session?.user?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Process cities and provinces into a combined array for the table
  useEffect(() => {
    const locationRows: LocationRow[] = [];
    
    // First add all provinces
    provinces.forEach(province => {
      locationRows.push({
        id: province._id,
        type: 'province',
        name: province.name,
        active: province.active
      });
      
      // Then add cities that belong to this province
      const provinceCities = cities.filter(city => city.provinceId?._id === province._id);
      provinceCities.forEach(city => {
        locationRows.push({
          id: city._id,
          type: 'city',
          name: city.name,
          provinceName: province.name,
          provinceId: province._id,
          active: city.active
        });
      });
    });
    
    setLocations(locationRows);
  }, [provinces, cities]);

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchProvinces(), fetchCities()]);
    setIsLoading(false);
  };

  // Fetch provinces
  const fetchProvinces = async () => {
    try {
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
        description: "An unexpected error occurred while fetching provinces",
        variant: "destructive",
      });
    }
  };

  // Fetch cities
  const fetchCities = async () => {
    try {
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
        description: "An unexpected error occurred while fetching cities",
        variant: "destructive",
      });
    }
  };

  // Handle province form input changes
  const handleProvinceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setProvinceForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Clear error for this field if it exists
    if (provinceErrors[name]) {
      setProvinceErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle city form input changes
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setCityForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Clear error for this field if it exists
    if (cityErrors[name]) {
      setCityErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle city province select
  const handleProvinceSelect = (value: string) => {
    setCityForm((prev) => ({
      ...prev,
      provinceId: value,
    }));
    
    // Clear error for this field if it exists
    if (cityErrors.provinceId) {
      setCityErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.provinceId;
        return newErrors;
      });
    }
  };

  // Submit new province
  const handleSubmitProvince = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      provinceSchema.parse(provinceForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setProvinceErrors(newErrors);
        return;
      }
    }
    
    setIsSubmittingProvince(true);
    
    try {
      const response = await fetch("/api/provinces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(provinceForm),
      });
      
      if (response.ok) {
        toast({ title: "Success", description: "Province added successfully" });
        setProvinceForm({ name: "", active: true });
        setIsAddingProvince(false);
        await fetchProvinces();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to add province",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding province:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingProvince(false);
    }
  };

  // Submit new city
  const handleSubmitCity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      citySchema.parse(cityForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setCityErrors(newErrors);
        return;
      }
    }
    
    setIsSubmittingCity(true);
    
    try {
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cityForm),
      });
      
      if (response.ok) {
        toast({ title: "Success", description: "City added successfully" });
        setCityForm({ name: "", provinceId: "", active: true });
        setIsAddingCity(false);
        await fetchData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to add city",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding city:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingCity(false);
    }
  };

  // Reset form states
  const resetForms = () => {
    setProvinceForm({ name: "", active: true });
    setCityForm({ name: "", provinceId: "", active: true });
    setProvinceErrors({});
    setCityErrors({});
    setSelectedProvince(null);
    setSelectedCity(null);
  };

  // Handle edit province
  const handleEditProvince = (province: Province) => {
    setSelectedProvince(province);
    setProvinceForm({
      name: province.name,
      active: province.active
    });
    setIsEditingProvince(true);
  };

  // Handle edit city
  const handleEditCity = (city: City) => {
    setSelectedCity(city);
    setCityForm({
      name: city.name,
      provinceId: city.provinceId._id,
      active: city.active
    });
    setIsEditingCity(true);
  };

  // Update province
  const handleUpdateProvince = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProvince) return;
    
    // Validate form data
    try {
      provinceSchema.parse(provinceForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setProvinceErrors(newErrors);
        return;
      }
    }
    
    setIsSubmittingProvince(true);
    
    try {
      const response = await fetch(`/api/provinces/${selectedProvince._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(provinceForm),
      });
      
      if (response.ok) {
        toast({ title: "Success", description: "Province updated successfully" });
        setProvinceForm({ name: "", active: true });
        setIsEditingProvince(false);
        await fetchProvinces();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update province",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating province:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingProvince(false);
    }
  };

  // Update city
  const handleUpdateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCity) return;
    
    // Validate form data
    try {
      citySchema.parse(cityForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setCityErrors(newErrors);
        return;
      }
    }
    
    setIsSubmittingCity(true);
    
    try {
      const response = await fetch(`/api/cities/${selectedCity._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cityForm),
      });
      
      if (response.ok) {
        toast({ title: "Success", description: "City updated successfully" });
        setCityForm({ name: "", provinceId: "", active: true });
        setIsEditingCity(false);
        await fetchData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update city",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating city:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingCity(false);
    }
  };

  // Delete province
  const handleDeleteProvince = async (provinceId: string) => {
    if (!confirm("Are you sure you want to delete this province? This will also delete all cities associated with it.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/provinces/${provinceId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast({ title: "Success", description: "Province deleted successfully" });
        await fetchData();
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
    }
  };

  // Delete city
  const handleDeleteCity = async (cityId: string) => {
    if (!confirm("Are you sure you want to delete this city?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/cities/${cityId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast({ title: "Success", description: "City deleted successfully" });
        await fetchData();
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
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated or not admin, don't render anything (router will redirect)
  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav />
      
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Location Management</h1>
          
          <div className="flex gap-2">
            {/* Add Province Dialog */}
            <Dialog open={isAddingProvince} onOpenChange={setIsAddingProvince}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetForms();
                  setIsAddingProvince(true);
                }} className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Province
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Province</DialogTitle>
                  <DialogDescription>
                    Add a new province/state to the system.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmitProvince} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="province-name">
                      Province/State Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="province-name"
                      name="name"
                      value={provinceForm.name}
                      onChange={handleProvinceChange}
                      placeholder="e.g. Zhejiang, Jiangsu, Shanghai"
                      disabled={isSubmittingProvince}
                    />
                    {provinceErrors.name && (
                      <p className="text-red-500 text-sm">{provinceErrors.name}</p>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingProvince(false)}
                      disabled={isSubmittingProvince}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmittingProvince}
                    >
                      {isSubmittingProvince ? (
                        <>
                          <span className="mr-2">Saving...</span>
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        </>
                      ) : (
                        "Save Province"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            {/* Add City Dialog */}
            <Dialog open={isAddingCity} onOpenChange={setIsAddingCity}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    resetForms();
                    setIsAddingCity(true);
                  }} 
                  className="flex items-center gap-2"
                  disabled={provinces.length === 0}
                >
                  <PlusCircle className="h-4 w-4" />
                  Add City
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New City</DialogTitle>
                  <DialogDescription>
                    Add a new city and link it to a province.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmitCity} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="city-name">
                      City Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city-name"
                      name="name"
                      value={cityForm.name}
                      onChange={handleCityChange}
                      placeholder="e.g. Shanghai, New York, London"
                      disabled={isSubmittingCity}
                    />
                    {cityErrors.name && (
                      <p className="text-red-500 text-sm">{cityErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="province-select">
                      Province <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={cityForm.provinceId} 
                      onValueChange={handleProvinceSelect}
                      disabled={isSubmittingCity}
                    >
                      <SelectTrigger id="province-select">
                        <SelectValue placeholder="Select a province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province._id} value={province._id}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {cityErrors.provinceId && (
                      <p className="text-red-500 text-sm">{cityErrors.provinceId}</p>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingCity(false)}
                      disabled={isSubmittingCity}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmittingCity}
                    >
                      {isSubmittingCity ? (
                        <>
                          <span className="mr-2">Saving...</span>
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        </>
                      ) : (
                        "Save City"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            {/* Edit Province Dialog */}
            <Dialog open={isEditingProvince} onOpenChange={setIsEditingProvince}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Province</DialogTitle>
                  <DialogDescription>
                    Update province details.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleUpdateProvince} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-province-name">
                      Province/State Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-province-name"
                      name="name"
                      value={provinceForm.name}
                      onChange={handleProvinceChange}
                      placeholder="e.g. California, Ontario, Shanghai"
                      disabled={isSubmittingProvince}
                    />
                    {provinceErrors.name && (
                      <p className="text-red-500 text-sm">{provinceErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-province-active"
                      name="active"
                      checked={provinceForm.active}
                      onChange={handleProvinceChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="edit-province-active">Active</Label>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingProvince(false)}
                      disabled={isSubmittingProvince}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmittingProvince}
                    >
                      {isSubmittingProvince ? (
                        <>
                          <span className="mr-2">Saving...</span>
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            {/* Edit City Dialog */}
            <Dialog open={isEditingCity} onOpenChange={setIsEditingCity}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit City</DialogTitle>
                  <DialogDescription>
                    Update city details.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleUpdateCity} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-city-name">
                      City Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-city-name"
                      name="name"
                      value={cityForm.name}
                      onChange={handleCityChange}
                      placeholder="e.g. Shanghai, New York, London"
                      disabled={isSubmittingCity}
                    />
                    {cityErrors.name && (
                      <p className="text-red-500 text-sm">{cityErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-province-select">
                      Province <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={cityForm.provinceId} 
                      onValueChange={handleProvinceSelect}
                      disabled={isSubmittingCity}
                    >
                      <SelectTrigger id="edit-province-select">
                        <SelectValue placeholder="Select a province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province._id} value={province._id}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {cityErrors.provinceId && (
                      <p className="text-red-500 text-sm">{cityErrors.provinceId}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-city-active"
                      name="active"
                      checked={cityForm.active}
                      onChange={handleCityChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="edit-city-active">Active</Label>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingCity(false)}
                      disabled={isSubmittingCity}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmittingCity}
                    >
                      {isSubmittingCity ? (
                        <>
                          <span className="mr-2">Saving...</span>
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Locations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
            <CardDescription>
              Manage provinces/states and cities in your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading locations...</p>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">No locations found. Add your first province and city.</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-center font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {locations.map((location) => (
                      <tr 
                        key={location.id} 
                        className={location.type === 'city' ? 'bg-muted/20' : ''}
                      >
                        <td className="px-4 py-3">
                          {location.type === 'city' && (
                            <span className="inline-block w-6 text-center">↳</span>
                          )}
                          <span className={location.type === 'province' ? 'font-medium' : ''}>
                            {location.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            location.type === 'province' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-violet-100 text-violet-700'
                          }`}>
                            {location.type === 'province' ? 'Province' : 'City'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            location.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {location.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                if (location.type === 'province') {
                                  const province = provinces.find(p => p._id === location.id);
                                  if (province) handleEditProvince(province);
                                } else {
                                  const city = cities.find(c => c._id === location.id);
                                  if (city) handleEditCity(city);
                                }
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (location.type === 'province') {
                                  handleDeleteProvince(location.id);
                                } else {
                                  handleDeleteCity(location.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 