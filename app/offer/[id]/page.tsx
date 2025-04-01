"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Tag, Calendar, Clock, School, Globe, BookOpen, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format } from "date-fns"
import Link from "next/link"

interface Offer {
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
  applicationDeadline: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

// Format currency display
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function OfferDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [offer, setOffer] = useState<Offer | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [relatedOffers, setRelatedOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch offer from API
  useEffect(() => {
    async function fetchOffer() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/study-offers/${id}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch offer details")
        }
        
        const { data } = await response.json()
        setOffer(data)
        
        // Fetch related offers
        const relatedResponse = await fetch(`/api/study-offers?limit=3`)
        if (!relatedResponse.ok) {
          throw new Error("Failed to fetch related offers")
        }
        
        const { data: relatedData } = await relatedResponse.json()
        // Filter out the current offer and limit to 3
        setRelatedOffers(relatedData.filter((o: Offer) => o._id !== id).slice(0, 3))
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load offer details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchOffer()
  }, [id])

  // Handle delete offer
  const handleDeleteOffer = async () => {
    try {
      const response = await fetch(`/api/study-offers/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete offer")
      }
      
      toast({
        title: "Success",
        description: "Study offer has been deleted",
      })
      
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (error) {
      console.error('Error deleting offer:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete offer",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
      </div>
    )
  }
  
  if (error || !offer) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-destructive">{error || "Offer not found"}</p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Return to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all offers
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <h1 className="text-3xl font-bold text-primary">{offer.title}</h1>

          <div className="flex gap-2">
            <Link href={`/edit-offer/${id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>

            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <Card className={`border-2 shadow-sm mb-8 ${offer.color}`}>
          <CardHeader className={`pb-4 border-b ${offer.accentColor.split(" ")[0]}`}>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{offer.title}</CardTitle>
                <p className="text-sm mt-1 font-medium">{offer.universityName}</p>
              </div>
              {offer.featured && (
                <Badge variant="default" className="bg-amber-500 hover:bg-amber-500">
                  Featured
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Meta information */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <Badge variant="outline" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {offer.degreeLevel}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {offer.location}
              </Badge>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Deadline: {format(new Date(offer.applicationDeadline), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4" />
                <span>Tuition: {formatCurrency(offer.tuitionFees.amount, offer.tuitionFees.currency)}/{offer.tuitionFees.period}</span>
              </div>
            </div>

            <h3 className="font-medium text-lg mb-2">About the Program</h3>
            <p className="mb-6">{offer.description}</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2">Program Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Duration</h4>
                    <p>{offer.durationInYears} {offer.durationInYears > 1 ? 'years' : 'year'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Programs</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {offer.programs.map((program) => (
                        <Badge key={program} variant="outline" className="text-xs">
                          {program}
                        </Badge>
                      ))}
                    </div>
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
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" />
                  <h3 className="font-medium">Tags</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {offer.tags.map((tag) => (
                    <Badge key={tag} className={`text-sm py-1 ${offer.accentColor.split(" ").slice(-1)[0]}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {relatedOffers.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Related Offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedOffers.map((relatedOffer) => (
                <Link href={`/offer/${relatedOffer._id}`} key={relatedOffer._id}>
                  <Card
                    className={`h-full flex flex-col transition-all duration-200 hover:shadow-md border-2 ${relatedOffer.color} hover:scale-[1.02]`}
                  >
                    <CardHeader className={`pb-2 border-b ${relatedOffer.accentColor.split(" ")[0]}`}>
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg">{relatedOffer.title}</CardTitle>
                        {relatedOffer.featured && (
                          <Badge variant="default" className="bg-amber-500 hover:bg-amber-500">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{relatedOffer.universityName}</p>
                    </CardHeader>
                    <CardContent className="flex-grow pt-4">
                      <p className="text-muted-foreground line-clamp-2">{relatedOffer.description}</p>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2 pt-0">
                      {relatedOffer.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={`text-xs ${relatedOffer.accentColor.split(" ").slice(-1)[0]}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this study offer from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOffer} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}

