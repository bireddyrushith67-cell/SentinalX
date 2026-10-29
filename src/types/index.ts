export type RiskLevel = 'HIGH_RISK' | 'CAUTION' | 'NO_KNOWN_WARNING';

export type IndicatorType = 'phone' | 'upi_id' | 'url' | 'message' | 'transaction';

export type ReportCategory = 
  | 'QR_COLLECT_FRAUD'
  | 'PIN_HARVESTING'
  | 'REMOTE_ACCESS_APP'
  | 'FAKE_BANK_OFFICER'
  | 'LOTTERY_CASHBACK'
  | 'ELECTRICITY_DISCONNECTION'
  | 'COURIER_CUSTOMS_SCAM'
  | 'OLX_ADVANCE_PAYMENT'
  | 'IMPERSONATION'
  | 'SUSPICIOUS_DOMAIN';

export type VerificationStatus = 'VERIFIED_SCAM' | 'USER_REPORTED_UNVERIFIED' | 'SIMULATED_DEMO';

export interface DatabaseRecord {
  id: string;
  identifierType: 'phone' | 'upi_id' | 'url';
  normalizedIdentifier: string;
  displayIdentifier: string;
  category: ReportCategory;
  reportDate: string;
  source: string;
  verificationStatus: VerificationStatus;
  evidenceDescription: string;
  reportedCasesCount: number;
  lastUpdated: string;
  confidence: number; // 0.0 to 1.0
  limitations: string;
  tags: string[];
}

export interface ExtractedIndicators {
  phones: string[];
  upiIds: string[];
  urls: string[];
  amounts: number[];
  keywords: string[];
  hasCollectRequest: boolean;
  hasQrMention: boolean;
  hasPinOtpMention: boolean;
  hasUrgency: boolean;
  hasRemoteAppMention: boolean;
}

export type RuleSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DetectionRule {
  id: string;
  name: string;
  description?: string;
  category: string;
  severity: RuleSeverity;
  defaultWeight: number; // contribution to score
  rationale: string;
  evaluate: (text: string, indicators: ExtractedIndicators, context?: EvaluationContext) => RuleMatchResult | null;
  safeAction: string;
}

export interface RuleMatchResult {
  ruleId: string;
  ruleName: string;
  category?: string;
  severity: RuleSeverity;
  evidenceFound: string[];
  explanation: string;
  safeAction: string;
  scoreContribution: number;
}

export interface EvaluationContext {
  isSimulatedTransaction?: boolean;
  amount?: number;
  recipientVpa?: string;
  recipientName?: string;
  isCollectRequest?: boolean;
  isQrScan?: boolean;
  contextNote?: string;
}

export interface RiskAssessment {
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100 explainable score
  criticalWarning: boolean;
  summary: string;
  triggeredRules: RuleMatchResult[];
  databaseMatches: DatabaseRecord[];
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  confidenceLimitations: string[];
  recommendedAction: string;
  extractedIndicators: ExtractedIndicators;
  timestamp: string;
  isAiEnhanced?: boolean;
  aiExplanation?: string;
}

export interface PaymentRequest {
  recipientId: string; // VPA or Phone
  recipientName: string;
  amount: number;
  paymentMode: 'PUSH' | 'COLLECT' | 'QR_SCAN';
  contextNote: string;
  messageText?: string;
}

export interface TestScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  input: {
    message?: string;
    phone?: string;
    upiId?: string;
    url?: string;
    payment?: PaymentRequest;
  };
  expectedRisk: RiskLevel;
  expectedRulesTriggered?: string[];
  rationale: string;
  isEdgeCase?: boolean;
  isPromptInjection?: boolean;
}

export interface EvaluationResult {
  scenarioId: string;
  scenarioTitle: string;
  expectedRisk: RiskLevel;
  actualRisk: RiskLevel;
  passed: boolean;
  actualScore: number;
  triggeredRuleIds: string[];
  executionTimeMs: number;
  details: string;
}

export interface SuiteMetrics {
  total: number;
  passed: number;
  failed: number;
  accuracy: number;
  highRiskMetrics: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
    precision: number;
    recall: number;
    fpr: number;
  };
  categoryBreakdown: Record<string, { total: number; passed: number }>;
}

export interface OfficialProviderStatus {
  providerName: string;
  portalUrl: string;
  authorizedApiAvailable: boolean;
  authStatusReason: string;
  lastChecked: string;
  manualVerificationUrl: string;
  helpline: string;
  instructions: string[];
}
