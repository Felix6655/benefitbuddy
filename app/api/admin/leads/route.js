import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

const ADMIN_KEY = process.env.ADMIN_KEY || 'ChangeMe-SetStrongKey-2026';

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
