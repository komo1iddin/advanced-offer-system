import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import {
  Province,
  City,
  fetchProvinces,
  fetchCities,
  addProvince,
  updateProvince,
  deleteProvince,
  addCity,
  updateCity,
  deleteCity
} from "../lib/location-service";
import { LocationRow, processLocationsForTable } from "../lib/utils";

export function useLocationManager() {
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
  
  // Submission states
  const [isSubmittingProvince, setIsSubmittingProvince] = useState(false);
  const [isSubmittingCity, setIsSubmittingCity] = useState(false);

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Track if data is being loaded to prevent duplicate requests
  const isLoadingRef = useRef(false);

  const { toast } = useToast();

  // Add effect for cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Add effect to update locations when provinces or cities change
  useEffect(() => {
    setLocations(processLocationsForTable(provinces, cities));
  }, [provinces, cities]);

  // Load all location data with useCallback to maintain reference stability
  const loadData = useCallback(async () => {
    // Prevent duplicate loading
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      const [provincesData, citiesData] = await Promise.all([
        fetchProvinces(),
        fetchCities()
      ]);
      
      if (isMounted.current) {
        setProvinces(provincesData);
        setCities(citiesData);
        // Note: locations will be updated in the useEffect above
      }
    } catch (error) {
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to load location data",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      isLoadingRef.current = false;
    }
  }, [toast]); // Only depend on toast

  // Province operations
  const handleAddProvince = useCallback(async (data: { name: string; active: boolean }) => {
    setIsSubmittingProvince(true);
    
    try {
      await addProvince(data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Province added successfully" });
        setIsAddingProvince(false);
        
        // Reload provinces
        const updatedProvinces = await fetchProvinces();
        setProvinces(updatedProvinces);
        // Note: locations will be updated in the useEffect
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to add province",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingProvince(false);
      }
    }
  }, [toast]);

  const handleUpdateProvince = useCallback(async (data: { name: string; active: boolean }) => {
    if (!selectedProvince) return;
    
    setIsSubmittingProvince(true);
    
    try {
      await updateProvince(selectedProvince._id, data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Province updated successfully" });
        setIsEditingProvince(false);
        setSelectedProvince(null);
        
        // Reload data as both provinces and cities could be affected
        await loadData();
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update province",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingProvince(false);
      }
    }
  }, [selectedProvince, toast, loadData]);

  const handleDeleteProvince = useCallback(async (provinceId: string) => {
    if (!confirm("Are you sure you want to delete this province? This will also delete all cities associated with it.")) {
      return;
    }
    
    try {
      await deleteProvince(provinceId);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "Province deleted successfully" });
        
        // Reload data as both provinces and cities could be affected
        await loadData();
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete province",
          variant: "destructive",
        });
      }
    }
  }, [toast, loadData]);

  const handleEditProvince = useCallback((province: Province) => {
    setSelectedProvince(province);
    setIsEditingProvince(true);
  }, []);

  // City operations
  const handleAddCity = useCallback(async (data: { name: string; provinceId: string; active: boolean }) => {
    setIsSubmittingCity(true);
    
    try {
      await addCity(data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "City added successfully" });
        setIsAddingCity(false);
        
        // Reload cities
        const updatedCities = await fetchCities();
        setCities(updatedCities);
        // Note: locations will be updated in the useEffect
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to add city",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingCity(false);
      }
    }
  }, [toast]);

  const handleUpdateCity = useCallback(async (data: { name: string; provinceId: string; active: boolean }) => {
    if (!selectedCity) return;
    
    setIsSubmittingCity(true);
    
    try {
      await updateCity(selectedCity._id, data);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "City updated successfully" });
        setIsEditingCity(false);
        setSelectedCity(null);
        
        // Reload cities
        const updatedCities = await fetchCities();
        setCities(updatedCities);
        // Note: locations will be updated in the useEffect
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update city",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmittingCity(false);
      }
    }
  }, [selectedCity, toast]);

  const handleDeleteCity = useCallback(async (cityId: string) => {
    if (!confirm("Are you sure you want to delete this city?")) {
      return;
    }
    
    try {
      await deleteCity(cityId);
      
      if (isMounted.current) {
        toast({ title: "Success", description: "City deleted successfully" });
        
        // Reload cities
        const updatedCities = await fetchCities();
        setCities(updatedCities);
        // Note: locations will be updated in the useEffect
      }
    } catch (error) {
      if (isMounted.current && error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete city",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleEditCity = useCallback((city: City) => {
    setSelectedCity(city);
    setIsEditingCity(true);
  }, []);

  // Dialog management - memoized to prevent recreating on every render
  const dialogControls = {
    provinces: {
      add: {
        isOpen: isAddingProvince,
        setOpen: setIsAddingProvince,
        isSubmitting: isSubmittingProvince
      },
      edit: {
        isOpen: isEditingProvince,
        setOpen: setIsEditingProvince,
        isSubmitting: isSubmittingProvince,
        selected: selectedProvince
      }
    },
    cities: {
      add: {
        isOpen: isAddingCity,
        setOpen: setIsAddingCity,
        isSubmitting: isSubmittingCity
      },
      edit: {
        isOpen: isEditingCity,
        setOpen: setIsEditingCity,
        isSubmitting: isSubmittingCity,
        selected: selectedCity
      }
    }
  };

  return {
    // Data
    provinces,
    cities,
    locations,
    isLoading,
    
    // Operations
    loadData,
    handleAddProvince,
    handleUpdateProvince,
    handleDeleteProvince,
    handleEditProvince,
    handleAddCity,
    handleUpdateCity,
    handleDeleteCity,
    handleEditCity,
    
    // Dialog controls
    dialogControls
  };
} 