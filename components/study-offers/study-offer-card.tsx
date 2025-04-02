import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { School } from "lucide-react";

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

export function StudyOfferCard({ offer, viewMode, onTagClick }: StudyOfferCardProps) {
  return (
    <Card 
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
                      <p>{formatDate(offer.applicationDeadline, 'MMMM d, yyyy')}</p>
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
  );
} 