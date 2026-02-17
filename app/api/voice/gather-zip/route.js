import twilio from 'twilio';
import { createTwiMLResponse } from '@/lib/twilioUtils';
import { getCollection } from '@/lib/db';

// Handle ZIP code input
export async function POST(request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    const callSid = params.get('CallSid') || '';
    const digits = params.get('Digits') || '';
    const speechResult = params.get('SpeechResult') || '';
    
    // Extract ZIP code from either DTMF or speech
    let zipCode = digits || speechResult.replace(/\D/g, '').slice(0, 5);
    
    console.log(`[Gather ZIP] CallSid: ${callSid}, Digits: ${digits}, Speech: ${speechResult}, Extracted ZIP: ${zipCode}`);
    
    // Validate ZIP code (must be 5 digits)
    const isValidZip = /^\d{5}$/.test(zipCode);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = new twilio.twiml.VoiceResponse();
    
    if (isValidZip) {
      // Save ZIP to database
      const collection = await getCollection('phone_leads');
      await collection.updateOne(
        { call_sid: callSid },
        { 
          $set: { 
            zip_code: zipCode,
            updated_at: new Date().toISOString(),
          },
          $push: {
            speech_transcript: {
              step: 'zip_code',
              input: speechResult || digits,
              parsed: zipCode,
              timestamp: new Date().toISOString(),
            }
          }
        }
      );
      
      // Confirm and proceed to service selection
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        `Got it! Your ZIP code is ${zipCode.split('').join(' ')}.`
      );
      
      response.pause({ length: 1 });
      
      // Gather service type
      const gather = response.gather({
        input: ['speech', 'dtmf'],
        action: `${baseUrl}/api/voice/gather-service`,
        method: 'POST',
        timeout: 5,
        speechTimeout: 'auto',
        numDigits: 1,
        hints: 'plumbing, funding, car help, one, two, three',
      });
      
      gather.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'What type of service do you need? Press 1 or say plumbing. Press 2 or say funding. Press 3 or say car help.'
      );
      
      // If no input, repeat
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        "I didn't hear your selection. Let me repeat."
      );
      response.redirect(`${baseUrl}/api/voice/gather-zip?retry=service`);
      
    } else {
      // Invalid ZIP - ask again
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        "I'm sorry, I didn't get a valid 5-digit ZIP code."
      );
      
      const gather = response.gather({
        input: ['speech', 'dtmf'],
        action: `${baseUrl}/api/voice/gather-zip`,
        method: 'POST',
        timeout: 5,
        speechTimeout: 'auto',
        numDigits: 5,
      });
      
      gather.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'Please enter or say your 5-digit ZIP code again.'
      );
      
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'We are unable to process your request without a valid ZIP code. Goodbye.'
      );
      response.hangup();
    }
    
    return createTwiMLResponse(response.toString());
    
  } catch (error) {
    console.error('[Gather ZIP] Error:', error);
    
    const response = new twilio.twiml.VoiceResponse();
    response.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      'We apologize for the technical difficulty. Please try again later. Goodbye.'
    );
    response.hangup();
    
    return createTwiMLResponse(response.toString());
  }
}
