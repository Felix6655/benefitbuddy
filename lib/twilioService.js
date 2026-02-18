import twilio from 'twilio';

// Initialize Twilio client (lazy)
let twilioClient = null;

function getTwilioClient() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
}

/**
 * Send SMS notification to advisor when a new lead is assigned
 */
export async function sendSmsToAdvisor(advisor, lead) {
  const client = getTwilioClient();
  
  if (!client) {
    console.log('[Twilio] Client not configured - skipping advisor SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    console.log('[Twilio] TWILIO_PHONE_NUMBER not set');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  if (!advisor?.phone) {
    console.log('[Twilio] Advisor has no phone number');
    return { success: false, error: 'Advisor has no phone number' };
  }

  // Normalize advisor phone
  const advisorPhone = advisor.phone.replace(/\D/g, '');
  const toNumber = advisorPhone.startsWith('1') ? `+${advisorPhone}` : `+1${advisorPhone}`;

  const message = `🔔 BenefitBuddy Lead!\n\n` +
    `Name: ${lead.first_name}\n` +
    `ZIP: ${lead.zip}\n` +
    `Phone: ${lead.phone}\n` +
    `Lead ID: ${lead.id.slice(0, 8)}...\n\n` +
    `Please contact them soon!`;

  try {
    const sms = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });
    console.log(`[Twilio] Advisor SMS sent: ${sms.sid}`);
    return { success: true, sid: sms.sid };
  } catch (error) {
    console.error('[Twilio] Advisor SMS error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send confirmation SMS to lead
 */
export async function sendSmsToLead(lead) {
  const client = getTwilioClient();
  
  if (!client) {
    console.log('[Twilio] Client not configured - skipping lead SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    console.log('[Twilio] TWILIO_PHONE_NUMBER not set');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  if (!lead?.phone_normalized) {
    console.log('[Twilio] Lead has no normalized phone');
    return { success: false, error: 'Lead has no phone number' };
  }

  const message = `BenefitBuddy: We received your request, ${lead.first_name}! ` +
    `A licensed advisor may contact you soon to help with your benefits. ` +
    `This is a free service with no obligation. Reply STOP to opt out.`;

  try {
    const sms = await client.messages.create({
      body: message,
      from: fromNumber,
      to: lead.phone_normalized,
    });
    console.log(`[Twilio] Lead SMS sent: ${sms.sid}`);
    return { success: true, sid: sms.sid };
  } catch (error) {
    console.error('[Twilio] Lead SMS error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send custom SMS
 */
export async function sendSms(to, message) {
  const client = getTwilioClient();
  
  if (!client) {
    return { success: false, error: 'Twilio not configured' };
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    return { success: false, error: 'Twilio phone number not configured' };
  }

  // Normalize phone number
  const digits = to.replace(/\D/g, '');
  const toNumber = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

  try {
    const sms = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });
    return { success: true, sid: sms.sid };
  } catch (error) {
    console.error('[Twilio] SMS error:', error.message);
    return { success: false, error: error.message };
  }
}
