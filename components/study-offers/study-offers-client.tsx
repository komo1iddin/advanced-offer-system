"use client"

import { useState, useCallback, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, List, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Link from "next/link"

// Import our components
import { SearchFilters } from "@/components/study-offers/search-filters"
import { StudyOfferCard } from "@/components/study-offers/study-offer-card"
import { Pagination } from "@/components/study-offers/pagination"
import { LoadingState } from "@/components/study-offers/loading-state"
import { VirtualizedList } from './virtualized-list'

// Define types for study offers
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

interface ApiResponse {
  success: boolean;
  data: StudyOffer[];
  pagination: PaginationInfo;
  error?: string;
}

interface StudyOffersClientComponentProps {
  initialData: ApiResponse;
  initialSearchParams: Record<string, string>;
}

export function StudyOffersClientComponent({
  initialData,
  initialSearchParams,
}: StudyOffersClientComponentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // State from initial data
  const [offers, setOffers] = useState<StudyOffer[]>(initialData.data || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>(initialData.pagination || {
    total: 0,
    page: 1,
    limit: 8,
    pages: 0
  });
  
  // State for filters
  const [searchParams, setSearchParams] = useState(initialSearchParams);
  const [searchQuery, setSearchQuery] = useState(initialSearchParams.search || "");
  const [degreeLevel, setDegreeLevel] = useState<string | null>(initialSearchParams.degreeLevel || null);
  const [featured, setFeatured] = useState(initialSearchParams.featured === 'true');
  const [page, setPage] = useState(parseInt(initialSearchParams.page || '1'));
  
  // UI state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Get all unique tags from offers
  const allTags = Array.from(new Set(offers.flatMap((offer) => offer.tags || [])));
  
  // Update URL when parameters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (searchQuery) newParams.set('search', searchQuery);
    if (degreeLevel) newParams.set('degreeLevel', degreeLevel);
    if (featured) newParams.set('featured', 'true');
    newParams.set('page', page.toString());
    
    const url = `/?${newParams.toString()}`;
    
    // Debounce URL updates to avoid excessive history entries
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        router.replace(url, { scroll: false });
      });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, degreeLevel, featured, page, router]);
  
  // Fetch data when parameters change
  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (searchQuery) params.set('search', searchQuery);
      if (degreeLevel) params.set('degreeLevel', degreeLevel);
      if (featured) params.set('featured', 'true');
      params.set('page', page.toString());
      params.set('limit', pagination.limit.toString());
      
      const response = await fetch(`/api/study-offers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch study offers: ${response.statusText}`);
      }
      
      const result = await response.json();
      setOffers(result.data || []);
      setPagination(result.pagination || {
        total: 0,
        page: 1,
        limit: 8,
        pages: 0
      });
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, degreeLevel, featured, page, pagination.limit]);
  
  // Initial fetch on mount and when parameters change
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);
  
  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOffers();
  };
  
  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      startTransition(() => {
        setPage(newPage);
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }, [pagination.pages]);
  
  // Handle tag toggle
  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);
  
  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTags([]);
    setFeatured(false);
    setDegreeLevel(null);
    setPage(1);
    setSortOption("default");
  }, []);
  
  // Filter offers by selected tags
  const filteredOffers = offers.filter(
    (offer) => selectedTags.length === 0 || selectedTags.some(tag => (offer.tags || []).includes(tag))
  );
  
  // Helper function to safely parse dates
  const safeGetTime = (dateStr: string | Date) => {
    try {
      return new Date(dateStr).getTime();
    } catch (error) {
      return 0; // Return a default value for invalid dates
    }
  };
  
  // Sort offers based on selected option
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    switch (sortOption) {
      case "deadline-asc":
        return safeGetTime(a.applicationDeadline) - safeGetTime(b.applicationDeadline);
      case "deadline-desc":
        return safeGetTime(b.applicationDeadline) - safeGetTime(a.applicationDeadline);
      case "tuition-asc":
        return (a.tuitionFees?.amount || 0) - (b.tuitionFees?.amount || 0);
      case "tuition-desc":
        return (b.tuitionFees?.amount || 0) - (a.tuitionFees?.amount || 0);
      default:
        return 0;
    }
  });
  
  return (
    <>
      {/* Search and Filter Bar */}
      <SearchFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        degreeLevel={degreeLevel}
        setDegreeLevel={setDegreeLevel}
        featured={featured}
        setFeatured={setFeatured}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        allTags={allTags}
        sortOption={sortOption}
        setSortOption={setSortOption}
        onSearchSubmit={handleSearchSubmit}
        handleResetFilters={handleResetFilters}
      />

      <div className="flex items-center justify-between">
        {/* View mode toggle */}
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Add new offer button */}
        <Button asChild>
          <Link href="/add-offer">
            Add Study Offer
          </Link>
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <LoadingState viewMode={viewMode} count={6} />
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center p-8">
          <h3 className="text-lg font-medium text-destructive">Error loading study offers</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchOffers} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && sortedOffers.length === 0 && (
        <div className="text-center p-8 border rounded-lg">
          <School className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium mt-4">No study offers found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your filters or search query
          </p>
          <Button onClick={handleResetFilters} variant="outline" className="mt-4">
            Reset Filters
          </Button>
        </div>
      )}

      {/* Study Offers Grid/List - Virtualized for performance */}
      {!loading && !error && sortedOffers.length > 0 && (
        <VirtualizedList
          items={sortedOffers}
          viewMode={viewMode}
          onTagClick={handleTagToggle}
          loadMoreItems={pagination.page < pagination.pages ? () => handlePageChange(pagination.page + 1) : undefined}
          hasMore={pagination.page < pagination.pages}
          className="w-full"
        />
      )}

      {/* Hide static pagination when using virtualized list with infinite loading */}
      {!loading && !error && sortedOffers.length > 0 && pagination.pages > 1 && !window.matchMedia('(max-height: 800px)').matches && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
} 