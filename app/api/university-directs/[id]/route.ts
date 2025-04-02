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
    
    // Find and update the university direct
    const updatedUniversityDirect = await UniversityDirect.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedUniversityDirect) {
      return NextResponse.json(
        { success: false, error: 'University direct not found' },
        { status: 404 }
      );
    }
    
    // Convert the Mongoose document to a plain JavaScript object
    const updatedUniversityDirectData = updatedUniversityDirect.toObject();
    
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
    
    // Find and delete the university direct
    const deletedUniversityDirect = await UniversityDirect.findByIdAndDelete(params.id);
    
    if (!deletedUniversityDirect) {
      return NextResponse.json(
        { success: false, error: 'University direct not found' },
        { status: 404 }
      );
    }
    
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