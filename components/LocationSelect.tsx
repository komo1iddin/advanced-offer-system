"use client";

import { useState, useEffect, useRef } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface City {
  _id: string;
  name: string;
  provinceId: {
    _id: string;
    name: string;
    country: string;
  };
}

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (cityId: string, provinceId: string, locationString: string) => void;
  onProvinceSelect?: (provinceName: string, country: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function LocationSelect({
  value,
  onChange,
  onLocationSelect,
  onProvinceSelect,
  placeholder = "E.g., Shanghai, China",
  disabled = false,
}: LocationSelectProps) {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch cities when popover opens or search term changes
  useEffect(() => {
    if (open) {
      fetchCities();
    }
  }, [open, debouncedSearchTerm]);

  // Fetch cities from API
  const fetchCities = async () => {
    try {
      setLoading(true);
      
      // Build query URL with search term if it exists
      let url = "/api/cities?includeProvince=true&activeOnly=true";
      if (debouncedSearchTerm) {
        // In a real implementation, you should add server-side search support
        // For now, we'll just fetch all cities and filter on the client
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }
      
      const data = await response.json();
      setCities(data.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find city object by ID
  const selectedCity = cities.find(city => 
    `${city.name}, ${city.provinceId.name}, ${city.provinceId.country}` === value
  );

  // Format display text for location
  const formatLocationText = (city: City): string => {
    return `${city.name}, ${city.provinceId.name}, ${city.provinceId.country}`;
  };

  // Handle city selection
  const handleSelect = (city: City) => {
    const locationText = formatLocationText(city);
    onChange(locationText);
    
    // Notify parent component about city and province IDs if callback provided
    if (onLocationSelect) {
      onLocationSelect(
        city._id,
        city.provinceId._id,
        locationText
      );
    }
    
    // Notify parent component about province if callback provided
    if (onProvinceSelect) {
      onProvinceSelect(city.provinceId.name, city.provinceId.country);
    }
    
    setOpen(false);
  };

  // Filter cities based on search term
  const filteredCities = searchTerm
    ? cities.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.provinceId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.provinceId.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cities;

  // Group cities by country and province for better organization
  const groupedCities = filteredCities.reduce((acc, city) => {
    const country = city.provinceId.country;
    const province = city.provinceId.name;
    
    if (!acc[country]) {
      acc[country] = {};
    }
    
    if (!acc[country][province]) {
      acc[country][province] = [];
    }
    
    acc[country][province].push(city);
    return acc;
  }, {} as Record<string, Record<string, City[]>>);

  // Get sorted countries
  const countries = Object.keys(groupedCities).sort();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal h-10",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <CommandInput 
            placeholder="E.g., Shanghai, Beijing, China..." 
            onValueChange={setSearchTerm}
            ref={inputRef}
          />
          <CommandList>
            {loading && <CommandEmpty>Loading locations...</CommandEmpty>}
            {!loading && filteredCities.length === 0 && (
              <CommandEmpty>
                {searchTerm
                  ? "No locations found."
                  : "No locations available. Please add locations in the admin panel first."}
              </CommandEmpty>
            )}
            {countries.map(country => (
              <div key={country}>
                <CommandGroup heading={country}>
                  {Object.entries(groupedCities[country]).map(([province, provinceCities]) => (
                    <div key={province}>
                      <p className="px-2 py-1 text-xs text-muted-foreground">{province}</p>
                      {provinceCities.map(city => (
                        <CommandItem
                          key={city._id}
                          value={formatLocationText(city)}
                          onSelect={() => handleSelect(city)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === formatLocationText(city) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {city.name}
                        </CommandItem>
                      ))}
                    </div>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 