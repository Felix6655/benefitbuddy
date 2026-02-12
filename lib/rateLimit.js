// Simple in-memory rate limiter for MVP
const rateLimitMap = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10; // 10 requests per window

export function rateLimit(ip) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  
  // Clean old entries
  for (const [key, data] of rateLimitMap.entries()) {
    if (data.timestamp < windowStart) {
      rateLimitMap.delete(key);
    }
  }
  
  const current = rateLimitMap.get(ip);
  
  if (!current) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  
  if (current.timestamp < windowStart) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  
  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  current.count++;
  return { allowed: true, remaining: MAX_REQUESTS - current.count };
}
