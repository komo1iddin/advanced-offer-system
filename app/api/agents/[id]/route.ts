import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Agent from '@/lib/models/Agent';
import { getServerSession } from 'next-auth/next';

interface Params {
  params: {
    id: string;
  }
}

// GET a specific agent by ID
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the agent by ID
    const agent = await Agent.findById(id);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PUT (update) a specific agent by ID
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

    const { id } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const data = await req.json();
    
    // Find and update the agent
    const updatedAgent = await Agent.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedAgent });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE a specific agent by ID
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

    const { id } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Find and delete the agent
    const deletedAgent = await Agent.findByIdAndDelete(id);
    
    if (!deletedAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Agent deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
} 