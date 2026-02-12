import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

// Verify admin key
function verifyAdminKey(request) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return false;
  
  // Check header or query param
  const headerKey = request.headers.get('x-admin-key');
  const url = new URL(request.url);
  const queryKey = url.searchParams.get('adminKey');
  
  return headerKey === adminKey || queryKey === adminKey;
}

// GET /api/admin/submissions - List all submissions
export async function GET(request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    const collection = await getCollection('submissions');
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { zip_code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
    }
    
    // Get total count
    const total = await collection.countDocuments(query);
    
    // Get paginated results
    const submissions = await collection
      .find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Admin submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
