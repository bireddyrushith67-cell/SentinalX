/**
 * Client service for AI Explanations.
 * Sends findings to server endpoint /api/explain, with pure offline fallback.
 */

import { RiskAssessment } from '../types';

export interface ExplanationResponse {
  explanation: string;
  source: 'gemini_ai' | 'deterministic_engine_fallback' | 'offline_client_fallback';
  notice: string;
}

export async function fetchAiExplanation(assessment: RiskAssessment, userMessage?: string): Promise<ExplanationResponse> {
  try {
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessment, userMessage })
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API call to /api/explain failed, falling back to local explanation:', err);
  }

  // Pure offline fallback generator
  return {
    source: 'offline_client_fallback',
    notice: 'Explanation produced locally via deterministic rule graph.',
    explanation: [
      `### Plain-Language Assessment Summary`,
      assessment.criticalWarning
        ? `**CRITICAL INTERVENTION:** An attempt to solicit your UPI PIN or OTP was detected. Under NPCI UPI design standards, PIN is never entered to receive money.`
        : assessment.riskLevel === 'HIGH_RISK'
        ? `**HIGH RISK ALERT:** The submitted scenario triggered severe fraud indicators (${assessment.triggeredRules.map(r => r.ruleName).join(', ') || 'Known threat database entry'}).`
        : assessment.riskLevel === 'CAUTION'
        ? `**CAUTION ADVISORY:** Unverified community reports or artificial urgency detected. Exercise vigilance.`
        : `**NO OVERT WARNING DETECTED:** No recognized fraud signatures were identified. Proceed with normal verification.`,
      `\n### Observations vs. Assumptions`,
      `- **Observation:** Checked ${assessment.triggeredRules.length} explicit safety rules against input text.`,
      `- **Limitation:** A clean scan indicates lack of matching threat signatures, not certified legal innocence.`,
      `\n### Recommended Actions`,
      `- ${assessment.recommendedAction}`,
      `- If you have already suffered financial loss, call **1930** immediately for emergency cyber intervention.`
    ].join('\n')
  };
}
