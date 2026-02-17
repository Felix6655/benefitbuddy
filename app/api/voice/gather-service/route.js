import twilio from 'twilio';
import { createTwiMLResponse, parseServiceType, isHotLead } from '@/lib/twilioUtils';
import { getCollection } from '@/lib/db';

// Handle service type input
export async function POST(request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    const callSid = params.get('CallSid') || '';
    const digits = params.get('Digits') || '';
    const speechResult = params.get('SpeechResult') || '';
    
    // Parse service type from input
    const input = digits || speechResult;
    const serviceType = parseServiceType(input);
    const isHot = isHotLead(serviceType, speechResult);
    
    console.log(`[Gather Service] CallSid: ${callSid}, Digits: ${digits}, Speech: ${speechResult}, Service: ${serviceType}, Hot: ${isHot}`);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = new twilio.twiml.VoiceResponse();
    
    if (serviceType) {
      // Save service type to database
      const collection = await getCollection('phone_leads');
      await collection.updateOne(
        { call_sid: callSid },
        { 
          $set: { 
            service_type: serviceType,
            is_hot: isHot,
            updated_at: new Date().toISOString(),
          },
          $push: {
            speech_transcript: {
              step: 'service_type',
              input: input,
              parsed: serviceType,
              is_hot: isHot,
              timestamp: new Date().toISOString(),
            }
          }
        }
      );
      
      // Friendly service name
      const serviceNames = {
        'plumbing': 'plumbing services',
        'funding': 'funding assistance',
        'car_help': 'car help services',
      };
      
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        `Great! You selected ${serviceNames[serviceType] || serviceType}.`
      );
      
      response.pause({ length: 1 });
      
      // Gather callback number
      const gather = response.gather({
        input: ['speech', 'dtmf'],
        action: `${baseUrl}/api/voice/gather-callback`,
        method: 'POST',
        timeout: 8,
        speechTimeout: 'auto',
        numDigits: 10,
        hints: 'phone number, ten digits',
      });
      
      gather.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'Now, please enter or say the best 10-digit phone number to reach you.'
      );
      
      // If no input, use caller's number
      response.redirect(`${baseUrl}/api/voice/gather-callback?use_caller=true`);
      
    } else {
      // Invalid service - ask again
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        "I'm sorry, I didn't understand your selection."
      );
      
      const gather = response.gather({
        input: ['speech', 'dtmf'],
        action: `${baseUrl}/api/voice/gather-service`,
        method: 'POST',
        timeout: 5,
        speechTimeout: 'auto',
        numDigits: 1,
      });
      
      gather.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'Please press 1 for plumbing, 2 for funding, or 3 for car help.'
      );
      
      // Default to first option if still no valid input
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        "No worries, I'll connect you with a general representative."
      );
      
      // Save as 'general' and continue
      const collection = await getCollection('phone_leads');
      await collection.updateOne(
        { call_sid: callSid },
        { 
          $set: { 
            service_type: 'general',
            updated_at: new Date().toISOString(),
          }
        }
      );
      
      response.redirect(`${baseUrl}/api/voice/gather-callback?use_caller=true`);
    }
    
    return createTwiMLResponse(response.toString());
    
  } catch (error) {
    console.error('[Gather Service] Error:', error);
    
    const response = new twilio.twiml.VoiceResponse();
    response.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      'We apologize for the technical difficulty. Please try again later. Goodbye.'
    );
    response.hangup();
    
    return createTwiMLResponse(response.toString());
  }
}
