import { Suspense } from 'react'
import { LayoutGrid, List, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Link from "next/link"
import { StudyOffersClientComponent } from "@/components/study-offers/study-offers-client"
import { LoadingState } from "@/components/study-offers/loading-state"
import { headers } from 'next/headers'
import { StaticHeader, DegreeLevelsList, AboutStudyingInChina } from "@/components/study-offers/static-content"

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

// Cache headers for the page to improve performance
export const revalidate = 3600 // Revalidate at most once per hour

async function getStudyOffers(searchParams: URLSearchParams) {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  
  try {
    // Server-side fetch with native fetch and AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch(`${api}/api/study-offers?${searchParams.toString()}`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache'
      },
      next: { 
        revalidate: 60 // Revalidate every 60 seconds
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`Error fetching study offers: ${response.status}`)
    }
    
    return response.json()
  } catch (error) {
    console.error("Server fetch error:", error)
    // Return empty data for failed fetches, will be handled by client
    return { 
      success: false, 
      data: [], 
      pagination: { total: 0, page: 1, limit: 8, pages: 0 } 
    }
  }
}

export default async function StudyOffersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Convert searchParams to URLSearchParams for API request
  const params = new URLSearchParams()
  
  // Add search parameters
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === 'string') {
        params.append(key, value)
      } else if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v))
      }
    })
  }
  
  // Default page and limit if not provided
  if (!params.has('page')) params.set('page', '1')
  if (!params.has('limit')) params.set('limit', '8')
  
  // Fetch initial data server-side
  const initialData = await getStudyOffers(params)

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Static Header Component */}
        <StaticHeader />
        
        {/* Static Degree Levels Component */}
        <DegreeLevelsList />

        {/* Client-side interactive components */}
        <Suspense fallback={<LoadingState viewMode="grid" count={6} />}>
          <StudyOffersClientComponent 
            initialData={initialData} 
            initialSearchParams={Object.fromEntries(params.entries())}
          />
        </Suspense>
        
        {/* Static About Section */}
        <AboutStudyingInChina />
      </div>
    </div>
  )
}

