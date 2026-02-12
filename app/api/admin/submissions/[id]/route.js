import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

// Verify admin key
function verifyAdminKey(request) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return false;
  
  const headerKey = request.headers.get('x-admin-key');
  const url = new URL(request.url);
  const queryKey = url.searchParams.get('adminKey');
  
  return headerKey === adminKey || queryKey === adminKey;
}

// GET /api/admin/submissions/[id] - Get single submission
export async function GET(request, { params }) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = await params;
    const collection = await getCollection('submissions');
    const submission = await collection.findOne({ id });
    
    if (!submission) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Admin get submission error:', error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}

// PATCH /api/admin/submissions/[id] - Update submission status
export async function PATCH(request, { params }) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Only allow updating status
    const allowedUpdates = ['status'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (data[key] !== undefined) {
        updates[key] = data[key];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }
    
    updates.updated_at = new Date().toISOString();
    
    const collection = await getCollection('submissions');
    const result = await collection.updateOne(
      { id },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('Admin update submission error:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}

// DELETE /api/admin/submissions/[id] - Delete submission
export async function DELETE(request, { params }) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = await params;
    const collection = await getCollection('submissions');
    const result = await collection.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete submission error:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}
