/**
 * Risk Assessment Engine for UPI GUARD.
 * Synthesizes deterministic rule evaluations, database lookups, indicator freshness,
 * and context into an explainable assessment.
 *
 * Enforces hard architectural gates: Any PIN/OTP solicitation immediately flags HIGH RISK.
 */

import { RiskAssessment, RiskLevel, RuleMatchResult, ExtractedIndicators } from '../types';
import { SearchMatchDetail } from './database';

export function calculateRiskAssessment(
  triggeredRules: RuleMatchResult[],
  dbMatches: SearchMatchDetail[],
  indicators: ExtractedIndicators,
  inputLength: number,
  customContext?: { isSimulatedPayment?: boolean }
): RiskAssessment {
  const supportingEvidence: string[] = [];
  const contradictoryEvidence: string[] = [];
  const confidenceLimitations: string[] = [];

  // 1. Evaluate Critical Overrides
  const hasCriticalRule = triggeredRules.some(r => r.severity === 'CRITICAL');
  const hasHighRule = triggeredRules.some(r => r.severity === 'HIGH');
  const hasDbVerifiedMatch = dbMatches.some(m => 
    m.record.verificationStatus === 'VERIFIED_SCAM' || 
    (m.record.confidence >= 0.85 && !m.isStale)
  );
  const hasDbUnverifiedMatch = dbMatches.some(m => !hasDbVerifiedMatch);

  // 2. Score Calculation (Explainable composite score, NOT a calibrated probability)
  let rawScore = 0;
  for (const rule of triggeredRules) {
    rawScore += rule.scoreContribution;
    supportingEvidence.push(`[${rule.ruleId}] ${rule.ruleName}: ${rule.evidenceFound.join('; ')}`);
  }

  // Database matches contribution
  for (const match of dbMatches) {
    const isStale = match.isStale;
    const baseWeight = match.record.verificationStatus === 'VERIFIED_SCAM' ? 50 : 30;
    const recencyWeight = isStale ? Math.floor(baseWeight * 0.5) : baseWeight;
    rawScore += recencyWeight;

    supportingEvidence.push(
      `Database Match (${match.matchedOn}): Record ID ${match.record.id} in category "${match.record.category}". ` +
      `Reported ${match.record.reportedCasesCount} times via ${match.record.source}. Status: ${match.record.verificationStatus}.`
    );

    if (isStale) {
      confidenceLimitations.push(`Identifier ${match.matchedOn} has a report over 90 days old; ownership may have shifted.`);
    }
  }

  // Normalise score to 0 - 100 range
  let normalizedScore = Math.min(100, Math.round(rawScore));

  // Evaluate Contradictory Evidence or Missing Information
  if (inputLength < 25 && triggeredRules.length === 0 && dbMatches.length === 0) {
    confidenceLimitations.push('Limited context provided. Short inputs may lack sufficient indicators for deep pattern analysis.');
  }

  if (dbMatches.length === 0 && (indicators.phones.length > 0 || indicators.upiIds.length > 0)) {
    contradictoryEvidence.push('No historical scam complaints found in local demonstration database for the submitted identifier(s).');
    confidenceLimitations.push('Absence of database record does not guarantee safety. New or freshly minted VPAs will not have prior reports.');
  }

  // 3. Determine Final Risk Level
  let riskLevel: RiskLevel = 'NO_KNOWN_WARNING';
  let criticalWarning = false;
  let summary = '';
  let recommendedAction = '';

  if (hasCriticalRule || (hasHighRule && (dbMatches.length > 0 || triggeredRules.length >= 2)) || normalizedScore >= 70 || hasDbVerifiedMatch) {
    riskLevel = 'HIGH_RISK';
    criticalWarning = hasCriticalRule;
    if (normalizedScore < 75) normalizedScore = Math.max(normalizedScore, 75);

    if (hasCriticalRule) {
      summary = 'CRITICAL WARNING: This scenario attempts to extract your UPI PIN, OTP, or falsely claims entering a PIN will credit money to you.';
      recommendedAction = 'DO NOT PROCEED. Never enter your UPI PIN to receive money. Disconnect immediately and report this contact.';
    } else if (hasDbVerifiedMatch) {
      summary = 'HIGH RISK: Associated identifier matches a verified threat record in the demonstration scam database.';
      recommendedAction = 'DO NOT PROCEED. Block this recipient and do not authorize any collect or QR payment.';
    } else {
      summary = 'HIGH RISK: Multiple high-severity scam indicators detected matching known fraud patterns.';
      recommendedAction = 'HALT TRANSACTION. Independently contact the purported organization via their verified website or card number.';
    }
  } else if (hasHighRule || triggeredRules.length > 0 || hasDbUnverifiedMatch || normalizedScore >= 25) {
    riskLevel = 'CAUTION';
    if (normalizedScore < 30) normalizedScore = 35;

    summary = 'CAUTION: Suspicious indicators, urgency patterns, or unverified community reports were detected.';
    recommendedAction = 'PAUSE AND VERIFY. Do not rush. Confirm recipient identity using an independent communication channel before paying.';
  } else {
    riskLevel = 'NO_KNOWN_WARNING';
    normalizedScore = Math.min(normalizedScore, 15);
    summary = 'NO KNOWN WARNING: No overt scam indicators or matched database records were detected in the provided input.';
    recommendedAction = 'Exercise normal caution. Always check the recipient name on your UPI app confirmation screen before entering your PIN.';
    confidenceLimitations.push('System checks available patterns and demonstration records. Absence of detection is NOT proof of legitimacy.');
  }

  // Educational notice disclaimer always attached
  confidenceLimitations.push('Educational prototype. Not affiliated with NPCI, RBI, or law enforcement. Detection is not legal proof of fraud.');

  return {
    riskLevel,
    riskScore: normalizedScore,
    criticalWarning,
    summary,
    triggeredRules,
    databaseMatches: dbMatches.map(m => m.record),
    supportingEvidence,
    contradictoryEvidence,
    confidenceLimitations,
    recommendedAction,
    extractedIndicators: indicators,
    timestamp: new Date().toISOString()
  };
}
