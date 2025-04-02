// Interfaces
export interface Province {
  _id: string;
  name: string;
  active: boolean;
}

export interface City {
  _id: string;
  name: string;
  provinceId: {
    _id: string;
    name: string;
  };
  active: boolean;
}

// Cache management
interface Cache<T> {
  data: T[] | null;
  timestamp: number;
  promise: Promise<T[]> | null;
}

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Cache objects
const provincesCache: Cache<Province> = {
  data: null,
  timestamp: 0,
  promise: null
};

const citiesCache: Cache<City> = {
  data: null,
  timestamp: 0,
  promise: null
};

// Helper to check if cache is valid
function isCacheValid<T>(cache: Cache<T>): boolean {
  return (
    cache.data !== null &&
    Date.now() - cache.timestamp < CACHE_EXPIRATION
  );
}

// Clear cache when mutations occur
function invalidateCache(): void {
  provincesCache.data = null;
  provincesCache.timestamp = 0;
  provincesCache.promise = null;
  
  citiesCache.data = null;
  citiesCache.timestamp = 0;
  citiesCache.promise = null;
}

// Fetch all provinces with caching
export async function fetchProvinces(): Promise<Province[]> {
  // Return cached data if it's still valid
  if (isCacheValid(provincesCache)) {
    return provincesCache.data!;
  }
  
  // If there's already a pending request, return its promise
  if (provincesCache.promise) {
    return provincesCache.promise;
  }
  
  try {
    // Create a promise for the request
    const fetchPromise = fetch("/api/provinces")
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch provinces");
        }
        return response.json();
      })
      .then(data => {
        // Update cache
        provincesCache.data = data.data;
        provincesCache.timestamp = Date.now();
        provincesCache.promise = null;
        return data.data;
      })
      .catch(error => {
        // Clear promise on error
        provincesCache.promise = null;
        console.error("Error fetching provinces:", error);
        throw error;
      });
    
    // Store the promise in cache
    provincesCache.promise = fetchPromise;
    return fetchPromise;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw error;
  }
}

// Fetch all cities with province information, with caching
export async function fetchCities(): Promise<City[]> {
  // Return cached data if it's still valid
  if (isCacheValid(citiesCache)) {
    return citiesCache.data!;
  }
  
  // If there's already a pending request, return its promise
  if (citiesCache.promise) {
    return citiesCache.promise;
  }
  
  try {
    // Create a promise for the request
    const fetchPromise = fetch("/api/cities?includeProvince=true")
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch cities");
        }
        return response.json();
      })
      .then(data => {
        // Update cache
        citiesCache.data = data.data;
        citiesCache.timestamp = Date.now();
        citiesCache.promise = null;
        return data.data;
      })
      .catch(error => {
        // Clear promise on error
        citiesCache.promise = null;
        console.error("Error fetching cities:", error);
        throw error;
      });
    
    // Store the promise in cache
    citiesCache.promise = fetchPromise;
    return fetchPromise;
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw error;
  }
}

// Add a new province
export async function addProvince(provinceData: { name: string; active: boolean }): Promise<Province> {
  try {
    const response = await fetch("/api/provinces", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(provinceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add province");
    }
    
    // Invalidate cache after mutation
    invalidateCache();
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error adding province:", error);
    throw error;
  }
}

// Update an existing province
export async function updateProvince(
  provinceId: string, 
  provinceData: { name: string; active: boolean }
): Promise<Province> {
  try {
    // Optimistic update for provinces cache
    if (provincesCache.data) {
      const updatedProvinces = provincesCache.data.map(province => 
        province._id === provinceId 
          ? { ...province, ...provinceData }
          : province
      );
      provincesCache.data = updatedProvinces;
    }
    
    const response = await fetch(`/api/provinces/${provinceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(provinceData),
    });
    
    if (!response.ok) {
      // Revert optimistic update if request fails
      invalidateCache();
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update province");
    }
    
    // Invalidate cities cache as they might reference this province
    citiesCache.data = null;
    citiesCache.timestamp = 0;
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error updating province:", error);
    throw error;
  }
}

// Delete a province
export async function deleteProvince(provinceId: string): Promise<void> {
  try {
    // Optimistic update for provinces cache
    if (provincesCache.data) {
      provincesCache.data = provincesCache.data.filter(
        province => province._id !== provinceId
      );
    }
    
    const response = await fetch(`/api/provinces/${provinceId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      // Revert optimistic update if request fails
      invalidateCache();
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete province");
    }
    
    // Invalidate cities cache as they might reference this province
    citiesCache.data = null;
    citiesCache.timestamp = 0;
  } catch (error) {
    console.error("Error deleting province:", error);
    throw error;
  }
}

// Add a new city
export async function addCity(
  cityData: { name: string; provinceId: string; active: boolean }
): Promise<City> {
  try {
    const response = await fetch("/api/cities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cityData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add city");
    }
    
    // Invalidate cities cache after mutation
    citiesCache.data = null;
    citiesCache.timestamp = 0;
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error adding city:", error);
    throw error;
  }
}

// Update an existing city
export async function updateCity(
  cityId: string, 
  cityData: { name: string; provinceId: string; active: boolean }
): Promise<City> {
  try {
    // Optimistic update for cities cache
    if (citiesCache.data) {
      const updatedCities = citiesCache.data.map(city => 
        city._id === cityId 
          ? { 
              ...city, 
              name: cityData.name, 
              active: cityData.active,
              // Handle province change if needed
              provinceId: cityData.provinceId !== city.provinceId._id 
                ? { 
                    _id: cityData.provinceId,
                    name: (provincesCache.data?.find(p => p._id === cityData.provinceId)?.name || city.provinceId.name)
                  }
                : city.provinceId
            }
          : city
      );
      citiesCache.data = updatedCities;
    }
    
    const response = await fetch(`/api/cities/${cityId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cityData),
    });
    
    if (!response.ok) {
      // Revert optimistic update if request fails
      citiesCache.data = null;
      citiesCache.timestamp = 0;
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update city");
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error updating city:", error);
    throw error;
  }
}

// Delete a city
export async function deleteCity(cityId: string): Promise<void> {
  try {
    // Optimistic update for cities cache
    if (citiesCache.data) {
      citiesCache.data = citiesCache.data.filter(
        city => city._id !== cityId
      );
    }
    
    const response = await fetch(`/api/cities/${cityId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      // Revert optimistic update if request fails
      citiesCache.data = null;
      citiesCache.timestamp = 0;
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete city");
    }
  } catch (error) {
    console.error("Error deleting city:", error);
    throw error;
  }
} 