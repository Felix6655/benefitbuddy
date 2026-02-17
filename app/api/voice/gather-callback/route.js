import twilio from 'twilio';
import { createTwiMLResponse, sendSmsAlert } from '@/lib/twilioUtils';
import { getCollection } from '@/lib/db';

// Handle callback number input and complete the lead
export async function POST(request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const url = new URL(request.url);
    
    const callSid = params.get('CallSid') || '';
    const digits = params.get('Digits') || '';
    const speechResult = params.get('SpeechResult') || '';
    const callerNumber = params.get('From') || '';
    const useCaller = url.searchParams.get('use_caller') === 'true';
    
    // Extract callback number from input or use caller's number
    let callbackNumber = digits || speechResult.replace(/\D/g, '');
    
    // If no valid number provided and use_caller flag is set, use caller's phone
    if ((!callbackNumber || callbackNumber.length < 10) && useCaller && callerNumber) {
      callbackNumber = callerNumber.replace(/\D/g, '').slice(-10);
    }
    
    console.log(`[Gather Callback] CallSid: ${callSid}, Digits: ${digits}, Speech: ${speechResult}, Callback: ${callbackNumber}, UseCaller: ${useCaller}`);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = new twilio.twiml.VoiceResponse();
    
    // Get current lead data
    const collection = await getCollection('phone_leads');
    const lead = await collection.findOne({ call_sid: callSid });
    
    // Validate callback number
    const hasValidCallback = callbackNumber && callbackNumber.length >= 10;
    const finalCallback = hasValidCallback ? callbackNumber.slice(-10) : (callerNumber.replace(/\D/g, '').slice(-10) || null);
    
    // Update lead with callback number and mark as complete
    await collection.updateOne(
      { call_sid: callSid },
      { 
        $set: { 
          callback_number: finalCallback,
          call_status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        $push: {
          speech_transcript: {
            step: 'callback_number',
            input: speechResult || digits,
            parsed: finalCallback,
            used_caller: !hasValidCallback,
            timestamp: new Date().toISOString(),
          }
        }
      }
    );
    
    // Reload lead with updated data
    const updatedLead = await collection.findOne({ call_sid: callSid });
    
    // Send SMS alert to admin
    const adminPhone = process.env.ADMIN_ALERT_PHONE;
    if (adminPhone) {
      const serviceNames = {
        'plumbing': 'Plumbing',
        'funding': 'Funding',
        'car_help': 'Car Help',
        'general': 'General',
      };
      
      const alertMessage = `🔔 NEW PHONE LEAD!\n\n` +
        `📞 Phone: ${updatedLead?.phone || callerNumber}\n` +
        `📍 ZIP: ${updatedLead?.zip_code || 'N/A'}\n` +
        `🔧 Service: ${serviceNames[updatedLead?.service_type] || updatedLead?.service_type || 'N/A'}\n` +
        `📱 Callback: ${finalCallback || 'N/A'}\n` +
        `${updatedLead?.is_hot ? '🔥 HOT LEAD - URGENT!' : ''}\n` +
        `⏰ ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`;
      
      const smsResult = await sendSmsAlert(adminPhone, alertMessage);
      
      // Update SMS delivery status
      await collection.updateOne(
        { call_sid: callSid },
        { 
          $set: { 
            sms_alert_sent: smsResult.success,
            sms_alert_sid: smsResult.sid || null,
            sms_alert_error: smsResult.error || null,
          }
        }
      );
      
      console.log(`[Gather Callback] SMS alert result:`, smsResult);
    }
    
    // Confirm to caller
    response.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      'Thank you! We have received your information.'
    );
    
    response.pause({ length: 1 });
    
    // Check if this is a HOT lead and should be transferred
    const shouldTransfer = updatedLead?.is_hot && adminPhone;
    
    if (shouldTransfer) {
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'Since this is an urgent request, let me connect you with someone right away. Please hold.'
      );
      
      // Update transfer status
      await collection.updateOne(
        { call_sid: callSid },
        { $set: { transferred: true, transferred_to: adminPhone } }
      );
      
      // Transfer the call using Dial
      const dial = response.dial({
        action: `${baseUrl}/api/voice/complete`,
        method: 'POST',
        timeout: 30,
        callerId: process.env.TWILIO_PHONE_NUMBER,
      });
      
      dial.number(adminPhone);
      
      // If transfer fails, provide fallback message
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'We were unable to connect you right now. A representative will call you back shortly at the number you provided.'
      );
      
    } else {
      // Standard closing
      response.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'A representative will contact you shortly at the number you provided. Thank you for calling Benefit Buddy. Goodbye!'
      );
    }
    
    response.hangup();
    
    return createTwiMLResponse(response.toString());
    
  } catch (error) {
    console.error('[Gather Callback] Error:', error);
    
    const response = new twilio.twiml.VoiceResponse();
    response.say(
      { voice: 'Polly.Joanna', language: 'en-US' },
      'Thank you for calling. A representative will be in touch. Goodbye.'
    );
    response.hangup();
    
    return createTwiMLResponse(response.toString());
  }
}
