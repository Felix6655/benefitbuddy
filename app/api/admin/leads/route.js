import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

const ADMIN_KEY = process.env.ADMIN_KEY || 'ChangeMe-SetStrongKey-2026';

// Valid lead statuses
const VALID_STATUSES = ['new', 'contacted', 'converted', 'lost'];

// GET /api/admin/leads - Get all leads (admin only)
export async function GET(request) {
  try {
    // Check admin key
    const { searchParams } = new URL(request.url);
    const providedKey = searchParams.get('key');
    
    if (!providedKey || providedKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get leads collection
    const collection = await getCollection('leads');
    
    // Fetch latest 50 leads, sorted by created_at descending
    const leads = await collection
      .find({})
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      leads,
      count: leads.length,
      fetched_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Admin leads fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/leads - Update lead status (admin only)
export async function PATCH(request) {
  try {
    // Check admin key
    const { searchParams } = new URL(request.url);
    const providedKey = searchParams.get('key');
    
    if (!providedKey || providedKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Get leads collection
    const collection = await getCollection('leads');
    
    // Update the lead status
    const result = await collection.updateOne(
      { id: id },
      { 
        $set: { 
          status: status,
          status_updated_at: new Date().toISOString(),
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: id,
      status: status,
      updated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Admin leads update error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}
