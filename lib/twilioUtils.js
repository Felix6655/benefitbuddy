import twilio from 'twilio';

// Initialize Twilio client (lazy - only when needed for SMS)
let twilioClient = null;

export function getTwilioClient() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
}

// Create TwiML response helper
export function createTwiMLResponse(twiml) {
  return new Response(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

// Validate Twilio webhook signature (optional security layer)
export function validateTwilioSignature(request, body, url) {
  const signature = request.headers.get('X-Twilio-Signature') || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!authToken) {
    console.warn('TWILIO_AUTH_TOKEN not set - skipping signature validation');
    return true; // Allow in development
  }
  
  // Use Twilio's built-in validation
  return twilio.validateRequest(authToken, signature, url, Object.fromEntries(new URLSearchParams(body)));
}

// Send SMS notification
export async function sendSmsAlert(to, message) {
  const client = getTwilioClient();
  
  if (!client) {
    console.error('Twilio client not configured - missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
    return { success: false, error: 'Twilio not configured' };
  }
  
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    console.error('TWILIO_PHONE_NUMBER not set');
    return { success: false, error: 'Twilio phone number not configured' };
  }
  
  try {
    const sms = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    
    console.log('SMS sent:', sms.sid);
    return { success: true, sid: sms.sid };
  } catch (error) {
    console.error('SMS send error:', error.message);
    return { success: false, error: error.message };
  }
}

// Service type mapping
export const SERVICE_TYPES = {
  '1': 'plumbing',
  '2': 'funding',
  '3': 'car_help',
  'plumbing': 'plumbing',
  'funding': 'funding',
  'car': 'car_help',
  'car help': 'car_help',
};

// Parse speech input for service type
export function parseServiceType(input) {
  if (!input) return null;
  
  const normalized = input.toLowerCase().trim();
  
  // Direct match from DTMF
  if (SERVICE_TYPES[normalized]) {
    return SERVICE_TYPES[normalized];
  }
  
  // Speech recognition matching
  if (normalized.includes('plumb') || normalized.includes('pipe') || normalized.includes('leak') || normalized.includes('one') || normalized === '1') {
    return 'plumbing';
  }
  if (normalized.includes('fund') || normalized.includes('money') || normalized.includes('loan') || normalized.includes('two') || normalized === '2') {
    return 'funding';
  }
  if (normalized.includes('car') || normalized.includes('auto') || normalized.includes('vehicle') || normalized.includes('three') || normalized === '3') {
    return 'car_help';
  }
  
  return null;
}

// Check if lead qualifies as HOT (urgent)
export function isHotLead(serviceType, speechInput) {
  if (!speechInput) return false;
  
  const urgentKeywords = ['urgent', 'emergency', 'asap', 'right now', 'immediately', 'today', 'help now'];
  const normalized = speechInput.toLowerCase();
  
  return urgentKeywords.some(keyword => normalized.includes(keyword));
}
