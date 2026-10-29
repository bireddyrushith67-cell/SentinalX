/**
 * Main Detection Orchestrator for UPI GUARD.
 * Coordinates validation, indicator extraction, contextual rule checks, database lookups,
 * and explainable risk synthesis.
 */

import { 
  RiskAssessment, 
  ExtractedIndicators, 
  RuleMatchResult, 
  EvaluationContext, 
  PaymentRequest 
} from '../types';
import { 
  validateMessage, 
  validatePhoneNumber, 
  validateUpiId, 
  validateUrl, 
  extractIndicators 
} from './validators';
import { DETECTION_RULES } from './rules';
import { localInvestigationDb, SearchMatchDetail } from './database';
import { calculateRiskAssessment } from './riskScorer';

export interface ScanOptions {
  customRuleWeights?: Record<string, number>;
  context?: EvaluationContext;
}

export interface DirectInput {
  message?: string;
  phone?: string;
  upiId?: string;
  url?: string;
  payment?: PaymentRequest;
}

/**
 * Executes a full scan on provided inputs.
 */
export function runScan(input: DirectInput, options?: ScanOptions): RiskAssessment {
  const combinedTextParts: string[] = [];
  const directIndicators: { phones: string[]; upiIds: string[]; urls: string[] } = {
    phones: [],
    upiIds: [],
    urls: []
  };

  // 1. Process Message
  if (input.message) {
    const val = validateMessage(input.message);
    if (val.isValid) {
      combinedTextParts.push(val.sanitized);
    }
  }

  // 2. Process Phone
  if (input.phone) {
    const val = validatePhoneNumber(input.phone);
    if (val.isValid) {
      directIndicators.phones.push(val.sanitized);
      combinedTextParts.push(`Phone: ${val.sanitized}`);
    }
  }

  // 3. Process UPI ID
  if (input.upiId) {
    const val = validateUpiId(input.upiId);
    if (val.isValid) {
      directIndicators.upiIds.push(val.sanitized);
      combinedTextParts.push(`UPI ID: ${val.sanitized}`);
    }
  }

  // 4. Process URL
  if (input.url) {
    const val = validateUrl(input.url);
    if (val.isValid) {
      directIndicators.urls.push(val.sanitized);
      combinedTextParts.push(`URL: ${val.sanitized}`);
    }
  }

  // 5. Process Payment Request
  let evaluationContext: EvaluationContext = { ...(options?.context || {}) };
  if (input.payment) {
    evaluationContext.isSimulatedTransaction = true;
    evaluationContext.amount = input.payment.amount;
    evaluationContext.recipientVpa = input.payment.recipientId;
    evaluationContext.recipientName = input.payment.recipientName;
    evaluationContext.isCollectRequest = input.payment.paymentMode === 'COLLECT';
    evaluationContext.isQrScan = input.payment.paymentMode === 'QR_SCAN';

    combinedTextParts.push(
      `Payment to ${input.payment.recipientName} (${input.payment.recipientId}) amount INR ${input.payment.amount}. ` +
      `Mode: ${input.payment.paymentMode}. Note: ${input.payment.contextNote}`
    );

    // If recipient is VPA or Phone
    if (input.payment.recipientId.includes('@')) {
      directIndicators.upiIds.push(input.payment.recipientId.trim().toLowerCase());
    } else if (/^[6-9]\d{9}$/.test(input.payment.recipientId.replace(/\D/g, ''))) {
      directIndicators.phones.push(input.payment.recipientId.replace(/\D/g, '').slice(-10));
    }
  }

  const combinedText = combinedTextParts.join('\n');

  // Extract all indicators
  const extracted = extractIndicators(combinedText);
  // Merge direct indicators
  directIndicators.phones.forEach(p => { if (!extracted.phones.includes(p)) extracted.phones.push(p); });
  directIndicators.upiIds.forEach(u => { if (!extracted.upiIds.includes(u)) extracted.upiIds.push(u); });
  directIndicators.urls.forEach(ur => { if (!extracted.urls.includes(ur)) extracted.urls.push(ur); });

  // 6. Evaluate all detection rules
  const triggeredRules: RuleMatchResult[] = [];
  const customWeights = options?.customRuleWeights || {};

  for (const rule of DETECTION_RULES) {
    const match = rule.evaluate(combinedText, extracted, evaluationContext);
    if (match) {
      if (customWeights[rule.id] !== undefined) {
        match.scoreContribution = customWeights[rule.id];
      }
      triggeredRules.push(match);
    }
  }

  // 7. Search Investigation Database
  const dbMatches: SearchMatchDetail[] = localInvestigationDb.searchIndicators({
    phones: extracted.phones,
    upiIds: extracted.upiIds,
    urls: extracted.urls
  });

  // 8. Synthesize Risk Assessment
  return calculateRiskAssessment(
    triggeredRules,
    dbMatches,
    extracted,
    combinedText.length,
    { isSimulatedPayment: !!input.payment }
  );
}
