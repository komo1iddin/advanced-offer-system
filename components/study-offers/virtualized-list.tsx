'use client';

import { useEffect, useRef, useState } from 'react';
import { StudyOfferCard } from './study-offer-card';
import { useInView } from 'react-intersection-observer';

// TypeScript interface for study offer data
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

interface VirtualizedListProps {
  items: StudyOffer[];
  viewMode: 'grid' | 'list';
  onTagClick: (tag: string) => void;
  loadMoreItems?: () => void;
  hasMore?: boolean;
  itemHeight?: number;
  gridColumns?: number;
  className?: string;
}

export function VirtualizedList({
  items,
  viewMode,
  onTagClick,
  loadMoreItems,
  hasMore = false,
  itemHeight = 400, // Default height estimation for list view
  gridColumns = 4, // Default number of columns in grid view
  className = '',
}: VirtualizedListProps) {
  // Detect viewport and component size
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Keep track of rendered items
  const [visibleItemsCount, setVisibleItemsCount] = useState(12);
  const [visibleItems, setVisibleItems] = useState<StudyOffer[]>([]);
  
  // IntersectionObserver for infinite loading
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  // Update component dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      setWindowHeight(window.innerHeight);
      setContainerWidth(containerRef.current?.clientWidth || 0);
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Calculate how many items to display
  useEffect(() => {
    if (windowHeight === 0) return;
    
    let newVisibleItemsCount = 12; // Minimum default
    
    if (viewMode === 'list') {
      // For list view, calculate how many items fit in viewport plus buffer
      newVisibleItemsCount = Math.ceil(windowHeight / (itemHeight / 2)) + 6;
    } else {
      // For grid view, calculate based on viewport and columns
      const itemsPerRow = getGridColumnsCount();
      const rowsVisible = Math.ceil(windowHeight / (itemHeight / 3));
      newVisibleItemsCount = itemsPerRow * (rowsVisible + 2);
    }
    
    // Ensure we don't exceed the number of items
    newVisibleItemsCount = Math.min(newVisibleItemsCount, items.length);
    
    // Only update if the count changed
    if (newVisibleItemsCount !== visibleItemsCount) {
      setVisibleItemsCount(newVisibleItemsCount);
    }
  }, [windowHeight, containerWidth, viewMode, items.length, itemHeight]);
  
  // Update visible items when count changes
  useEffect(() => {
    setVisibleItems(items.slice(0, visibleItemsCount));
  }, [items, visibleItemsCount]);
  
  // Load more items when scroll reaches the bottom
  useEffect(() => {
    if (inView && hasMore && loadMoreItems && visibleItemsCount >= items.length) {
      loadMoreItems();
    }
  }, [inView, hasMore, loadMoreItems, visibleItemsCount, items.length]);
  
  // Helper to calculate grid columns based on container width
  function getGridColumnsCount() {
    if (containerWidth < 640) return 1; // Mobile
    if (containerWidth < 768) return 2; // Small tablets
    if (containerWidth < 1024) return 3; // Tablets & small laptops
    return gridColumns; // Large screens
  }
  
  // Generate grid column CSS
  const gridColumnsCSS = () => {
    const cols = getGridColumnsCount();
    return `grid-cols-1 ${cols >= 2 ? 'md:grid-cols-2' : ''} ${cols >= 3 ? 'lg:grid-cols-3' : ''} ${cols >= 4 ? 'xl:grid-cols-4' : ''}`;
  };
  
  return (
    <div ref={containerRef} className={className}>
      <div 
        className={`grid ${viewMode === 'grid' ? gridColumnsCSS() : 'grid-cols-1'} gap-6`}
      >
        {visibleItems.map((item) => (
          <StudyOfferCard
            key={item._id}
            offer={item}
            viewMode={viewMode}
            onTagClick={onTagClick}
          />
        ))}
      </div>
      
      {/* Loading more indicator at the bottom */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] opacity-60 mt-8" />
        </div>
      )}
    </div>
  );
} 