"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

// Validation schema
const citySchema = z.object({
  name: z.string().min(1, "City name is required"),
  provinceId: z.string().min(1, "Province is required"),
});

interface Province {
  _id: string;
  name: string;
  country: string;
  active: boolean;
}

interface AddCityFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  onRefreshProvinces: () => void;
}

export default function AddCityForm({ onCancel, onSuccess, onRefreshProvinces }: AddCityFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    provinceId: "",
    active: true,
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch active provinces
  const fetchProvinces = async () => {
    try {
      setIsLoadingProvinces(true);
      const response = await fetch("/api/provinces?activeOnly=true");
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
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle adding a new province and refreshing the list
  const handleAddProvince = () => {
    onCancel();
    onRefreshProvinces();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      citySchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "City created successfully",
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create city",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating city:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group provinces by country for better organization
  const provincesByCountry = provinces.reduce<Record<string, Province[]>>((acc, province) => {
    if (!acc[province.country]) {
      acc[province.country] = [];
    }
    acc[province.country].push(province);
    return acc;
  }, {});

  // Sort countries alphabetically
  const countries = Object.keys(provincesByCountry).sort();

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              City Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Shanghai, New York, London"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="provinceId">
                Province <span className="text-red-500">*</span>
              </Label>
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                className="h-auto p-0" 
                onClick={handleAddProvince}
              >
                + Add New Province
              </Button>
            </div>
            <Select
              value={formData.provinceId}
              onValueChange={(value) => handleSelectChange("provinceId", value)}
              disabled={isSubmitting || isLoadingProvinces}
            >
              <SelectTrigger id="provinceId" className="w-full">
                <SelectValue placeholder={isLoadingProvinces ? "Loading provinces..." : "Select a province"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingProvinces ? (
                  <SelectItem value="loading" disabled>
                    Loading provinces...
                  </SelectItem>
                ) : provinces.length === 0 ? (
                  <SelectItem value="no-provinces" disabled>
                    No provinces available. Please add a province first.
                  </SelectItem>
                ) : (
                  countries.map((country) => (
                    <div key={country}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {country}
                      </div>
                      {provincesByCountry[country].map((province) => (
                        <SelectItem key={province._id} value={province._id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.provinceId && <p className="text-red-500 text-sm mt-1">{errors.provinceId}</p>}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || provinces.length === 0}>
              {isSubmitting ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                </>
              ) : (
                "Save City"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 