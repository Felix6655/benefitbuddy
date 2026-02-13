import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimit';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { generateReceiptToken } from '@/lib/tokenUtils';

// Lead validation schema
const leadSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string()
    .min(10, 'Phone must be at least 10 digits')
    .max(20)
    .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number format'),
  zip_code: z.string()
    .min(5, 'ZIP code must be at least 5 digits')
    .max(10)
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to be contacted',
  }),
  // Pre-qualifying questions (required)
  turning_65_soon: z.boolean(),
  has_medicare_now: z.boolean(),
  wants_call_today: z.boolean(),
  // Optional fields
  email: z.string().email().optional().or(z.literal('')),
  source: z.string().max(50).optional(),
  matched_programs: z.array(z.string()).optional(),
  state: z.string().max(50).optional(),
  page_url: z.string().max(500).optional(),
});

// Helper to generate receipt URL
function buildReceiptUrl(leadId, agentId, createdAt) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const token = generateReceiptToken(leadId, agentId, createdAt);
  return `${baseUrl}/agent/lead/${leadId}?token=${token}`;
}

// POST /api/leads - Create new Medicare advisor lead
export async function POST(request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit (stricter for leads - 5 per minute)
    const rateLimitResult = rateLimit(ip, { maxRequests: 5, windowMs: 60000 });
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }
    
    const data = await request.json();
    
    // Honeypot check - if 'website' field is filled, it's likely a bot
    if (data.website && data.website.length > 0) {
      // Silently accept but don't save
      return NextResponse.json({ 
        success: true, 
        id: 'blocked',
        message: 'Thank you! An advisor will contact you soon.' 
      });
    }
    
    // Validate input
    const validation = leadSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        },
        { status: 400 }
      );
    }
    
    const validData = validation.data;
    
    // Calculate lead priority
    let lead_priority = 'cold';
    if (validData.wants_call_today === true) {
      lead_priority = 'hot';
    } else if (validData.turning_65_soon === true || validData.has_medicare_now === true) {
      lead_priority = 'warm';
    }

    // Find assigned agent for HOT leads based on ZIP code
    let assigned_agent = null;
    if (lead_priority === 'hot') {
      const agentsCollection = await getCollection('agents');
      const zipCode = validData.zip_code.slice(0, 5);
      
      // Find active agent covering this ZIP
      assigned_agent = await agentsCollection.findOne({
        is_active: true,
        covered_zips: zipCode,
      });
      
      // Increment agent's lead count if found
      if (assigned_agent) {
        await agentsCollection.updateOne(
          { id: assigned_agent.id },
          { $inc: { leads_assigned: 1 } }
        );
      }
    }
    
    // Create lead document
    const lead = {
      id: uuidv4(),
      full_name: validData.full_name.trim(),
      phone: validData.phone.replace(/[^\d]/g, ''), // Store digits only
      phone_display: validData.phone, // Keep formatted version for display
      zip_code: validData.zip_code,
      email: validData.email || null,
      state: validData.state || null,
      // Pre-qualifying answers
      turning_65_soon: validData.turning_65_soon,
      has_medicare_now: validData.has_medicare_now,
      wants_call_today: validData.wants_call_today,
      // Lead priority
      lead_priority: lead_priority,
      // Agent assignment
      assigned_agent: assigned_agent ? {
        id: assigned_agent.id,
        name: assigned_agent.name,
        phone: assigned_agent.phone,
        email: assigned_agent.email,
      } : null,
      // Delivery tracking
      delivery: {
        sent_to_n8n: false,
        sent_at: null,
        error: null,
        attempt_count: 0,
        last_attempt_at: null,
        n8n_webhook_id: null,
        agent_webhook_sent: false,
        agent_webhook_sent_at: null,
        agent_webhook_error: null,
        agent_attempt_count: 0,
        agent_last_attempt_at: null,
        agent_webhook_id: null,
      },
      // Meta fields
      consent: validData.consent,
      consent_timestamp: new Date().toISOString(),
      source: validData.source || 'medicare_cta',
      page_url: validData.page_url || null,
      matched_programs: validData.matched_programs || [],
      status: 'new',
      created_at: new Date().toISOString(),
      ip_hash: hashIP(ip), // Store hashed IP for fraud detection
    };
    
    // Save to database
    const collection = await getCollection('leads');
    await collection.insertOne(lead);

    // Send to agent-specific webhook for HOT leads with assigned agent
    // Check delivery lock - skip if already sent or max attempts reached
    if (lead_priority === 'hot' && assigned_agent && assigned_agent.webhook_url) {
      const agentWebhookId = `${lead.id}_${assigned_agent.id}`;
      
      try {
        const agentWebhookResponse = await fetch(assigned_agent.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'benefitbuddy_leads',
            type: 'medicare_lead',
            event_name: 'medicare_lead_hot_assigned',
            lead_priority: 'hot',
            // Idempotency fields
            lead_id: lead.id,
            delivery_webhook_id: agentWebhookId,
            assigned_agent: {
              id: assigned_agent.id,
              name: assigned_agent.name,
            },
            lead: {
              id: lead.id,
              full_name: lead.full_name,
              phone: lead.phone_display,
              zip_code: lead.zip_code,
              state: lead.state,
              turning_65_soon: lead.turning_65_soon,
              has_medicare_now: lead.has_medicare_now,
              wants_call_today: lead.wants_call_today,
              source: lead.source,
              created_at: lead.created_at,
            },
          }),
        });

        // Update agent-specific delivery status
        await collection.updateOne(
          { id: lead.id },
          { 
            $set: { 
              'delivery.agent_webhook_sent': agentWebhookResponse.ok,
              'delivery.agent_webhook_sent_at': new Date().toISOString(),
              'delivery.agent_webhook_error': agentWebhookResponse.ok ? null : `HTTP ${agentWebhookResponse.status}`,
              'delivery.agent_last_attempt_at': new Date().toISOString(),
              'delivery.agent_webhook_id': agentWebhookId,
            },
            $inc: { 'delivery.agent_attempt_count': 1 }
          }
        );
      } catch (err) {
        console.error('Agent webhook error:', err.message);
        await collection.updateOne(
          { id: lead.id },
          { 
            $set: { 
              'delivery.agent_webhook_sent': false,
              'delivery.agent_webhook_sent_at': new Date().toISOString(),
              'delivery.agent_webhook_error': err.message,
              'delivery.agent_last_attempt_at': new Date().toISOString(),
              'delivery.agent_webhook_id': agentWebhookId,
            },
            $inc: { 'delivery.agent_attempt_count': 1 }
          }
        );
      }
    }
    
    // Forward to main n8n webhook if configured
    const webhookUrl = process.env.N8N_LEADS_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      // Determine event name based on priority
      const event_name = assigned_agent 
        ? `medicare_lead_${lead_priority}_assigned`
        : `medicare_lead_${lead_priority}`;
      
      const n8nWebhookId = `${lead.id}_n8n`;
      
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'benefitbuddy_leads',
            type: 'medicare_lead',
            event_name: event_name,
            // Idempotency fields
            lead_id: lead.id,
            delivery_webhook_id: n8nWebhookId,
            lead_priority: lead_priority,
            assigned_agent: assigned_agent ? {
              id: assigned_agent.id,
              name: assigned_agent.name,
              phone: assigned_agent.phone,
              email: assigned_agent.email,
            } : null,
            lead: {
              id: lead.id,
              full_name: lead.full_name,
              phone: lead.phone_display,
              zip_code: lead.zip_code,
              state: lead.state,
              // Pre-qualifying answers
              turning_65_soon: lead.turning_65_soon,
              has_medicare_now: lead.has_medicare_now,
              wants_call_today: lead.wants_call_today,
              lead_priority: lead_priority,
              // Meta
              source: lead.source,
              page_url: lead.page_url,
              matched_programs: lead.matched_programs,
              status: lead.status,
              created_at: lead.created_at,
            },
          }),
        });

        // Update delivery status
        await collection.updateOne(
          { id: lead.id },
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
      } catch (err) {
        console.error('n8n leads webhook error:', err.message);
        // Update delivery status with error
        await collection.updateOne(
          { id: lead.id },
          { 
            $set: { 
              'delivery.sent_to_n8n': false,
              'delivery.sent_at': new Date().toISOString(),
              'delivery.error': err.message,
              'delivery.last_attempt_at': new Date().toISOString(),
              'delivery.n8n_webhook_id': n8nWebhookId,
            },
            $inc: { 'delivery.attempt_count': 1 }
          }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      id: lead.id,
      lead_priority: lead_priority,
      message: lead_priority === 'hot' 
        ? 'Thank you! A licensed Medicare advisor will call you very soon.'
        : 'Thank you! A licensed Medicare advisor will contact you within 1 business day.',
    });
    
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// Simple IP hashing for privacy-preserving fraud detection
function hashIP(ip) {
  if (!ip || ip === 'unknown') return 'unknown';
  // Simple hash - in production use crypto
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
