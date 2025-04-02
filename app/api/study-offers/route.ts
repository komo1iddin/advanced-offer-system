import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StudyOffer from '@/lib/models/StudyOffer';
import { getServerSession } from 'next-auth/next';

// In-memory cache for recent queries (simple implementation)
// In a production app, you might want to use Redis or another caching solution
interface CacheEntry {
  data: any;
  expiresAt: number;
}

const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds cache TTL
const MAX_CACHE_SIZE = 100; // Maximum number of cached queries

// Simple function to generate a cache key from query parameters
function generateCacheKey(params: URLSearchParams): string {
  return Array.from(params.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

// Clear expired cache entries
function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of queryCache.entries()) {
    if (entry.expiresAt < now) {
      queryCache.delete(key);
    }
  }
}

// Limit cache size by removing oldest entries
function limitCacheSize(): void {
  if (queryCache.size <= MAX_CACHE_SIZE) return;
  
  // Convert to array, sort by expiration, and keep only the newest MAX_CACHE_SIZE entries
  const entries = Array.from(queryCache.entries())
    .sort((a, b) => b[1].expiresAt - a[1].expiresAt)
    .slice(0, MAX_CACHE_SIZE);
  
  queryCache.clear();
  entries.forEach(([key, value]) => {
    queryCache.set(key, value);
  });
}

// GET all study offers
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const params = url.searchParams;
    
    // Generate cache key from query parameters
    const cacheKey = generateCacheKey(params);
    
    // Check if we have a valid cached response
    const cachedEntry = queryCache.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return NextResponse.json(cachedEntry.data, {
        headers: {
          'Cache-Control': 'public, max-age=30',
          'X-Cache': 'HIT'
        }
      });
    }
    
    // Parse individual parameters
    const category = params.get('category');
    const degreeLevel = params.get('degreeLevel');
    const searchQuery = params.get('search');
    const featured = params.get('featured');
    const limit = parseInt(params.get('limit') || '50');
    const page = parseInt(params.get('page') || '1');
    const skip = (page - 1) * limit;

    // Connect to the database - now optimized with connection pooling
    const connection = await connectToDatabase();

    // Build the query
    let query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (degreeLevel) {
      query.degreeLevel = degreeLevel;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { universityName: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } },
      ];
    }

    // Run count query and find query concurrently for better performance
    const [total, offers] = await Promise.all([
      StudyOffer.countDocuments(query),
      StudyOffer.find(query)
        .select('-description') // Exclude large fields to improve initial load time
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() // Return plain JavaScript objects instead of Mongoose documents (faster)
    ]);

    // Prepare the response
    const response = {
      success: true,
      data: offers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };

    // Store in cache
    queryCache.set(cacheKey, {
      data: response,
      expiresAt: Date.now() + CACHE_TTL_MS
    });
    
    // Clean up expired cache entries
    clearExpiredCache();
    limitCacheSize();

    // Return the response with cache headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=30',
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('Error fetching study offers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch study offers' },
      { status: 500 }
    );
  }
}

// POST a new study offer
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession();
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const data = await req.json();
    
    // Create a new study offer
    const newOffer = await StudyOffer.create(data);
    
    // Clear the entire cache since we've added a new offer
    queryCache.clear();
    
    return NextResponse.json(
      { success: true, data: newOffer },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating study offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create study offer' },
      { status: 500 }
    );
  }
} 