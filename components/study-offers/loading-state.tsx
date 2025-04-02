import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  count?: number;
  viewMode: "grid" | "list";
}

export function LoadingState({ count = 4, viewMode = "grid" }: LoadingStateProps) {
  // Ensure valid count
  const itemCount = Math.max(1, Math.min(12, count || 4));
  
  return (
    <div 
      className={`grid ${
        viewMode === "grid" 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-1"
      } gap-6`}
    >
      {Array(itemCount).fill(0).map((_, i) => (
        <Card key={i} className={`overflow-hidden ${viewMode === "list" ? "flex flex-col md:flex-row" : ""}`}>
          {viewMode === "list" && (
            <div className="w-full md:w-1/3">
              <Skeleton className="h-full min-h-40 rounded-none" />
            </div>
          )}
          <div className="flex-1">
            <CardHeader className="p-0">
              <Skeleton className={`h-40 rounded-none ${viewMode === "list" ? "h-16" : ""}`} />
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
          </div>
        </Card>
      ))}
    </div>
  );
} 