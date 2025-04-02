import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
}: PaginationProps) {
  // Ensure valid values with defaults to prevent rendering errors
  const validCurrentPage = Math.max(1, currentPage || 1);
  const validTotalPages = Math.max(1, totalPages || 1);
  const validTotalItems = Math.max(0, totalItems || 0);
  const validItemsPerPage = Math.max(1, itemsPerPage || 10);

  // Calculate the range of displayed items
  const startItem = (validCurrentPage - 1) * validItemsPerPage + 1;
  const endItem = Math.min(validCurrentPage * validItemsPerPage, validTotalItems);

  // Function to render page buttons with proper display logic
  const renderPaginationButtons = () => {
    // For small number of pages, show all
    if (validTotalPages <= 5) {
      return Array.from({ length: validTotalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={validCurrentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className="w-8 h-8 p-0"
        >
          {page}
        </Button>
      ));
    }

    // For more pages, show a window around the current page
    const buttons = [];
    
    // Always include first page
    buttons.push(
      <Button
        key={1}
        variant={validCurrentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(1)}
        className="w-8 h-8 p-0"
      >
        1
      </Button>
    );
    
    // Add ellipsis if needed
    if (validCurrentPage > 3) {
      buttons.push(
        <span key="ellipsis-1" className="px-2">
          ...
        </span>
      );
    }
    
    // Add pages around current page
    const startPage = Math.max(2, validCurrentPage - 1);
    const endPage = Math.min(validTotalPages - 1, validCurrentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={validCurrentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>
      );
    }
    
    // Add ellipsis if needed
    if (validCurrentPage < validTotalPages - 2) {
      buttons.push(
        <span key="ellipsis-2" className="px-2">
          ...
        </span>
      );
    }
    
    // Always include last page
    if (validTotalPages > 1) {
      buttons.push(
        <Button
          key={validTotalPages}
          variant={validCurrentPage === validTotalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(validTotalPages)}
          className="w-8 h-8 p-0"
        >
          {validTotalPages}
        </Button>
      );
    }
    
    return buttons;
  };

  // Only render pagination if there's more than one page
  if (validTotalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {validTotalItems} results
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(validCurrentPage - 1)}
          disabled={validCurrentPage === 1}
          className="w-8 h-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {renderPaginationButtons()}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(validCurrentPage + 1)}
          disabled={validCurrentPage === validTotalPages}
          className="w-8 h-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 