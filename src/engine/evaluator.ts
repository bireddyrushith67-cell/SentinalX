/**
 * Benchmark Test Runner and Statistical Evaluator for UPI GUARD.
 * Calculates metrics with strict zero-denominator safeguards.
 * Evaluates confusion matrix with HIGH_RISK as positive class.
 */

import { TestScenario, EvaluationResult, SuiteMetrics } from '../types';
import { runScan } from './detector';
import { BENCHMARK_TEST_SCENARIOS } from './testScenarios';

export function runBenchmarkSuite(scenarios: TestScenario[] = BENCHMARK_TEST_SCENARIOS): {
  results: EvaluationResult[];
  metrics: SuiteMetrics;
} {
  const results: EvaluationResult[] = [];
  const categoryBreakdown: Record<string, { total: number; passed: number }> = {};

  let truePositives = 0; // Expected HIGH_RISK, got HIGH_RISK
  let falsePositives = 0; // Expected CAUTION or NO_KNOWN_WARNING, got HIGH_RISK
  let trueNegatives = 0; // Expected not HIGH_RISK, got not HIGH_RISK
  let falseNegatives = 0; // Expected HIGH_RISK, got not HIGH_RISK

  let totalPassed = 0;

  for (const scenario of scenarios) {
    const start = performance.now();
    const assessment = runScan(scenario.input);
    const duration = performance.now() - start;

    const actualRisk = assessment.riskLevel;
    const passed = actualRisk === scenario.expectedRisk;

    if (passed) totalPassed++;

    // Confusion matrix counters (Positive class = HIGH_RISK)
    const isExpectedPositive = scenario.expectedRisk === 'HIGH_RISK';
    const isActualPositive = actualRisk === 'HIGH_RISK';

    if (isExpectedPositive && isActualPositive) {
      truePositives++;
    } else if (!isExpectedPositive && isActualPositive) {
      falsePositives++;
    } else if (!isExpectedPositive && !isActualPositive) {
      trueNegatives++;
    } else if (isExpectedPositive && !isActualPositive) {
      falseNegatives++;
    }

    // Category breakdown
    if (!categoryBreakdown[scenario.category]) {
      categoryBreakdown[scenario.category] = { total: 0, passed: 0 };
    }
    categoryBreakdown[scenario.category].total++;
    if (passed) {
      categoryBreakdown[scenario.category].passed++;
    }

    results.push({
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      expectedRisk: scenario.expectedRisk,
      actualRisk,
      passed,
      actualScore: assessment.riskScore,
      triggeredRuleIds: assessment.triggeredRules.map(r => r.ruleId),
      executionTimeMs: Math.round(duration * 100) / 100,
      details: passed 
        ? `Matched expected outcome: ${actualRisk} (Score: ${assessment.riskScore})`
        : `Discrepancy: Expected ${scenario.expectedRisk}, evaluated as ${actualRisk} (Score: ${assessment.riskScore})`
    });
  }

  // Safe statistical calculations
  const total = scenarios.length;
  const accuracy = total > 0 ? (totalPassed / total) * 100 : 0;
  
  const precisionDenominator = truePositives + falsePositives;
  const precision = precisionDenominator > 0 ? (truePositives / precisionDenominator) * 100 : 100;

  const recallDenominator = truePositives + falseNegatives;
  const recall = recallDenominator > 0 ? (truePositives / recallDenominator) * 100 : 100;

  const fprDenominator = falsePositives + trueNegatives;
  const fpr = fprDenominator > 0 ? (falsePositives / fprDenominator) * 100 : 0;

  const metrics: SuiteMetrics = {
    total,
    passed: totalPassed,
    failed: total - totalPassed,
    accuracy: Math.round(accuracy * 10) / 10,
    highRiskMetrics: {
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
      precision: Math.round(precision * 10) / 10,
      recall: Math.round(recall * 10) / 10,
      fpr: Math.round(fpr * 10) / 10
    },
    categoryBreakdown
  };

  return { results, metrics };
}
