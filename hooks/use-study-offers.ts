import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Define more robust interface with optional fields where needed
interface StudyOffer {
  _id: string;
  title: string;
  universityName: string;
  description?: string;
  location: string;
  degreeLevel: string;
  programs: string[];
  tuitionFees: {
    amount: number;
    currency: string;
    period: string;
  };
  scholarshipAvailable: boolean;
  scholarshipDetails?: string;
  applicationDeadline: Date | string;
  languageRequirements: {
    language: string;
    minimumScore?: string;
    testName?: string;
  }[];
  durationInYears: number;
  campusFacilities?: string[];
  admissionRequirements: string[];
  tags?: string[];
  color: string;
  accentColor: string;
  category: string;
  images?: string[];
  featured: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface UseStudyOffersOptions {
  initialCategory?: string;
  initialDegreeLevel?: string;
  initialSearchQuery?: string;
  initialFeatured?: boolean;
  initialLimit?: number;
  initialPage?: number;
}

// Function to create a debounce handler
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Clean up the timer when the value changes or the component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

export function useStudyOffers(options: UseStudyOffersOptions = {}) {
  // State for the offers and loading/error states
  const [offers, setOffers] = useState<StudyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: options.initialPage || 1,
    limit: options.initialLimit || 8,
    pages: 0
  });
  
  // Reference to store the last fetch AbortController
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Fetch cache to avoid redundant fetches
  const fetchCacheRef = useRef<{
    lastUrl: string;
    lastFetchTime: number;
    result: any;
  } | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Safely get search params
  const getSearchParam = (key: string, defaultValue: string = ''): string => {
    try {
      return searchParams?.get(key) || defaultValue;
    } catch (error) {
      console.error(`Error getting search param ${key}:`, error);
      return defaultValue;
    }
  };
  
  // Filter states
  const [category, setCategory] = useState<string | null>(
    options.initialCategory || getSearchParam('category', null as any)
  );
  const [degreeLevel, setDegreeLevel] = useState<string | null>(
    options.initialDegreeLevel || getSearchParam('degreeLevel', null as any)
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    options.initialSearchQuery || getSearchParam('search', '')
  );
  const [featured, setFeatured] = useState<boolean>(
    options.initialFeatured || getSearchParam('featured') === 'true'
  );
  
  // Pagination
  const [page, setPage] = useState<number>(
    options.initialPage || parseInt(getSearchParam('page', '1'))
  );
  const [limit, setLimit] = useState<number>(
    options.initialLimit || parseInt(getSearchParam('limit', '8'))
  );
  
  // Debounce the search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Create a memoized fetchOffers function to prevent unnecessary re-creations
  const fetchOffers = useCallback(async () => {
    // Skip fetch if no change in filter conditions
    if (loading) {
      setLoading(true);
    }
    setError(null);
    
    // Abort any previous fetch that's still in progress
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {
        console.error("Error aborting previous request:", e);
      }
    }
    
    // Create a new AbortController for this fetch
    try {
      abortControllerRef.current = new AbortController();
    } catch (e) {
      console.error("Error creating AbortController:", e);
      // Continue without abort capability if AbortController fails
    }
    
    try {
      // Construct the query URL
      const params = new URLSearchParams();
      
      if (category) params.append('category', category);
      if (degreeLevel) params.append('degreeLevel', degreeLevel);
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (featured) params.append('featured', 'true');
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const url = `/api/study-offers?${params.toString()}`;
      
      // Check if we've recently fetched this exact URL (simple client-side cache)
      const now = Date.now();
      const cacheTTL = 5000; // 5 seconds cache
      if (
        fetchCacheRef.current && 
        fetchCacheRef.current.lastUrl === url && 
        now - fetchCacheRef.current.lastFetchTime < cacheTTL
      ) {
        // Use cached result
        const { result } = fetchCacheRef.current;
        setOffers(result.data || []);
        setPagination(result.pagination || {
          total: 0,
          page: 1,
          limit: 8,
          pages: 0
        });
        setLoading(false);
        return;
      }
      
      // Fetch options
      const fetchOptions: RequestInit = {
        headers: {
          'Accept': 'application/json',
        }
      };
      
      // Add abort signal if available
      if (abortControllerRef.current) {
        fetchOptions.signal = abortControllerRef.current.signal;
      }
      
      // Fetch the data with the AbortController signal if available
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch study offers: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update state with fetched data, using default values if needed
      setOffers(result.data || []);
      setPagination(result.pagination || {
        total: 0,
        page: 1,
        limit: 8,
        pages: 0
      });
      
      // Store in cache
      fetchCacheRef.current = {
        lastUrl: url,
        lastFetchTime: now,
        result
      };
    } catch (err) {
      // Only set error if it's not an abort error
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || 'An error occurred');
        console.error("Error fetching offers:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [category, degreeLevel, debouncedSearchQuery, featured, page, limit]);
  
  // Update URL with current filters, but debounced to reduce history entries
  const updateUrlParams = useCallback(() => {
    try {
      const params = new URLSearchParams();
      
      if (category) params.append('category', category);
      if (degreeLevel) params.append('degreeLevel', degreeLevel);
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (featured) params.append('featured', 'true');
      params.append('page', page.toString());
      
      // Use replace instead of push to avoid filling browser history
      router.replace(`/?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Error updating URL params:", error);
      // Continue without updating URL if it fails
    }
  }, [category, degreeLevel, debouncedSearchQuery, featured, page, router]);
  
  // Fetch offers when debouncedSearchQuery or other filters change
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);
  
  // Update URL params when filters change (debounced)
  useEffect(() => {
    const urlUpdateTimer = setTimeout(() => {
      updateUrlParams();
    }, 500);
    
    return () => {
      clearTimeout(urlUpdateTimer);
    };
  }, [updateUrlParams]);
  
  // Cleanup function for the abort controller
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (e) {
          console.error("Error cleaning up abort controller:", e);
        }
      }
    };
  }, []);
  
  return {
    offers,
    loading,
    error,
    pagination,
    category,
    setCategory,
    degreeLevel,
    setDegreeLevel,
    searchQuery,
    setSearchQuery,
    featured,
    setFeatured,
    page,
    setPage,
    limit,
    setLimit,
    refetch: fetchOffers
  };
} 