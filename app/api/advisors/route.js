import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Authenticate admin requests
function isAuthorized(request) {
  const { searchParams } = new URL(request.url);
  const adminKey = searchParams.get('key');
  return adminKey === process.env.ADMIN_KEY;
}

// GET - List all advisors
export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const collection = await getCollection('advisors');
    const advisors = await collection.find({}).sort({ created_at: -1 }).toArray();
    return NextResponse.json({ advisors });
  } catch (error) {
    console.error('[Advisors GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch advisors' }, { status: 500 });
  }
}

// POST - Create new advisor
export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, email, zip_prefixes, active, is_default } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    }

    const collection = await getCollection('advisors');

    // If setting as default, unset other defaults
    if (is_default) {
      await collection.updateMany({ is_default: true }, { $set: { is_default: false } });
    }

    const advisor = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      name: name.trim(),
      phone: phone,
      email: email || null,
      zip_prefixes: Array.isArray(zip_prefixes) ? zip_prefixes : [],
      active: active !== false,
      is_default: is_default || false,
      updated_at: new Date().toISOString(),
    };

    await collection.insertOne(advisor);
    return NextResponse.json({ success: true, advisor });
  } catch (error) {
    console.error('[Advisors POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create advisor' }, { status: 500 });
  }
}

// PATCH - Update advisor
export async function PATCH(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Advisor ID is required' }, { status: 400 });
    }

    const collection = await getCollection('advisors');

    // If setting as default, unset other defaults
    if (updates.is_default) {
      await collection.updateMany({ is_default: true, id: { $ne: id } }, { $set: { is_default: false } });
    }

    const updateFields = {};
    if (updates.name !== undefined) updateFields.name = updates.name;
    if (updates.phone !== undefined) updateFields.phone = updates.phone;
    if (updates.email !== undefined) updateFields.email = updates.email;
    if (updates.zip_prefixes !== undefined) updateFields.zip_prefixes = updates.zip_prefixes;
    if (updates.active !== undefined) updateFields.active = updates.active;
    if (updates.is_default !== undefined) updateFields.is_default = updates.is_default;
    updateFields.updated_at = new Date().toISOString();

    const result = await collection.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Advisor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, advisor: result });
  } catch (error) {
    console.error('[Advisors PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update advisor' }, { status: 500 });
  }
}

// DELETE - Delete advisor
export async function DELETE(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Advisor ID is required' }, { status: 400 });
    }

    const collection = await getCollection('advisors');
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Advisor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Advisors DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete advisor' }, { status: 500 });
  }
}
