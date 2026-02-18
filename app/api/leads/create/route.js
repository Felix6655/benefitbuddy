import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendSmsToAdvisor, sendSmsToLead } from '@/lib/twilioService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { first_name, phone, zip, consent, answers } = body;

    // Validate required fields
    if (!first_name || first_name.trim().length < 2) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    
    const phoneDigits = (phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }
    
    if (!zip || !/^\d{5}/.test(zip)) {
      return NextResponse.json({ error: 'Valid ZIP code is required' }, { status: 400 });
    }
    
    if (!consent) {
      return NextResponse.json({ error: 'Consent is required to proceed' }, { status: 400 });
    }

    const leadsCollection = await getCollection('leads');
    const advisorsCollection = await getCollection('advisors');

    // Create lead record
    const leadId = uuidv4();
    const lead = {
      id: leadId,
      created_at: new Date().toISOString(),
      first_name: first_name.trim(),
      phone: phone,
      phone_normalized: `+1${phoneDigits.slice(-10)}`,
      zip: zip,
      consent: true,
      source: 'benefitbuddy',
      answers: answers || {},
      assigned_advisor_id: null,
      status: 'new',
      call_status: null,
      sms_status: null,
      advisor_sms_status: null,
      lead_sms_status: null,
      updated_at: new Date().toISOString(),
    };

    // Insert lead
    await leadsCollection.insertOne(lead);

    // Find matching advisor by ZIP prefix
    let assignedAdvisor = null;
    const zipPrefix2 = zip.slice(0, 2);
    const zipPrefix3 = zip.slice(0, 3);

    // Try to find advisor matching ZIP prefix
    assignedAdvisor = await advisorsCollection.findOne({
      active: true,
      $or: [
        { zip_prefixes: { $elemMatch: { $in: [zipPrefix2, zipPrefix3, zip] } } },
      ],
    });

    // If no match, find default advisor
    if (!assignedAdvisor) {
      assignedAdvisor = await advisorsCollection.findOne({
        active: true,
        is_default: true,
      });
    }

    // If still no advisor, find any active advisor
    if (!assignedAdvisor) {
      assignedAdvisor = await advisorsCollection.findOne({ active: true });
    }

    // Update lead with assigned advisor
    if (assignedAdvisor) {
      await leadsCollection.updateOne(
        { id: leadId },
        {
          $set: {
            assigned_advisor_id: assignedAdvisor.id,
            status: 'assigned',
            updated_at: new Date().toISOString(),
          },
        }
      );

      // Send SMS to advisor
      const advisorSmsResult = await sendSmsToAdvisor(assignedAdvisor, lead);
      
      // Send SMS to lead
      const leadSmsResult = await sendSmsToLead(lead);

      // Update SMS statuses
      await leadsCollection.updateOne(
        { id: leadId },
        {
          $set: {
            advisor_sms_status: advisorSmsResult.success ? 'sent' : 'failed',
            advisor_sms_error: advisorSmsResult.error || null,
            advisor_sms_sid: advisorSmsResult.sid || null,
            lead_sms_status: leadSmsResult.success ? 'sent' : 'failed',
            lead_sms_error: leadSmsResult.error || null,
            lead_sms_sid: leadSmsResult.sid || null,
            updated_at: new Date().toISOString(),
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      lead_id: leadId,
      assigned_advisor: assignedAdvisor ? {
        id: assignedAdvisor.id,
        name: assignedAdvisor.name,
      } : null,
      status: assignedAdvisor ? 'assigned' : 'new',
    });

  } catch (error) {
    console.error('[Lead Create] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead', details: error.message },
      { status: 500 }
    );
  }
}

// GET - List leads (for admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');
    
    // Simple admin auth
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leadsCollection = await getCollection('leads');
    const leads = await leadsCollection
      .find({})
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('[Lead List] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
