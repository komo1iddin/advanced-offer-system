"use client"

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

interface StudyOfferDialogProps {
  offer: StudyOffer;
}

export function StudyOfferDialog({ offer }: StudyOfferDialogProps) {
  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{offer.title}</DialogTitle>
        <DialogDescription>{offer.universityName} - {offer.location}</DialogDescription>
      </DialogHeader>
      
      {/* Image gallery */}
      {offer.images && offer.images.length > 0 && (
        <div className="relative w-full h-64 my-2 rounded-md overflow-hidden">
          <Image 
            src={offer.images[0]}
            alt={offer.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
          />
        </div>
      )}
      
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
  );
} 