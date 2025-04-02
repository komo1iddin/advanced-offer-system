import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StudyOffer from '@/lib/models/StudyOffer';

interface Params {
  params: {
    id: string;
  }
}

// Simple in-memory cache for offer details
interface CacheEntry {
  data: any;
  expiresAt: number;
}

const offerCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds cache TTL

// GET a specific study offer by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Check if we have a valid cached response
    const cachedEntry = offerCache.get(id);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return NextResponse.json(cachedEntry.data, {
        headers: {
          'Cache-Control': 'public, max-age=60',
          'X-Cache': 'HIT'
        }
      });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the offer by ID - use lean() for better performance
    const offer = await StudyOffer.findById(id).lean();
    
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Study offer not found' },
        { status: 404 }
      );
    }
    
    // Prepare response
    const response = { success: true, data: offer };
    
    // Store in cache
    offerCache.set(id, {
      data: response,
      expiresAt: Date.now() + CACHE_TTL_MS
    });
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('Error fetching study offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch study offer' },
      { status: 500 }
    );
  }
}

// PUT (update) a specific study offer by ID
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const data = await req.json();
    
    // Find and update the offer
    const updatedOffer = await StudyOffer.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedOffer) {
      return NextResponse.json(
        { success: false, error: 'Study offer not found' },
        { status: 404 }
      );
    }
    
    // Clear cache for this offer
    offerCache.delete(id);
    
    return NextResponse.json({ success: true, data: updatedOffer });
  } catch (error) {
    console.error('Error updating study offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update study offer' },
      { status: 500 }
    );
  }
}

// DELETE a specific study offer by ID
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Find and delete the offer
    const deletedOffer = await StudyOffer.findByIdAndDelete(id);
    
    if (!deletedOffer) {
      return NextResponse.json(
        { success: false, error: 'Study offer not found' },
        { status: 404 }
      );
    }
    
    // Clear cache for this offer
    offerCache.delete(id);
    
    return NextResponse.json(
      { success: true, message: 'Study offer deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting study offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete study offer' },
      { status: 500 }
    );
  }
} 