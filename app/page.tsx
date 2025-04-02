"use client"

import { useState, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, List, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Link from "next/link"
import { useStudyOffers } from "@/hooks/use-study-offers"

// Import our new components
import { SearchFilters } from "@/components/study-offers/search-filters"
import { StudyOfferCard } from "@/components/study-offers/study-offer-card"
import { Pagination } from "@/components/study-offers/pagination"
import { LoadingState } from "@/components/study-offers/loading-state"

// Color options for cards - solid colors instead of gradients
const cardColors = [
  { bg: "bg-rose-50", accent: "border-rose-200 text-rose-600" },
  { bg: "bg-blue-50", accent: "border-blue-200 text-blue-600" },
  { bg: "bg-amber-50", accent: "border-amber-200 text-amber-600" },
  { bg: "bg-emerald-50", accent: "border-emerald-200 text-emerald-600" },
  { bg: "bg-violet-50", accent: "border-violet-200 text-violet-600" },
  { bg: "bg-orange-50", accent: "border-orange-200 text-orange-600" },
]

// Available categories with icons
const categories = [
  { name: "Bachelor", icon: "🎓" },
  { name: "Master", icon: "📚" },
  { name: "PhD", icon: "🔬" },
  { name: "Certificate", icon: "📜" },
  { name: "Diploma", icon: "🎯" },
  { name: "Language Course", icon: "🗣️" },
]

// Degree levels
const degreeLevels = ["Bachelor", "Master", "PhD", "Certificate", "Diploma", "Language Course"]

export default function StudyOffersPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Use our custom hook to fetch and manage study offers
  const {
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
    refetch
  } = useStudyOffers();

  // Selected tags for filtering
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Sort option
  const [sortOption, setSortOption] = useState("default")
  
  // View mode (grid or list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Get all unique tags from offers
  const allTags = Array.from(new Set(offers.flatMap((offer) => offer.tags || [])))

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      startTransition(() => {
        setPage(newPage)
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
  }, [pagination.pages, setPage])

  // Handle tag toggle
  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }, [])
  
  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedTags([])
    setFeatured(false)
    setDegreeLevel(null)
    setPage(1)
  }, [setSearchQuery, setFeatured, setDegreeLevel, setPage])

  // Filter offers by selected tags
  const filteredOffers = offers.filter(
    (offer) => selectedTags.length === 0 || selectedTags.some(tag => (offer.tags || []).includes(tag))
  )

  // Helper function to safely parse dates
  const safeGetTime = (dateStr: string | Date) => {
    try {
      return new Date(dateStr).getTime();
    } catch (error) {
      return 0; // Return a default value for invalid dates
    }
  }

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
        return 0
    }
  })

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Study in China</h1>
          <p className="text-muted-foreground">
            Discover study opportunities at top Chinese universities
          </p>
        </div>

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
            <Button onClick={refetch} className="mt-4">
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

        {/* Study Offers Grid/List */}
        {!loading && !error && sortedOffers.length > 0 && (
          <div className={`grid ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          } gap-6`}>
            {sortedOffers.map((offer) => (
              <StudyOfferCard 
                key={offer._id}
                offer={offer} 
                viewMode={viewMode}
                onTagClick={handleTagToggle}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && sortedOffers.length > 0 && pagination.pages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}

