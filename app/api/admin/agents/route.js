import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const ADMIN_KEY = process.env.ADMIN_KEY || 'ChangeMe-SetStrongKey-2026';

// Agent validation schema
const agentSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20).optional(),
  email: z.string().email().optional(),
  webhook_url: z.string().url().optional(),
  covered_zips: z.array(z.string()).min(1, 'At least one ZIP code required'),
  state: z.string().max(50).optional(),
  is_active: z.boolean().default(true),
});

// GET /api/admin/agents - Get all agents
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const providedKey = searchParams.get('key');
    
    if (!providedKey || providedKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collection = await getCollection('agents');
    const agents = await collection.find({}).sort({ created_at: -1 }).toArray();

    return NextResponse.json({
      agents,
      count: agents.length,
    });
  } catch (error) {
    console.error('Agents fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

// POST /api/admin/agents - Create new agent
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const providedKey = searchParams.get('key');
    
    if (!providedKey || providedKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = agentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors,
      }, { status: 400 });
    }

    const data = validation.data;
    
    // Normalize ZIP codes (remove spaces, ensure 5 digits)
    const normalizedZips = data.covered_zips.map(z => z.trim().slice(0, 5));

    const agent = {
      id: uuidv4(),
      name: data.name.trim(),
      phone: data.phone || null,
      email: data.email || null,
      webhook_url: data.webhook_url || null,
      covered_zips: normalizedZips,
      state: data.state || null,
      is_active: data.is_active !== false,
      leads_assigned: 0,
      leads_converted: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const collection = await getCollection('agents');
    await collection.insertOne(agent);

    return NextResponse.json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error('Agent create error:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}

// PATCH /api/admin/agents - Update agent
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const providedKey = searchParams.get('key');
    
    if (!providedKey || providedKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    // Normalize ZIP codes if provided
    if (updates.covered_zips) {
      updates.covered_zips = updates.covered_zips.map(z => z.trim().slice(0, 5));
    }

    updates.updated_at = new Date().toISOString();

    const collection = await getCollection('agents');
    const result = await collection.updateOne(
      { id },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Agent update error:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

// DELETE /api/admin/agents - Delete agent
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const providedKey = searchParams.get('key');
    const agentId = searchParams.get('id');
    
    if (!providedKey || providedKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    const collection = await getCollection('agents');
    const result = await collection.deleteOne({ id: agentId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Agent delete error:', error);
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
