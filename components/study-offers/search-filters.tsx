import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState } from "react";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  degreeLevel: string | null;
  setDegreeLevel: (value: string | null) => void;
  featured: boolean;
  setFeatured: (value: boolean) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: string[];
  sortOption: string;
  setSortOption: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  handleResetFilters: () => void;
}

// Degree levels
const degreeLevels = ["Bachelor", "Master", "PhD", "Certificate", "Diploma", "Language Course"];

export function SearchFilters({
  searchQuery = '',
  setSearchQuery,
  degreeLevel = null,
  setDegreeLevel,
  featured = false,
  setFeatured,
  selectedTags = [],
  onTagToggle,
  allTags = [],
  sortOption = 'default',
  setSortOption,
  onSearchSubmit,
  handleResetFilters,
}: SearchFiltersProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Safely handle tags display
  const safeAllTags = Array.isArray(allTags) ? allTags : [];
  const safeSelectedTags = Array.isArray(selectedTags) ? selectedTags : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <form onSubmit={onSearchSubmit} className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search universities, programs..."
            className="pl-8 w-full"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category filter for desktop */}
          {!isMobile && (
            <Select 
              value={degreeLevel || "all"} 
              onValueChange={(value) => setDegreeLevel(value === "all" ? null : value)}
            >
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
          <Select value={sortOption || "default"} onValueChange={setSortOption}>
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
                  </div>

                  {/* Tags Filter */}
                  {safeAllTags.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {safeAllTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={safeSelectedTags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => onTagToggle(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

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
                        handleResetFilters();
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
        </div>
      </div>

      {/* Desktop Tag Filters */}
      {!isMobile && safeAllTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground">Tags:</span>
          {safeAllTags.slice(0, 15).map((tag) => (
            <Badge
              key={tag}
              variant={safeSelectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
          {safeAllTags.length > 15 && (
            <Button variant="ghost" size="sm">
              +{safeAllTags.length - 15} more
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 