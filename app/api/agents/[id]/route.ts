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
    // Connect to the database first
    await connectToDatabase();
    
    // Find the agent by ID
    const agent = await Agent.findById(params.id);
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Convert the Mongoose document to a plain JavaScript object
    const agentData = agent.toObject();
    
    return NextResponse.json(agentData);
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
    
    console.log("Session in PUT /api/agents:", session);
    
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
    
    // Find and update the agent
    const updatedAgent = await Agent.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Convert the Mongoose document to a plain JavaScript object
    const updatedAgentData = updatedAgent.toObject();
    
    return NextResponse.json(updatedAgentData);
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
    
    console.log("Session in DELETE /api/agents:", session);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find and delete the agent
    const deletedAgent = await Agent.findByIdAndDelete(params.id);
    
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