/**
 * Local Investigation Database for UPI GUARD.
 * Contains structured, clearly labelled FICTIONAL and DEMONSTRATION records.
 * Provides exact lookup, normalisation, stale record detection, and duplicate collation.
 *
 * NOTE: All records are simulated for educational evaluation and do not represent real individuals.
 */

import { DatabaseRecord } from '../types';

export const DEMO_DATABASE_RECORDS: DatabaseRecord[] = [
  // Phone numbers (Fictional 10-digit Indian test ranges)
  {
    id: 'REC-PH-001',
    identifierType: 'phone',
    normalizedIdentifier: '9876543210',
    displayIdentifier: '+91 98765 43210',
    category: 'ELECTRICITY_DISCONNECTION',
    reportDate: '2026-10-15',
    source: 'Simulated State Discom Consumer Forum',
    verificationStatus: 'SIMULATED_DEMO',
    evidenceDescription: 'Simulated phone number used in fake electricity power cutoff SMS claiming bill overdue.',
    reportedCasesCount: 142,
    lastUpdated: '2026-10-25T14:30:00Z',
    confidence: 0.88,
    limitations: 'Simulated demonstration record. External police verification not attached.',
    tags: ['electricity', 'sms-phishing', 'urgent-threat']
  },
  {
    id: 'REC-PH-002',
    identifierType: 'phone',
    normalizedIdentifier: '9123456780',
    displayIdentifier: '+91 91234 56780',
    category: 'REMOTE_ACCESS_APP',
    reportDate: '2026-09-02',
    source: 'Demonstration Citizen Portal Feed',
    verificationStatus: 'USER_REPORTED_UNVERIFIED',
    evidenceDescription: 'Multiple victims reported caller claiming to be bank support requesting AnyDesk install.',
    reportedCasesCount: 18,
    lastUpdated: '2026-09-10T11:00:00Z',
    confidence: 0.65,
    limitations: 'User-reported crowd report. Not legally adjudicated. Identifier may be spoofed.',
    tags: ['anydesk', 'bank-support', 'call-scam']
  },
  {
    id: 'REC-PH-003',
    identifierType: 'phone',
    normalizedIdentifier: '9988776655',
    displayIdentifier: '+91 99887 76655',
    category: 'COURIER_CUSTOMS_SCAM',
    reportDate: '2026-10-20',
    source: 'Simulated Cyber Police Incident Sample',
    verificationStatus: 'VERIFIED_SCAM',
    evidenceDescription: 'Impersonated international parcel customs agent demanding clearance payment.',
    reportedCasesCount: 79,
    lastUpdated: '2026-10-28T09:15:00Z',
    confidence: 0.95,
    limitations: 'Verified in simulated test dataset. Does not verify live SIM ownership.',
    tags: ['customs', 'courier', 'extortion']
  },
  {
    id: 'REC-PH-004',
    identifierType: 'phone',
    normalizedIdentifier: '9000011111',
    displayIdentifier: '+91 90000 11111',
    category: 'LOTTERY_CASHBACK',
    reportDate: '2025-01-10', // Stale record (> 1 year old)
    source: 'Archived Demonstration Ledger',
    verificationStatus: 'USER_REPORTED_UNVERIFIED',
    evidenceDescription: 'KBC lottery lucky draw SMS sender reported in early 2025.',
    reportedCasesCount: 5,
    lastUpdated: '2025-01-15T08:00:00Z',
    confidence: 0.40,
    limitations: 'STALE RECORD: More than 180 days old. Phone number may have been re-allocated by telecom provider.',
    tags: ['stale', 'lottery', 'kbc']
  },

  // UPI IDs (VPAs)
  {
    id: 'REC-UPI-001',
    identifierType: 'upi_id',
    normalizedIdentifier: 'refund.desk.sbi@ybl',
    displayIdentifier: 'refund.desk.sbi@ybl',
    category: 'IMPERSONATION',
    reportDate: '2026-10-18',
    source: 'Demonstration Payment Safety Registry',
    verificationStatus: 'VERIFIED_SCAM',
    evidenceDescription: 'Lookalike VPA mimicking official SBI refund desk on third-party handle (@ybl).',
    reportedCasesCount: 88,
    lastUpdated: '2026-10-26T16:00:00Z',
    confidence: 0.92,
    limitations: 'Verified demonstration entry. Official SBI handles use @oksbi, @sbi, or authorized suffixes.',
    tags: ['lookalike-vpa', 'fake-refund', 'impersonation']
  },
  {
    id: 'REC-UPI-002',
    identifierType: 'upi_id',
    normalizedIdentifier: 'olx.buyer.safe@paytm',
    displayIdentifier: 'olx.buyer.safe@paytm',
    category: 'QR_COLLECT_FRAUD',
    reportDate: '2026-10-05',
    source: 'Demonstration Marketplace Fraud Feed',
    verificationStatus: 'USER_REPORTED_UNVERIFIED',
    evidenceDescription: 'Associated with OLX fake buyer collect requests instructing sellers to authorize.',
    reportedCasesCount: 34,
    lastUpdated: '2026-10-14T12:00:00Z',
    confidence: 0.75,
    limitations: 'User-reported crowd entry. Account may have been mule account or compromised.',
    tags: ['olx', 'marketplace', 'reverse-collect']
  },
  {
    id: 'REC-UPI-003',
    identifierType: 'upi_id',
    normalizedIdentifier: 'rewards.cashback2026@oksbi',
    displayIdentifier: 'rewards.cashback2026@oksbi',
    category: 'LOTTERY_CASHBACK',
    reportDate: '2026-10-22',
    source: 'Simulated Fintech Threat Feed',
    verificationStatus: 'VERIFIED_SCAM',
    evidenceDescription: 'Collect request generator claiming to distribute 2026 Diwali cashbacks.',
    reportedCasesCount: 112,
    lastUpdated: '2026-10-27T10:00:00Z',
    confidence: 0.94,
    limitations: 'Demonstration record for educational testing.',
    tags: ['cashback', 'collect-request', 'festival']
  },
  {
    id: 'REC-UPI-004',
    identifierType: 'upi_id',
    normalizedIdentifier: 'test.scammer@axis',
    displayIdentifier: 'test.scammer@axis',
    category: 'PIN_HARVESTING',
    reportDate: '2026-10-01',
    source: 'Benchmark Validation Suite',
    verificationStatus: 'SIMULATED_DEMO',
    evidenceDescription: 'Benchmark fixture identifier used to validate deterministic rule evaluation.',
    reportedCasesCount: 42,
    lastUpdated: '2026-10-01T00:00:00Z',
    confidence: 1.0,
    limitations: 'Pure synthetic test fixture for test scenario assertions.',
    tags: ['test-fixture', 'benchmark']
  },

  // URLs / Domains
  {
    id: 'REC-URL-001',
    identifierType: 'url',
    normalizedIdentifier: 'sbi-kyc-verification.online',
    displayIdentifier: 'https://sbi-kyc-verification.online',
    category: 'SUSPICIOUS_DOMAIN',
    reportDate: '2026-10-12',
    source: 'Demonstration Domain Reputation Feed',
    verificationStatus: 'VERIFIED_SCAM',
    evidenceDescription: 'Phishing portal mimicking SBI internet banking login with credential harvesting form.',
    reportedCasesCount: 64,
    lastUpdated: '2026-10-24T18:20:00Z',
    confidence: 0.96,
    limitations: 'Registered under high-risk generic TLD. Domain may be taken down or sinkholed.',
    tags: ['phishing', 'lookalike-domain', 'credential-theft']
  },
  {
    id: 'REC-URL-002',
    identifierType: 'url',
    normalizedIdentifier: 'bit.ly/electricity-bill-pay-today',
    displayIdentifier: 'https://bit.ly/electricity-bill-pay-today',
    category: 'ELECTRICITY_DISCONNECTION',
    reportDate: '2026-10-17',
    source: 'Simulated Discom Alert Registry',
    verificationStatus: 'SIMULATED_DEMO',
    evidenceDescription: 'Shortened link in SMS routing victims to rogue APK download for remote access.',
    reportedCasesCount: 23,
    lastUpdated: '2026-10-21T09:00:00Z',
    confidence: 0.85,
    limitations: 'URL shortener. Destination target can change dynamically.',
    tags: ['url-shortener', 'apk-dropper', 'electricity']
  },
  {
    id: 'REC-URL-003',
    identifierType: 'url',
    normalizedIdentifier: 'claim-gpay-reward-500.top',
    displayIdentifier: 'https://claim-gpay-reward-500.top',
    category: 'LOTTERY_CASHBACK',
    reportDate: '2026-10-08',
    source: 'Demonstration Phishing Feed',
    verificationStatus: 'VERIFIED_SCAM',
    evidenceDescription: 'Scratch card phishing page prompting user to tap "Send to Bank" triggering collect request.',
    reportedCasesCount: 51,
    lastUpdated: '2026-10-23T11:45:00Z',
    confidence: 0.90,
    limitations: 'Demonstration record for student prototype evaluation.',
    tags: ['scratch-card', 'fake-gpay', 'collect-trigger']
  }
];

export interface SearchMatchDetail {
  record: DatabaseRecord;
  matchedOn: string;
  isStale: boolean;
  stalenessMessage?: string;
  confidenceInterpretation: string;
  evidenceLimitations: string;
}

export class InvestigationDatabase {
  private records: DatabaseRecord[];

  constructor(initialRecords: DatabaseRecord[] = DEMO_DATABASE_RECORDS) {
    this.records = [...initialRecords];
  }

  /**
   * Search database for any matching phone numbers, UPI IDs, or URLs.
   */
  public searchIndicators(indicators: { phones?: string[]; upiIds?: string[]; urls?: string[] }): SearchMatchDetail[] {
    const results: SearchMatchDetail[] = [];
    const now = new Date();

    // Check phones
    if (indicators.phones) {
      for (const phone of indicators.phones) {
        const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '').slice(-10);
        const matches = this.records.filter(r => r.identifierType === 'phone' && r.normalizedIdentifier === cleanPhone);
        matches.forEach(m => results.push(this.formatMatchDetail(m, `Phone: ${phone}`, now)));
      }
    }

    // Check UPI IDs
    if (indicators.upiIds) {
      for (const vpa of indicators.upiIds) {
        const cleanVpa = vpa.trim().toLowerCase();
        const matches = this.records.filter(r => r.identifierType === 'upi_id' && r.normalizedIdentifier === cleanVpa);
        matches.forEach(m => results.push(this.formatMatchDetail(m, `UPI ID: ${vpa}`, now)));
      }
    }

    // Check URLs
    if (indicators.urls) {
      for (const url of indicators.urls) {
        let domain = url.toLowerCase();
        try {
          const parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
          domain = parsed.hostname;
          // Also check shortener path if present (e.g. bit.ly/xxx)
          const shortUrl = `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, '');
          const matches = this.records.filter(r => {
            if (r.identifierType !== 'url') return false;
            return r.normalizedIdentifier.toLowerCase() === domain || 
                   r.normalizedIdentifier.toLowerCase() === shortUrl ||
                   domain.endsWith('.' + r.normalizedIdentifier.toLowerCase());
          });
          matches.forEach(m => results.push(this.formatMatchDetail(m, `URL: ${url}`, now)));
        } catch {
          // ignore invalid url
        }
      }
    }

    // Deduplicate matches by record ID
    const uniqueMap = new Map<string, SearchMatchDetail>();
    for (const res of results) {
      if (!uniqueMap.has(res.record.id)) {
        uniqueMap.set(res.record.id, res);
      }
    }

    return Array.from(uniqueMap.values());
  }

  /**
   * Evaluates staleness (reports older than 90 days are flagged as potentially stale).
   */
  private formatMatchDetail(record: DatabaseRecord, matchedOn: string, now: Date): SearchMatchDetail {
    const reportDate = new Date(record.reportDate);
    const diffDays = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
    const isStale = diffDays > 90;

    let stalenessMessage: string | undefined;
    if (isStale) {
      stalenessMessage = `Record is ${diffDays} days old. Mobile numbers and temporary handles may be reassigned over time.`;
    }

    let confidenceInterpretation = 'Moderate';
    if (record.confidence >= 0.9) confidenceInterpretation = 'High Confidence';
    else if (record.confidence <= 0.5) confidenceInterpretation = 'Low / Tentative Confidence';

    return {
      record,
      matchedOn,
      isStale,
      stalenessMessage,
      confidenceInterpretation,
      evidenceLimitations: `${record.limitations} A match is evidence to investigate, not automatic proof of fraud.`
    };
  }

  /**
   * Adds a user demonstration record for testing.
   */
  public addRecord(record: DatabaseRecord): void {
    this.records.unshift(record);
  }

  /**
   * Gets all records in the database.
   */
  public getAllRecords(): DatabaseRecord[] {
    return [...this.records];
  }
}

// Singleton database instance for the prototype
export const localInvestigationDb = new InvestigationDatabase();
