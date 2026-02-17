import twilio from 'twilio';
import { createTwiMLResponse } from '@/lib/twilioUtils';
import { getCollection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Main inbound voice handler - first touchpoint for callers
export async function POST(request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    const callSid = params.get('CallSid') || uuidv4();
    const from = params.get('From') || '';
    const to = params.get('To') || '';
    
    console.log(`[Voice Inbound] New call from ${from} to ${to}, CallSid: ${callSid}`);
    
    // Create initial call record
    const collection = await getCollection('phone_leads');
    const existingCall = await collection.findOne({ call_sid: callSid });
    
    if (!existingCall) {
      await collection.insertOne({
        id: uuidv4(),
        call_sid: callSid,
        phone: from,
        to_number: to,
        zip_code: null,
        service_type: null,
        callback_number: null,
        is_hot: false,
        speech_transcript: [],
        call_status: 'initiated',
        source: 'phone',
        call_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        sms_alert_sent: false,
        transferred: false,
      });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Build TwiML response
    const response = new twilio.twiml.VoiceResponse();
    
    // Friendly greeting
    response.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      'Hello! Welcome to Benefit Buddy. We help connect you with the services you need.'
    );
    
    response.pause({ length: 1 });
    
    // Gather ZIP code
    const gather = response.gather({
      input: ['speech', 'dtmf'],
      action: `${baseUrl}/api/voice/gather-zip`,
      method: 'POST',
      timeout: 5,
      speechTimeout: 'auto',
      numDigits: 5,
      hints: 'zip code, postal code, five digits',
    });
    
    gather.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      'To get started, please enter or say your 5-digit ZIP code.'
    );
    
    // If no input, prompt again
    response.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      "I didn't catch that. Let me try again."
    );
    response.redirect(`${baseUrl}/api/voice/inbound`);
    
    return createTwiMLResponse(response.toString());
    
  } catch (error) {
    console.error('[Voice Inbound] Error:', error);
    
    // Return error TwiML
    const response = new twilio.twiml.VoiceResponse();
    response.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      'We apologize, but we are experiencing technical difficulties. Please try again later. Goodbye.'
    );
    response.hangup();
    
    return createTwiMLResponse(response.toString());
  }
}

// Also handle GET for testing TwiML output
export async function GET(request) {
  const response = new twilio.twiml.VoiceResponse();
  
  response.say(
    { voice: 'Polly.Joanna', language: 'en-US' },
    'This is the Benefit Buddy voice webhook. It is working correctly.'
  );
  
  return createTwiMLResponse(response.toString());
}
