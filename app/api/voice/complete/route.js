import twilio from 'twilio';
import { createTwiMLResponse } from '@/lib/twilioUtils';
import { getCollection } from '@/lib/db';

// Handle call completion/dial status
export async function POST(request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    const callSid = params.get('CallSid') || '';
    const dialCallStatus = params.get('DialCallStatus') || '';
    const dialCallDuration = params.get('DialCallDuration') || '0';
    
    console.log(`[Voice Complete] CallSid: ${callSid}, DialStatus: ${dialCallStatus}, Duration: ${dialCallDuration}`);
    
    // Update lead with transfer outcome
    const collection = await getCollection('phone_leads');
    await collection.updateOne(
      { call_sid: callSid },
      { 
        $set: { 
          transfer_status: dialCallStatus,
          transfer_duration: parseInt(dialCallDuration, 10),
          updated_at: new Date().toISOString(),
        }
      }
    );
    
    const response = new twilio.twiml.VoiceResponse();
    
    if (dialCallStatus === 'completed' || dialCallStatus === 'answered') {
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'Thank you for calling Benefit Buddy. Goodbye!'
      );
    } else if (dialCallStatus === 'busy' || dialCallStatus === 'no-answer' || dialCallStatus === 'failed') {
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'We were unable to connect your call at this time. A representative will call you back shortly. Thank you for calling Benefit Buddy. Goodbye!'
      );
    } else {
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'Thank you for calling. Goodbye!'
      );
    }
    
    response.hangup();
    
    return createTwiMLResponse(response.toString());
    
  } catch (error) {
    console.error('[Voice Complete] Error:', error);
    
    const response = new twilio.twiml.VoiceResponse();
    response.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      'Thank you for calling. Goodbye.'
    );
    response.hangup();
    
    return createTwiMLResponse(response.toString());
  }
}
