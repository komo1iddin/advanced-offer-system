import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { School } from "lucide-react";
import { useState, lazy, Suspense } from "react";

// Dynamically import the dialog component for code splitting
const StudyOfferDialog = lazy(() => import('./study-offer-dialog').then(mod => ({ 
  default: mod.StudyOfferDialog 
})));

interface StudyOffer {
  _id: string;
  title: string;
  universityName: string;
  description: string;
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
  campusFacilities: string[];
  admissionRequirements: string[];
  tags: string[];
  color: string;
  accentColor: string;
  category: string;
  images?: string[];
  featured: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface StudyOfferCardProps {
  offer: StudyOffer;
  viewMode: "grid" | "list";
  onTagClick: (tag: string) => void;
}

// Format currency display
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Safe date formatting to handle string or Date objects
const formatDate = (date: Date | string, formatStr: string) => {
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

// Default fallback image
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop";

// Loading fallback for the dialog
const DialogLoadingFallback = () => (
  <div className="p-12 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export function StudyOfferCard({ offer, viewMode, onTagClick }: StudyOfferCardProps) {
  // State to control dialog loading
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Select an image to display or use default
  const displayImage = offer.images && offer.images.length > 0 
    ? offer.images[0] 
    : DEFAULT_IMAGE;
  
  return (
    <Card 
      className={`overflow-hidden transition-all ${
        viewMode === "grid" ? "flex flex-col" : "flex flex-col md:flex-row"
      } h-full`}
    >
      {viewMode === "list" && (
        <div className={`${offer.color} w-full md:w-1/3 relative overflow-hidden`}>
          {offer.images && offer.images.length > 0 ? (
            <Image
              src={displayImage}
              alt={offer.title}
              width={400}
              height={300}
              className="object-cover w-full h-full"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
              priority={false}
            />
          ) : (
            <School className={`h-16 w-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${offer.accentColor.split(' ').pop()}`} />
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <CardHeader className={`${offer.color} p-4 border-b ${offer.accentColor.split(' ')[0]}`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold line-clamp-2">{offer.title}</h3>
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
          <div className="space-y-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Badge variant="outline">{offer.degreeLevel}</Badge>
              <span className="mx-2">•</span>
              <span>{offer.location}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Tuition</div>
                <div className="font-medium">
                  {formatCurrency(offer.tuitionFees.amount, offer.tuitionFees.currency)}/{offer.tuitionFees.period}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Duration</div>
                <div className="font-medium">{offer.durationInYears} {offer.durationInYears > 1 ? 'years' : 'year'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Application Deadline</div>
                <div className="font-medium">{formatDate(offer.applicationDeadline, 'MMM d, yyyy')}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Programs</div>
                <div className="font-medium">{offer.programs.length}</div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-wrap gap-1">
              {offer.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs cursor-pointer"
                  onClick={() => onTagClick(tag)}
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
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  Details
                </Button>
              </DialogTrigger>
              
              {/* Only load the detail dialog component when it's opened */}
              {dialogOpen && (
                <Suspense fallback={<DialogLoadingFallback />}>
                  <StudyOfferDialog offer={offer} />
                </Suspense>
              )}
            </Dialog>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
} 