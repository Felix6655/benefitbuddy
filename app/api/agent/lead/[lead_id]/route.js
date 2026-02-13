import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { verifyReceiptToken } from '@/lib/tokenUtils';

// GET /api/agent/lead/[lead_id] - Get lead for agent with token verification
export async function GET(request, { params }) {
  try {
    const { lead_id } = params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate required params
    if (!lead_id) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 });
    }

    // Get the lead
    const collection = await getCollection('leads');
    const lead = await collection.findOne({ id: lead_id });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Verify the lead has an assigned agent
    if (!lead.assigned_agent?.id) {
      return NextResponse.json({ error: 'Lead not assigned to an agent' }, { status: 403 });
    }

    // Verify the token
    const isValid = verifyReceiptToken(
      token,
      lead.id,
      lead.assigned_agent.id,
      lead.created_at
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Return only safe fields for agent view
    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        full_name: lead.full_name,
        phone: lead.phone_display || lead.phone,
        zip_code: lead.zip_code,
        state: lead.state,
        lead_priority: lead.lead_priority,
        turning_65_soon: lead.turning_65_soon,
        has_medicare_now: lead.has_medicare_now,
        wants_call_today: lead.wants_call_today,
        created_at: lead.created_at,
      },
      agent: {
        id: lead.assigned_agent.id,
        name: lead.assigned_agent.name,
      },
    });

  } catch (error) {
    console.error('Agent lead fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}
