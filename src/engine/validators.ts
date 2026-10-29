/**
 * Input validators and extractors for UPI GUARD.
 * Implements strict length limits, format checking, and sensitive data checks.
 */

import { ExtractedIndicators } from '../types';

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
  warning?: string;
  hasSensitiveSecret?: boolean;
}

/**
 * Validates message text. Enforces maximum length and scans for accidental PIN/OTP input.
 */
export function validateMessage(text: string): ValidationResult {
  if (!text || typeof text !== 'string') {
    return { isValid: false, sanitized: '', error: 'Message input is empty.' };
  }
  const trimmed = text.trim();
  if (trimmed.length < 3) {
    return { isValid: false, sanitized: trimmed, error: 'Input is too short to evaluate (minimum 3 characters).' };
  }
  if (trimmed.length > 2000) {
    return { 
      isValid: true, 
      sanitized: trimmed.substring(0, 2000), 
      warning: 'Input exceeded 2000 characters and was truncated for safe processing.' 
    };
  }

  // Sensitive data check: warn if user pasted a clear OTP or PIN
  const containsExplicitOtpPin = /\b(my otp is|my pin is|password is)\s*[:=]?\s*(\d{4,6})\b/i.test(trimmed);
  if (containsExplicitOtpPin) {
    return {
      isValid: true,
      sanitized: trimmed,
      warning: 'CAUTION: You appear to have typed an authentication secret (PIN/OTP). UPI GUARD does not require authentication secrets. Never share your PIN or OTP with anyone.',
      hasSensitiveSecret: true
    };
  }

  return { isValid: true, sanitized: trimmed };
}

/**
 * Validates and normalises Indian phone numbers.
 * Accepts formats: 9876543210, +919876543210, 09876543210, 91-9876543210.
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone) return { isValid: false, sanitized: '', error: 'Phone number cannot be empty.' };
  
  // Strip spaces, hyphens, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Match standard Indian phone patterns
  const match = cleaned.match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  if (!match) {
    return {
      isValid: false,
      sanitized: cleaned,
      error: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g., 9876543210 or +919876543210).'
    };
  }

  const normalized = match[1]; // pure 10 digits
  return { isValid: true, sanitized: normalized };
}

/**
 * Validates and normalises UPI ID (Virtual Payment Address).
 * Standard format: username@bankhandle (e.g., merchant@oksbi, user@paytm).
 */
export function validateUpiId(vpa: string): ValidationResult {
  if (!vpa) return { isValid: false, sanitized: '', error: 'UPI ID cannot be empty.' };
  const trimmed = vpa.trim().toLowerCase();
  
  // RFC UPI format standard: [a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32}
  const upiRegex = /^[a-z0-9.\-_]{2,64}@[a-z0-9]{2,32}$/;
  if (!upiRegex.test(trimmed)) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: 'Invalid UPI ID format. A valid UPI ID follows format: username@bankhandle (e.g., rahul@okhdfcbank or 9876543210@paytm).'
    };
  }

  return { isValid: true, sanitized: trimmed };
}

/**
 * Validates and normalises URLs without fetching them.
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) return { isValid: false, sanitized: '', error: 'URL cannot be empty.' };
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'http://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return { isValid: false, sanitized: url, error: 'Invalid URL hostname.' };
    }
    return { isValid: true, sanitized: parsed.href };
  } catch {
    return { isValid: false, sanitized: url, error: 'Malformed URL provided.' };
  }
}

/**
 * Extracts indicators (phones, UPI IDs, URLs, amounts, keywords) from arbitrary text.
 */
export function extractIndicators(text: string): ExtractedIndicators {
  if (!text) {
    return {
      phones: [],
      upiIds: [],
      urls: [],
      amounts: [],
      keywords: [],
      hasCollectRequest: false,
      hasQrMention: false,
      hasPinOtpMention: false,
      hasUrgency: false,
      hasRemoteAppMention: false
    };
  }

  // 1. Phone numbers
  const phoneRegex = /(?:(?:\+?91|0)[ -]?)?([6-9]\d{9})\b/g;
  const phones: string[] = [];
  let phoneMatch;
  while ((phoneMatch = phoneRegex.exec(text)) !== null) {
    if (!phones.includes(phoneMatch[1])) {
      phones.push(phoneMatch[1]);
    }
  }

  // 2. UPI IDs (e.g. user@oksbi, merchant@paytm)
  const upiRegex = /\b([a-zA-Z0-9.\-_]{2,64}@(?!gmail|yahoo|outlook|hotmail|email|icloud)[a-zA-Z0-9]{2,32})\b/gi;
  const upiIds: string[] = [];
  let upiMatch;
  while ((upiMatch = upiRegex.exec(text)) !== null) {
    const lower = upiMatch[1].toLowerCase();
    if (!upiIds.includes(lower)) {
      upiIds.push(lower);
    }
  }

  // 3. URLs and Shorteners (with or without http/https)
  const urlRegex = /\b(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`\[\]]+|\b(?:bit\.ly|tinyurl\.com|cutt\.ly|is\.gd|t\.co|rb\.gy)\/[a-zA-Z0-9_\-]+|\b[a-zA-Z0-9-]+\.(?:online|xyz|top|site|click|club|link|live|cam|work|app)(?:\/[^\s]*)?/gi;
  const urls: string[] = [];
  let urlMatch;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    let cleanUrl = urlMatch[0];
    if (!urls.includes(cleanUrl)) {
      urls.push(cleanUrl);
    }
  }

  // 4. Amounts (e.g. Rs. 500, ₹ 25,000, INR 1000)
  const amountRegex = /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/gi;
  const amounts: number[] = [];
  let amtMatch;
  while ((amtMatch = amountRegex.exec(text)) !== null) {
    const num = parseFloat(amtMatch[1].replace(/,/g, ''));
    if (!isNaN(num) && !amounts.includes(num)) {
      amounts.push(num);
    }
  }

  // 5. Context flags
  const lower = text.toLowerCase();
  const hasCollectRequest = /\b(collect request|approve request|pay request|authorize request|mandate|auto-debit)\b/i.test(lower);
  const hasQrMention = /\b(qr|qr code|scan qr|scan code|barcode)\b/i.test(lower);
  const hasPinOtpMention = /\b(upi pin|pin|otp|one time password|mpin|cvv|password)\b/i.test(lower);
  const hasUrgency = /\b(immediately|within 10 minutes|within 24 hours|urgent|blocked|suspended|electricity disconnected|power cut|police case|arrest|fir|legal notice|deadline|account freeze)\b/i.test(lower);
  const hasRemoteAppMention = /\b(anydesk|teamviewer|quicksupport|rustdesk|screen share|remote access|download apk|install apk)\b/i.test(lower);

  return {
    phones,
    upiIds,
    urls,
    amounts,
    keywords: [],
    hasCollectRequest,
    hasQrMention,
    hasPinOtpMention,
    hasUrgency,
    hasRemoteAppMention
  };
}
