"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { z } from "zod";

// Common country options for dropdown
const commonCountries = [
  "China", 
  "Russia", 
  "United States", 
  "United Kingdom", 
  "Germany", 
  "France", 
  "Japan", 
  "South Korea", 
  "India", 
  "Brazil", 
  "Canada", 
  "Australia"
];

// Validation schema
const provinceSchema = z.object({
  name: z.string().min(1, "Province name is required"),
  country: z.string().min(1, "Country is required"),
});

interface AddProvinceFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AddProvinceForm({ onCancel, onSuccess }: AddProvinceFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      provinceSchema.parse(formData);
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
      const response = await fetch("/api/provinces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Province created successfully",
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create province",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating province:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suggestions for countries (combines common countries with any user input)
  const countryOptions = [
    ...commonCountries,
    ...(formData.country && !commonCountries.includes(formData.country) ? [formData.country] : []),
  ].sort();

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Province/State Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. California, Ontario, Shanghai"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. United States, Canada, China"
                list="country-options"
                disabled={isSubmitting}
              />
              <datalist id="country-options">
                {countryOptions.map((country) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
            </div>
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                </>
              ) : (
                "Save Province"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 