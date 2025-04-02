import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UniversityDirect from '@/lib/models/UniversityDirect';
import { getServerSession } from 'next-auth/next';

interface Params {
  params: {
    id: string;
  }
}

// GET a specific university direct by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Connect to the database first
    await connectToDatabase();
    
    // Find the university direct by ID
    const universityDirect = await UniversityDirect.findById(params.id);
    
    if (!universityDirect) {
      return NextResponse.json(
        { success: false, error: 'University direct not found' },
        { status: 404 }
      );
    }
    
    // Convert the Mongoose document to a plain JavaScript object
    const universityDirectData = universityDirect.toObject();
    
    return NextResponse.json(universityDirectData);
  } catch (error) {
    console.error('Error fetching university direct:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch university direct' },
      { status: 500 }
    );
  }
}

// PUT (update) a specific university direct by ID
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    // Connect to the database first (before auth check)
    await connectToDatabase();
    
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession();
    
    console.log("Session in PUT /api/university-directs:", JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error("No session found in PUT /api/university-directs");
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (!session.user) {
      console.error("No user in session for PUT /api/university-directs");
      return NextResponse.json(
        { success: false, error: 'User not found in session' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      console.error(`User role (${session.user.role}) is not admin for PUT /api/university-directs`);
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const data = await req.json();
    console.log("Request data for PUT /api/university-directs:", data);
    
    // Find the university direct first to check if it exists
    const existingUniversityDirect = await UniversityDirect.findById(params.id);
    
    if (!existingUniversityDirect) {
      return NextResponse.json(
        { success: false, error: 'University direct not found' },
        { status: 404 }
      );
    }
    
    // If we're only updating the active status, preserve all other fields
    if (Object.keys(data).length === 1 && 'active' in data) {
      console.log(`Updating only active status to ${data.active} for university direct ${params.id}`);
    }
    
    // Find and update the university direct
    const updatedUniversityDirect = await UniversityDirect.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedUniversityDirect) {
      return NextResponse.json(
        { success: false, error: 'Failed to update university direct' },
        { status: 500 }
      );
    }
    
    // Convert the Mongoose document to a plain JavaScript object
    const updatedUniversityDirectData = updatedUniversityDirect.toObject();
    console.log("Successfully updated university direct:", updatedUniversityDirectData._id);
    
    return NextResponse.json(updatedUniversityDirectData);
  } catch (error) {
    console.error('Error updating university direct:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update university direct' },
      { status: 500 }
    );
  }
}

// DELETE a specific university direct by ID
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // Connect to the database first (before auth check)
    await connectToDatabase();
    
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession();
    
    console.log("Session in DELETE /api/university-directs:", JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error("No session found in DELETE /api/university-directs");
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (!session.user) {
      console.error("No user in session for DELETE /api/university-directs");
      return NextResponse.json(
        { success: false, error: 'User not found in session' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      console.error(`User role (${session.user.role}) is not admin for DELETE /api/university-directs`);
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Check if the university direct exists
    const existingUniversityDirect = await UniversityDirect.findById(params.id);
    
    if (!existingUniversityDirect) {
      return NextResponse.json(
        { success: false, error: 'University direct not found' },
        { status: 404 }
      );
    }
    
    console.log(`Attempting to delete university direct with ID: ${params.id}`);
    
    // Find and delete the university direct
    const deletedUniversityDirect = await UniversityDirect.findByIdAndDelete(params.id);
    
    if (!deletedUniversityDirect) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete university direct' },
        { status: 500 }
      );
    }
    
    console.log(`Successfully deleted university direct with ID: ${params.id}`);
    
    return NextResponse.json(
      { success: true, message: 'University direct deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting university direct:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete university direct' },
      { status: 500 }
    );
  }
} 