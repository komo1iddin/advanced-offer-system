"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Info, LayoutGrid, List, ChevronLeft, ChevronRight, Filter, Layers, School, BookOpen, Globe, Calendar, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useStudyOffers } from "@/hooks/use-study-offers"
import { format } from "date-fns"

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
  const isMobile = useMediaQuery("(max-width: 768px)")
  
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
    setLimit,
    refetch
  } = useStudyOffers();

  // Selected tags for filtering
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Sort option
  const [sortOption, setSortOption] = useState("default")
  
  // Filter sheet state (mobile)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // View mode (grid or list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Get all unique tags from offers
  const allTags = Array.from(new Set(offers.flatMap((offer) => offer.tags)))

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPage(newPage)
    }
  }

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // Format currency display
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

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
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search universities, programs..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category filter for desktop */}
            {!isMobile && (
              <Select value={degreeLevel || "all"} onValueChange={(value) => setDegreeLevel(value === "all" ? null : value)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Degree Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Degree Levels</SelectItem>
                  {degreeLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort options */}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="deadline-asc">Deadline (Earliest)</SelectItem>
                <SelectItem value="deadline-desc">Deadline (Latest)</SelectItem>
                <SelectItem value="tuition-asc">Tuition (Low to High)</SelectItem>
                <SelectItem value="tuition-desc">Tuition (High to Low)</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile filter button */}
            {isMobile && (
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="overflow-y-auto">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Filter Study Offers</SheetTitle>
                    <SheetDescription>
                      Filter offers by category, degree level, and more
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6">
                    {/* Mobile Degree Level Filter */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Degree Level</h3>
                      <div className="space-y-1">
                        <Checkbox 
                          id="all-degrees" 
                          checked={!degreeLevel}
                          onCheckedChange={() => setDegreeLevel(null)}
                        />
                        <label htmlFor="all-degrees" className="ml-2 text-sm">
                          All Degree Levels
                        </label>
                      </div>
                      {degreeLevels.map((level) => (
                        <div key={level} className="space-y-1">
                          <Checkbox 
                            id={`degree-${level}`} 
                            checked={degreeLevel === level}
                            onCheckedChange={() => setDegreeLevel(level)}
                          />
                          <label htmlFor={`degree-${level}`} className="ml-2 text-sm">
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Tags Filter */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleTagToggle(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Featured Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="featured" 
                          checked={featured}
                          onCheckedChange={(checked) => setFeatured(!!checked)}
                        />
                        <label htmlFor="featured" className="text-sm font-medium">
                          Featured offers only
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedTags([]);
                          setFeatured(false);
                          setDegreeLevel(null);
                          setIsFilterOpen(false);
                        }}
                      >
                        Reset Filters
                      </Button>
                      <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

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
            <Button asChild className="ml-auto">
              <Link href="/add-offer">
                Add Study Offer
              </Link>
            </Button>
          </div>
        </div>

        {/* Desktop Tag Filters */}
        {!isMobile && allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground">Tags:</span>
            {allTags.slice(0, 15).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
            {allTags.length > 15 && (
              <Button variant="ghost" size="sm">
                +{allTags.length - 15} more
              </Button>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className={`grid ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          } gap-6`}>
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-0">
                  <Skeleton className="h-40 rounded-none" />
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
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
        {!loading && !error && offers.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <School className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium mt-4">No study offers found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or search query
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedTags([]);
              setFeatured(false);
              setDegreeLevel(null);
              setPage(1);
            }} variant="outline" className="mt-4">
              Reset Filters
            </Button>
          </div>
        )}

        {/* Study Offers Grid/List */}
        {!loading && !error && offers.length > 0 && (
          <div className={`grid ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          } gap-6`}>
            {offers.map((offer) => (
              <Card 
                key={offer._id} 
                className={`overflow-hidden transition-all ${
                  viewMode === "grid" ? "flex flex-col" : "flex flex-col md:flex-row"
                } h-full`}
              >
                {viewMode === "list" && (
                  <div className={`${offer.color} w-full md:w-1/3 p-4 flex items-center justify-center`}>
                    <School className={`h-16 w-16 ${offer.accentColor.split(' ').pop()}`} />
                  </div>
                )}
                <div className="flex-1 flex flex-col">
                  <CardHeader className={`${offer.color} p-4 border-b ${offer.accentColor.split(' ')[0]}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-2">{offer.title}</CardTitle>
                        <div className="text-sm mt-1 font-medium">{offer.universityName}</div>
                      </div>
                      {offer.featured && (
                        <Badge variant="default" className="bg-amber-500 hover:bg-amber-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 flex-1">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {offer.degreeLevel}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {offer.location}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {offer.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Deadline: {format(new Date(offer.applicationDeadline), 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Tuition: {formatCurrency(offer.tuitionFees.amount, offer.tuitionFees.currency)}/{offer.tuitionFees.period}
                          </span>
                        </div>
                        
                        {offer.scholarshipAvailable && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Scholarship Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 mt-auto">
                    <div className="flex flex-wrap gap-2 w-full justify-between items-center">
                      <div className="flex flex-wrap gap-1.5">
                        {offer.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs cursor-pointer"
                            onClick={() => handleTagToggle(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {offer.tags.length > 3 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs cursor-pointer"
                          >
                            +{offer.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="secondary">
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{offer.title}</DialogTitle>
                            <DialogDescription>{offer.universityName} - {offer.location}</DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <h3 className="font-medium">Program Details</h3>
                              <p>{offer.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge>
                                  {offer.degreeLevel}
                                </Badge>
                                {offer.scholarshipAvailable && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    Scholarship Available
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-medium">Program Duration</h3>
                                <p>{offer.durationInYears} {offer.durationInYears > 1 ? 'years' : 'year'}</p>
                              </div>
                              <div>
                                <h3 className="font-medium">Tuition Fees</h3>
                                <p>
                                  {formatCurrency(offer.tuitionFees.amount, offer.tuitionFees.currency)}/{offer.tuitionFees.period}
                                </p>
                              </div>
                              <div>
                                <h3 className="font-medium">Application Deadline</h3>
                                <p>{format(new Date(offer.applicationDeadline), 'MMMM d, yyyy')}</p>
                              </div>
                              <div>
                                <h3 className="font-medium">Available Programs</h3>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {offer.programs.map((program) => (
                                    <Badge key={program} variant="outline" className="text-xs">
                                      {program}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <Accordion type="single" collapsible className="w-full">
                              {offer.scholarshipAvailable && offer.scholarshipDetails && (
                                <AccordionItem value="scholarship">
                                  <AccordionTrigger>Scholarship Details</AccordionTrigger>
                                  <AccordionContent>
                                    {offer.scholarshipDetails}
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                              
                              <AccordionItem value="language">
                                <AccordionTrigger>Language Requirements</AccordionTrigger>
                                <AccordionContent>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {offer.languageRequirements.map((req, i) => (
                                      <li key={i}>
                                        {req.language}
                                        {req.testName && req.minimumScore && `: ${req.testName} (${req.minimumScore})`}
                                        {req.testName && !req.minimumScore && `: ${req.testName}`}
                                        {!req.testName && req.minimumScore && `: ${req.minimumScore}`}
                                      </li>
                                    ))}
                                  </ul>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="admission">
                                <AccordionTrigger>Admission Requirements</AccordionTrigger>
                                <AccordionContent>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {offer.admissionRequirements.map((req, i) => (
                                      <li key={i}>{req}</li>
                                    ))}
                                  </ul>
                                </AccordionContent>
                              </AccordionItem>
                              
                              {offer.campusFacilities && offer.campusFacilities.length > 0 && (
                                <AccordionItem value="facilities">
                                  <AccordionTrigger>Campus Facilities</AccordionTrigger>
                                  <AccordionContent>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {offer.campusFacilities.map((facility, i) => (
                                        <li key={i}>{facility}</li>
                                      ))}
                                    </ul>
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                            </Accordion>
                          </div>
                          
                          <DialogFooter>
                            <Button asChild>
                              <Link href={`/offer/${offer._id}`}>View Full Details</Link>
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && offers.length > 0 && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                // Show first page, last page, current page, and pages around current
                let pageToShow: number;
                if (pagination.pages <= 5) {
                  pageToShow = i + 1;
                } else if (pagination.page <= 3) {
                  pageToShow = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageToShow = pagination.pages - 4 + i;
                } else {
                  pageToShow = pagination.page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageToShow}
                    variant={pagination.page === pageToShow ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageToShow)}
                  >
                    {pageToShow}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

