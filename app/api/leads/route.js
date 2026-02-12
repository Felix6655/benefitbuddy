import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimit';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

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
  // Optional fields
  email: z.string().email().optional().or(z.literal('')),
  source: z.string().max(50).optional(),
  matched_programs: z.array(z.string()).optional(),
  state: z.string().max(50).optional(),
});

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
    
    // Create lead document
    const lead = {
      id: uuidv4(),
      full_name: validData.full_name.trim(),
      phone: validData.phone.replace(/[^\d]/g, ''), // Store digits only
      phone_display: validData.phone, // Keep formatted version for display
      zip_code: validData.zip_code,
      email: validData.email || null,
      state: validData.state || null,
      consent: validData.consent,
      consent_timestamp: new Date().toISOString(),
      source: validData.source || 'medicare_cta',
      matched_programs: validData.matched_programs || [],
      status: 'new',
      created_at: new Date().toISOString(),
      ip_hash: hashIP(ip), // Store hashed IP for fraud detection
    };
    
    // Save to database
    const collection = await getCollection('leads');
    await collection.insertOne(lead);
    
    // Forward to n8n webhook if configured (non-blocking)
    const webhookUrl = process.env.N8N_LEADS_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'benefitbuddy_leads',
          type: 'medicare_lead',
          lead: {
            id: lead.id,
            full_name: lead.full_name,
            phone: lead.phone_display,
            zip_code: lead.zip_code,
            state: lead.state,
            matched_programs: lead.matched_programs,
            created_at: lead.created_at,
          },
        }),
      }).catch(err => {
        console.error('n8n leads webhook error:', err.message);
      });
    }
    
    return NextResponse.json({
      success: true,
      id: lead.id,
      message: 'Thank you! A licensed Medicare advisor will contact you within 1 business day.',
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
