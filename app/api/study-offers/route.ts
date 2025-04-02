import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StudyOffer from '@/lib/models/StudyOffer';
import { getServerSession } from 'next-auth/next';
import { redisCache } from '@/lib/redis-cache';

// Function to generate a cache key from query parameters
function generateCacheKey(params: URLSearchParams): string {
  return `study-offers:${Array.from(params.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;
}

// GET all study offers
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const params = url.searchParams;
    
    // Generate cache key from query parameters
    const cacheKey = generateCacheKey(params);
    
    // Check if we have a valid cached response from Redis
    const cachedData = await redisCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
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

    // Store in Redis cache - cache for 30 seconds (short TTL for frequently changing data)
    await redisCache.set(cacheKey, response, 30);

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
    
    // Invalidate all study offers cache
    await redisCache.invalidatePattern('study-offers:*');
    
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