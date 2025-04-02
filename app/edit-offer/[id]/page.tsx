"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Edit, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { format } from "date-fns"
import Link from "next/link"

// Color options for cards - solid colors instead of gradients
const cardColors = [
  { bg: "bg-rose-50", accent: "border-rose-200 text-rose-600" },
  { bg: "bg-blue-50", accent: "border-blue-200 text-blue-600" },
  { bg: "bg-amber-50", accent: "border-amber-200 text-amber-600" },
  { bg: "bg-emerald-50", accent: "border-emerald-200 text-emerald-600" },
  { bg: "bg-violet-50", accent: "border-violet-200 text-violet-600" },
  { bg: "bg-orange-50", accent: "border-orange-200 text-orange-600" },
]

// Available categories
const categories = [
  "University",
  "College"
]

// Source options
const sourceOptions = [
  "agent",
  "university direct",
  "public university offer"
]

// Degree levels
const degreeLevels = ["Bachelor", "Master", "PhD", "Certificate", "Diploma", "Language Course"]

// Currency options
const currencies = ["USD", "EUR", "CNY", "RUB", "UZS"]

// Period options
const periods = ["semester", "year", "month", "course"]

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
  source: string;
  featured: boolean;
}

export default function EditOfferPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // Form state
  const [title, setTitle] = useState("")
  const [universityName, setUniversityName] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [degreeLevel, setDegreeLevel] = useState("Language Course")
  const [currentProgram, setCurrentProgram] = useState("")
  const [programs, setPrograms] = useState<string[]>([])
  const [tuitionAmount, setTuitionAmount] = useState("")
  const [tuitionCurrency, setTuitionCurrency] = useState("USD")
  const [tuitionPeriod, setTuitionPeriod] = useState("semester")
  const [scholarshipAvailable, setScholarshipAvailable] = useState(false)
  const [scholarshipDetails, setScholarshipDetails] = useState("")
  const [applicationDeadline, setApplicationDeadline] = useState<Date | undefined>(new Date())
  const [durationInYears, setDurationInYears] = useState("")
  const [currentFacility, setCurrentFacility] = useState("")
  const [campusFacilities, setCampusFacilities] = useState<string[]>([])
  const [currentRequirement, setCurrentRequirement] = useState("")
  const [admissionRequirements, setAdmissionRequirements] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [category, setCategory] = useState("University")
  const [source, setSource] = useState("university direct")
  const [featured, setFeatured] = useState(false)
  
  // Language requirements
  const [languageRequirements, setLanguageRequirements] = useState<Array<{
    language: string;
    minimumScore?: string;
    testName?: string;
  }>>([])
  const [currentLanguage, setCurrentLanguage] = useState("")
  const [currentMinimumScore, setCurrentMinimumScore] = useState("")
  const [currentTestName, setCurrentTestName] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load offer from API
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
        
        // Set form state
        setTitle(data.title || '')
        setUniversityName(data.universityName || '')
        setDescription(data.description || '')
        setLocation(data.location || '')
        setDegreeLevel(data.degreeLevel || 'Bachelor')
        setPrograms(data.programs || [])
        setTuitionAmount(data.tuitionFees?.amount?.toString() || '')
        setTuitionCurrency(data.tuitionFees?.currency || 'USD')
        setTuitionPeriod(data.tuitionFees?.period || 'Year')
        setScholarshipAvailable(data.scholarshipAvailable || false)
        setScholarshipDetails(data.scholarshipDetails || '')
        setApplicationDeadline(data.applicationDeadline ? new Date(data.applicationDeadline) : new Date())
        setDurationInYears(data.durationInYears?.toString() || '')
        setCampusFacilities(data.campusFacilities || [])
        setAdmissionRequirements(data.admissionRequirements || [])
        setTags(data.tags || [])
        setCategory(data.category || 'University')
        setSource(data.source || 'university direct')
        setFeatured(data.featured || false)
        
        // Set language requirements
        setLanguageRequirements(data.languageRequirements || [])
        
        // Find color index
        const colorIndex = cardColors.findIndex(
          (c) => c.bg === data.color && c.accent === data.accentColor
        )
        setSelectedColorIndex(colorIndex !== -1 ? colorIndex : 0)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load offer details",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }
    
    fetchOffer()
  }, [id, router])

  // Add program to the list
  const addProgram = () => {
    if (currentProgram.trim() && !programs.includes(currentProgram.trim())) {
      setPrograms([...programs, currentProgram.trim()])
      setCurrentProgram("")
    }
  }

  // Remove program from the list
  const removeProgram = (programToRemove: string) => {
    setPrograms(programs.filter((program) => program !== programToRemove))
  }

  // Add campus facility to the list
  const addFacility = () => {
    if (currentFacility.trim() && !campusFacilities.includes(currentFacility.trim())) {
      setCampusFacilities([...campusFacilities, currentFacility.trim()])
      setCurrentFacility("")
    }
  }

  // Remove facility from the list
  const removeFacility = (facilityToRemove: string) => {
    setCampusFacilities(campusFacilities.filter((facility) => facility !== facilityToRemove))
  }

  // Add requirement to the list
  const addRequirement = () => {
    if (currentRequirement.trim() && !admissionRequirements.includes(currentRequirement.trim())) {
      setAdmissionRequirements([...admissionRequirements, currentRequirement.trim()])
      setCurrentRequirement("")
    }
  }

  // Remove requirement from the list
  const removeRequirement = (requirementToRemove: string) => {
    setAdmissionRequirements(admissionRequirements.filter((requirement) => requirement !== requirementToRemove))
  }

  // Add language requirement
  const addLanguageRequirement = () => {
    if (currentLanguage.trim()) {
      setLanguageRequirements([
        ...languageRequirements,
        {
          language: currentLanguage.trim(),
          minimumScore: currentMinimumScore.trim() || undefined,
          testName: currentTestName.trim() || undefined,
        }
      ])
      setCurrentLanguage("")
      setCurrentMinimumScore("")
      setCurrentTestName("")
    }
  }

  // Remove language requirement
  const removeLanguageRequirement = (index: number) => {
    setLanguageRequirements(languageRequirements.filter((_, i) => i !== index))
  }

  // Add tag to the list
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  // Remove tag from the list
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Handle tag input keydown
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    } else if (e.key === "," || e.key === " ") {
      e.preventDefault()
      addTag()
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the title field",
        variant: "destructive",
      })
      return
    }

    // Only validate university name if source is not "agent"
    if (source !== "agent" && !universityName.trim()) {
      toast({
        title: "Error",
        description: "Please enter the university name",
        variant: "destructive",
      })
      return
    }
    
    if (!description.trim() || !location.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (programs.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one program",
        variant: "destructive",
      })
      return
    }

    if (admissionRequirements.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one admission requirement",
        variant: "destructive",
      })
      return
    }

    if (languageRequirements.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one language requirement",
        variant: "destructive",
      })
      return
    }

    if (tags.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one tag",
        variant: "destructive",
      })
      return
    }

    if (!applicationDeadline) {
      toast({
        title: "Error",
        description: "Please select an application deadline",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      // Create study offer object
      const studyOfferData = {
        title: title.trim(),
        universityName: universityName.trim(),
        description: description.trim(),
        location: location.trim(),
        degreeLevel,
        programs,
        tuitionFees: {
          amount: Number(tuitionAmount),
          currency: tuitionCurrency,
          period: tuitionPeriod,
        },
        scholarshipAvailable,
        scholarshipDetails: scholarshipDetails.trim(),
        applicationDeadline,
        languageRequirements,
        durationInYears: Number(durationInYears),
        campusFacilities,
        admissionRequirements,
        tags,
        color: cardColors[selectedColorIndex].bg,
        accentColor: cardColors[selectedColorIndex].accent,
        category,
        source,
        featured,
      }
      
      // Send data to API
      const response = await fetch(`/api/study-offers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studyOfferData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update study offer')
      }
      
      // Show success message
      toast({
        title: "Success",
        description: "Study offer has been updated successfully",
      })
      
      // Redirect to details page after a short delay
      setTimeout(() => {
        router.push(`/offer/${id}`)
      }, 1500)
      
    } catch (error) {
      console.error('Error updating study offer:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update study offer",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href={`/offer/${id}`} className="inline-flex items-center text-sm mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to offer
        </Link>

        <Card className="border shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Edit className="h-5 w-5" />
                Edit Study Offer
              </CardTitle>
              <CardDescription>Update the study offer information</CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter offer title"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="universityName" className="text-sm font-medium">
                        University Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="universityName"
                        value={universityName}
                        onChange={(e) => setUniversityName(e.target.value)}
                        placeholder="Enter university name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">
                        Location <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter study offer description"
                      rows={4}
                      required
                    />
                  </div>
                </div>
                
                {/* Program Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Program Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category <span className="text-destructive">*</span>
                      </label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="degreeLevel" className="text-sm font-medium">
                        Degree Level <span className="text-destructive">*</span>
                      </label>
                      <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select degree level" />
                        </SelectTrigger>
                        <SelectContent>
                          {degreeLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="durationInYears" className="text-sm font-medium">
                        Duration (Years) <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="durationInYears"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={durationInYears}
                        onChange={(e) => setDurationInYears(e.target.value)}
                        placeholder="e.g. 1, 0.5"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="applicationDeadline" className="text-sm font-medium">
                        Application Deadline <span className="text-destructive">*</span>
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {applicationDeadline ? (
                              format(applicationDeadline, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={applicationDeadline}
                            onSelect={setApplicationDeadline}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="programs" className="text-sm font-medium">
                      Programs <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="programs"
                        value={currentProgram}
                        onChange={(e) => setCurrentProgram(e.target.value)}
                        placeholder="Add program (e.g. Computer Science)"
                      />
                      <Button type="button" onClick={addProgram}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {programs.map((program) => (
                        <Badge key={program} variant="secondary" className="rounded-sm py-1 px-2">
                          {program}
                          <button
                            type="button"
                            className="ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => removeProgram(program)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Tuition & Scholarship */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Tuition & Scholarship</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="tuitionAmount" className="text-sm font-medium">
                        Tuition Amount <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="tuitionAmount"
                        type="number"
                        min="0"
                        value={tuitionAmount}
                        onChange={(e) => setTuitionAmount(e.target.value)}
                        placeholder="Amount"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="tuitionCurrency" className="text-sm font-medium">
                        Currency <span className="text-destructive">*</span>
                      </label>
                      <Select value={tuitionCurrency} onValueChange={setTuitionCurrency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="tuitionPeriod" className="text-sm font-medium">
                        Period <span className="text-destructive">*</span>
                      </label>
                      <Select value={tuitionPeriod} onValueChange={setTuitionPeriod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {periods.map((period) => (
                            <SelectItem key={period} value={period}>
                              {period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="scholarshipAvailable"
                        checked={scholarshipAvailable}
                        onCheckedChange={setScholarshipAvailable}
                      />
                      <Label htmlFor="scholarshipAvailable">Scholarship Available</Label>
                    </div>
                    
                    {scholarshipAvailable && (
                      <Textarea
                        value={scholarshipDetails}
                        onChange={(e) => setScholarshipDetails(e.target.value)}
                        placeholder="Enter scholarship details"
                        rows={2}
                      />
                    )}
                  </div>
                </div>
                
                {/* Requirements */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Requirements</h3>
                  
                  <div className="space-y-2">
                    <label htmlFor="languageRequirements" className="text-sm font-medium">
                      Language Requirements <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        id="currentLanguage"
                        value={currentLanguage}
                        onChange={(e) => setCurrentLanguage(e.target.value)}
                        placeholder="Language (e.g. English)"
                      />
                      <Input
                        id="currentTestName"
                        value={currentTestName}
                        onChange={(e) => setCurrentTestName(e.target.value)}
                        placeholder="Test name (optional)"
                      />
                      <div className="flex gap-2">
                        <Input
                          id="currentMinimumScore"
                          value={currentMinimumScore}
                          onChange={(e) => setCurrentMinimumScore(e.target.value)}
                          placeholder="Min. score (optional)"
                        />
                        <Button type="button" onClick={addLanguageRequirement}>
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-2">
                      {languageRequirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="justify-between rounded-sm py-1 px-2">
                          <span>
                            {req.language}
                            {req.testName && ` - ${req.testName}`}
                            {req.minimumScore && ` (${req.minimumScore})`}
                          </span>
                          <button
                            type="button"
                            className="ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => removeLanguageRequirement(index)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="admissionRequirements" className="text-sm font-medium">
                      Admission Requirements <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="admissionRequirements"
                        value={currentRequirement}
                        onChange={(e) => setCurrentRequirement(e.target.value)}
                        placeholder="Add requirement"
                      />
                      <Button type="button" onClick={addRequirement}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {admissionRequirements.map((requirement) => (
                        <Badge key={requirement} variant="secondary" className="rounded-sm py-1 px-2">
                          {requirement}
                          <button
                            type="button"
                            className="ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => removeRequirement(requirement)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Campus Facilities */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Campus Facilities</h3>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="campusFacilities"
                        value={currentFacility}
                        onChange={(e) => setCurrentFacility(e.target.value)}
                        placeholder="Add campus facility"
                      />
                      <Button type="button" onClick={addFacility}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {campusFacilities.map((facility) => (
                        <Badge key={facility} variant="secondary" className="rounded-sm py-1 px-2">
                          {facility}
                          <button
                            type="button"
                            className="ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => removeFacility(facility)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Tags & Presentation */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Tags & Presentation</h3>
                  
                  <div className="space-y-2">
                    <label htmlFor="tags" className="text-sm font-medium">
                      Tags <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Add tag (press Enter or comma to add)"
                      />
                      <Button type="button" onClick={addTag}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-sm py-1 px-2">
                          {tag}
                          <button
                            type="button"
                            className="ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => removeTag(tag)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Card Color</label>
                    <div className="flex flex-wrap gap-2">
                      {cardColors.map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`w-10 h-10 rounded-full border-2 ${color.bg} ${
                            selectedColorIndex === index ? `border-primary ring-2 ring-primary/20` : "border-transparent"
                          }`