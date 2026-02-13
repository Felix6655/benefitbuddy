import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { generateReceiptToken } from '@/lib/tokenUtils';

const ADMIN_KEY = process.env.ADMIN_KEY || 'ChangeMe-SetStrongKey-2026';

// Valid lead statuses
const VALID_STATUSES = ['new', 'contacted', 'converted', 'lost', 'on_hold_no_credits'];

// Helper to build receipt URL
function buildReceiptUrl(leadId, agentId, createdAt) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const token = generateReceiptToken(leadId, agentId, createdAt);
  return `${baseUrl}/agent/lead/${leadId}?token=${token}`;
}

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

// PATCH /api/admin/leads - Update lead status or retry delivery (admin only)
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
    const { id, status, action } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Get leads collection
    const collection = await getCollection('leads');

    // Handle retry delivery action
    if (action === 'retry_delivery') {
      // Get the lead first
      const lead = await collection.findOne({ id: id });
      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      // Check if already delivered successfully
      if (lead.delivery?.sent_to_n8n === true) {
        return NextResponse.json({ 
          error: 'Lead already delivered successfully to n8n',
          delivery: lead.delivery 
        }, { status: 400 });
      }

      // Check if max attempts reached (3)
      if ((lead.delivery?.attempt_count || 0) >= 3) {
        // Reset for retry
        await collection.updateOne(
          { id: id },
          { 
            $set: { 
              'delivery.attempt_count': 0,
              'delivery.error': null,
              'delivery.last_attempt_at': null,
            } 
          }
        );
      }

      // Attempt delivery
      const webhookUrl = process.env.N8N_LEADS_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        return NextResponse.json({ 
          error: 'No webhook URL configured',
          success: false 
        }, { status: 400 });
      }

      const n8nWebhookId = `${lead.id}_n8n_retry_${Date.now()}`;
      const event_name = lead.assigned_agent 
        ? `medicare_lead_${lead.lead_priority}_assigned`
        : `medicare_lead_${lead.lead_priority}`;

      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'benefitbuddy_leads',
            type: 'medicare_lead',
            event_name: event_name,
            lead_id: lead.id,
            delivery_webhook_id: n8nWebhookId,
            is_retry: true,
            lead_priority: lead.lead_priority,
            assigned_agent: lead.assigned_agent || null,
            lead: {
              id: lead.id,
              full_name: lead.full_name,
              phone: lead.phone_display || lead.phone,
              zip_code: lead.zip_code,
              state: lead.state,
              turning_65_soon: lead.turning_65_soon,
              has_medicare_now: lead.has_medicare_now,
              wants_call_today: lead.wants_call_today,
              lead_priority: lead.lead_priority,
              source: lead.source,
              page_url: lead.page_url,
              matched_programs: lead.matched_programs,
              status: lead.status,
              created_at: lead.created_at,
            },
          }),
        });

        await collection.updateOne(
          { id: id },
          { 
            $set: { 
              'delivery.sent_to_n8n': webhookResponse.ok,
              'delivery.sent_at': new Date().toISOString(),
              'delivery.error': webhookResponse.ok ? null : `HTTP ${webhookResponse.status}`,
              'delivery.last_attempt_at': new Date().toISOString(),
              'delivery.n8n_webhook_id': n8nWebhookId,
            },
            $inc: { 'delivery.attempt_count': 1 }
          }
        );

        return NextResponse.json({
          success: webhookResponse.ok,
          id: id,
          message: webhookResponse.ok ? 'Delivery successful' : `Delivery failed: HTTP ${webhookResponse.status}`,
        });

      } catch (err) {
        await collection.updateOne(
          { id: id },
          { 
            $set: { 
              'delivery.sent_to_n8n': false,
              'delivery.error': err.message,
              'delivery.last_attempt_at': new Date().toISOString(),
            },
            $inc: { 'delivery.attempt_count': 1 }
          }
        );

        return NextResponse.json({
          success: false,
          id: id,
          message: `Delivery failed: ${err.message}`,
        });
      }
    }

    // Handle status update
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

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
