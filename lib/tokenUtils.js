import crypto from 'crypto';

const SECRET = process.env.LEAD_RECEIPT_SECRET || process.env.ADMIN_KEY || 'default-secret-change-me';

/**
 * Generate a signed receipt token for agent lead access
 * @param {string} leadId - The lead ID
 * @param {string} agentId - The agent ID
 * @param {string} createdAt - The lead creation timestamp
 * @returns {string} - The HMAC signature token
 */
export function generateReceiptToken(leadId, agentId, createdAt) {
  const data = `${leadId}:${agentId}:${createdAt}`;
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(data);
  return hmac.digest('hex');
}

/**
 * Verify a receipt token
 * @param {string} token - The token to verify
 * @param {string} leadId - The lead ID
 * @param {string} agentId - The agent ID
 * @param {string} createdAt - The lead creation timestamp
 * @returns {boolean} - Whether the token is valid
 */
export function verifyReceiptToken(token, leadId, agentId, createdAt) {
  const expectedToken = generateReceiptToken(leadId, agentId, createdAt);
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Generate a full receipt URL for an agent to access a lead
 * @param {object} lead - The lead object with id, assigned_agent, created_at
 * @param {string} baseUrl - The base URL of the application
 * @returns {string|null} - The full receipt URL or null if no agent assigned
 */
export function generateReceiptUrl(lead, baseUrl) {
  if (!lead.assigned_agent?.id) return null;
  
  const token = generateReceiptToken(
    lead.id,
    lead.assigned_agent.id,
    lead.created_at
  );
  
  return `${baseUrl}/agent/lead/${lead.id}?token=${token}`;
}
