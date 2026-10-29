/**
 * Official Data Source Provider Interface and Documentation for UPI GUARD.
 * Evaluates external integration capabilities with national cybersecurity portals
 * including the Indian Cyber Crime Coordination Centre (I4C) and National Cyber Crime
 * Reporting Portal (NCCRP at cybercrime.gov.in).
 */

import { OfficialProviderStatus } from '../types';

export const OFFICIAL_PROVIDER_INFO: OfficialProviderStatus = {
  providerName: 'National Cyber Crime Reporting Portal (I4C / MHA)',
  portalUrl: 'https://cybercrime.gov.in',
  authorizedApiAvailable: false,
  authStatusReason: 'Public automated API not offered for third-party client applications. The public "Suspect Repository / Citizen Search" requires interactive browser session and CAPTCHA validation. Per compliance guidelines, automated scraping or bypassing CAPTCHAs is prohibited.',
  lastChecked: '2026-10-29T06:20:00Z',
  manualVerificationUrl: 'https://cybercrime.gov.in/Webform/chkSuspect.aspx',
  helpline: '1930 (Toll-Free National Cyber Financial Fraud Helpline)',
  instructions: [
    'To check if a suspect number/UPI/account has been reported nationally, open the official portal at cybercrime.gov.in.',
    'Navigate to "Check Suspect" under Citizen Services.',
    'Enter the mobile number, UPI ID, or bank account and complete the CAPTCHA.',
    'For emergency financial fraud intervention within the "Golden Hour" (< 2 hours of incident), dial 1930 immediately to freeze fraudulent money movement across banks.'
  ]
};

export interface ExternalCheckResult {
  provider: string;
  isAvailable: boolean;
  statusNotice: string;
  manualUrl: string;
  helpline: string;
  timestamp: string;
}

export function queryOfficialProviderStatus(): ExternalCheckResult {
  return {
    provider: OFFICIAL_PROVIDER_INFO.providerName,
    isAvailable: OFFICIAL_PROVIDER_INFO.authorizedApiAvailable,
    statusNotice: OFFICIAL_PROVIDER_INFO.authStatusReason,
    manualUrl: OFFICIAL_PROVIDER_INFO.manualVerificationUrl,
    helpline: OFFICIAL_PROVIDER_INFO.helpline,
    timestamp: new Date().toISOString()
  };
}
