import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Search, 
  ArrowRight
} from 'lucide-react';
import { BENCHMARK_TEST_SCENARIOS } from '../../engine/testScenarios';
import { runBenchmarkSuite } from '../../engine/evaluator';
import { TestScenario } from '../../types';

export const EvaluationLabView: React.FC<{ onInspectInWorkspace?: (scenario: TestScenario) => void }> = ({ onInspectInWorkspace }) => {
  const [suiteOutput, setSuiteOutput] = useState(() => runBenchmarkSuite(BENCHMARK_TEST_SCENARIOS));
  const [isRunning, setIsRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const { results, metrics } = suiteOutput;

  const handleRerunSuite = () => {
    setIsRunning(true);
    setTimeout(() => {
      const output = runBenchmarkSuite(BENCHMARK_TEST_SCENARIOS);
      setSuiteOutput(output);
      setIsRunning(false);
    }, 200);
  };

  const categories = ['ALL', ...Array.from(new Set(BENCHMARK_TEST_SCENARIOS.map(s => s.category)))];

  const filteredResults = results.filter(r => {
    const scenario = BENCHMARK_TEST_SCENARIOS.find(s => s.id === r.scenarioId);
    if (!scenario) return false;

    const matchesSearch = 
      r.scenarioId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.scenarioTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || scenario.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'PASSED' && r.passed) || 
      (filterStatus === 'FAILED' && !r.passed);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedScenario = BENCHMARK_TEST_SCENARIOS.find(s => s.id === selectedScenarioId);
  const selectedResult = results.find(r => r.scenarioId === selectedScenarioId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-mono">Automated Evaluation &amp; Benchmark Lab</h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-mono font-medium">
              {BENCHMARK_TEST_SCENARIOS.length} Labelled Fixtures
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Live execution harness measuring real detection accuracy, false positive rejection, prompt injection defense,
            and confusion matrix statistics against labelled test scenarios.
          </p>
        </div>

        <button
          onClick={handleRerunSuite}
          disabled={isRunning}
          className="text-xs px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl flex items-center gap-2 transition-all shadow-xs self-start md:self-center font-semibold disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Executing 44 Scenarios...' : 'Rerun Full Test Suite'}</span>
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1 shadow-xs">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-mono font-medium">Overall Accuracy</div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {metrics.accuracy}%
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {metrics.passed} / {metrics.total} test cases matched
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1 shadow-xs">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-mono font-medium">Precision (High Risk)</div>
          <div className="text-2xl font-bold font-mono text-emerald-800">
            {metrics.highRiskMetrics.precision}%
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            TP / (TP + FP) [No false alarms]
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1 shadow-xs">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-mono font-medium">Recall / Sensitivity</div>
          <div className="text-2xl font-bold font-mono text-teal-700">
            {metrics.highRiskMetrics.recall}%
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            TP / (TP + FN) [Scam catch rate]
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-1 shadow-xs">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-mono font-medium">False Positive Rate (FPR)</div>
          <div className="text-2xl font-bold font-mono text-slate-800">
            {metrics.highRiskMetrics.fpr}%
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            FP / (FP + TN) [Clean message safety]
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Category Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Confusion Matrix (Positive = HIGH RISK)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono font-medium">Binary Calibration</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-emerald-800 font-mono uppercase tracking-wider block font-bold">
                True Positives (TP)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {metrics.highRiskMetrics.truePositives}
              </div>
              <p className="text-[10px] text-slate-600">
                Correctly identified actual scam patterns as HIGH RISK.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-amber-700 font-mono uppercase tracking-wider block font-bold">
                False Positives (FP)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {metrics.highRiskMetrics.falsePositives}
              </div>
              <p className="text-[10px] text-slate-600">
                Legitimate or ambiguous cases incorrectly flagged as HIGH RISK.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-red-700 font-mono uppercase tracking-wider block font-bold">
                False Negatives (FN)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {metrics.highRiskMetrics.falseNegatives}
              </div>
              <p className="text-[10px] text-slate-600">
                Scams missed by rules or falsely declared safe.
              </p>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-emerald-800 font-mono uppercase tracking-wider block font-bold">
                True Negatives (TN)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {metrics.highRiskMetrics.trueNegatives}
              </div>
              <p className="text-[10px] text-slate-600">
                Correctly recognized legitimate and caution cases.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
            <strong>Evaluation Standard:</strong> Metrics reflect deterministic rule execution on benchmark fixtures.
            In compliance with project specifications, we avoid claiming untested real-world accuracy percentages.
          </div>
        </div>

        {/* Category Breakdown Progress */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Performance by Threat Archetype
            </h3>
            <span className="text-[10px] text-slate-500 font-mono font-medium">
              {Object.keys(metrics.categoryBreakdown).length} Categories
            </span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 text-xs">
            {Object.entries(metrics.categoryBreakdown).map(([cat, data]) => {
              const pct = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-700 font-medium">{cat}</span>
                    <span className="font-mono text-slate-500 font-semibold">
                      {data.passed}/{data.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${pct === 100 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test case ID, title, or keyword..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700 text-xs font-mono"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-700 text-xs font-mono"
          >
            <option value="ALL">All Outcomes</option>
            <option value="PASSED">Passed Only</option>
            <option value="FAILED">Failed Only</option>
          </select>

          <span className="text-[11px] text-slate-400 font-mono ml-auto font-medium">
            {filteredResults.length} / {results.length} scenarios
          </span>
        </div>
      </div>

      {/* Test Scenarios Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">ID</th>
                <th className="py-3.5 px-4 font-semibold">Scenario Title &amp; Description</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Expected</th>
                <th className="py-3.5 px-4 font-semibold">Actual Evaluated</th>
                <th className="py-3.5 px-4 font-semibold">Score</th>
                <th className="py-3.5 px-4 font-semibold">Latency</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredResults.map(r => {
                const scenario = BENCHMARK_TEST_SCENARIOS.find(s => s.id === r.scenarioId)!;
                return (
                  <tr 
                    key={r.scenarioId}
                    className={`hover:bg-slate-50 transition-colors ${
                      selectedScenarioId === r.scenarioId ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      {r.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {r.scenarioId}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-1">{r.scenarioTitle}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{scenario.description}</div>
                      {scenario.isPromptInjection && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          PROMPT INJECTION DEFENSE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 font-medium">
                      {scenario.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className={
                        r.expectedRisk === 'HIGH_RISK' ? 'text-red-700 font-semibold' :
                        r.expectedRisk === 'CAUTION' ? 'text-amber-700 font-semibold' :
                        'text-emerald-700 font-semibold'
                      }>
                        {r.expectedRisk}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className={
                        r.actualRisk === 'HIGH_RISK' ? 'text-red-700 font-semibold' :
                        r.actualRisk === 'CAUTION' ? 'text-amber-700 font-semibold' :
                        'text-emerald-700 font-semibold'
                      }>
                        {r.actualRisk}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-800 font-semibold">
                      {r.actualScore}/100
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                      {r.executionTimeMs}ms
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedScenarioId(r.scenarioId)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-mono font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal for Selected Scenario */}
      {selectedScenario && selectedResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-emerald-800 font-bold">{selectedScenario.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedResult.passed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {selectedResult.passed ? 'PASSED' : 'DISCREPANCY'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedScenario.title}</h3>
              </div>
              <button onClick={() => setSelectedScenarioId(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider block">Input Payload:</span>
                <pre className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap mt-1">
                  {selectedScenario.input.message || JSON.stringify(selectedScenario.input, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-mono">EXPECTED RISK:</span>
                  <strong className="text-slate-900 font-semibold">{selectedScenario.expectedRisk}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-mono">ACTUAL EVALUATION:</span>
                  <strong className="text-emerald-800 font-semibold">{selectedResult.actualRisk} (Score: {selectedResult.actualScore})</strong>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider block">Rationale:</span>
                <p className="text-slate-700 text-[11px] mt-1 leading-relaxed">{selectedScenario.rationale}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider block">Triggered Rules:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedResult.triggeredRuleIds.length > 0 ? (
                    selectedResult.triggeredRuleIds.map(id => (
                      <span key={id} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[10px] border border-slate-200">
                        {id}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">No rules triggered</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {onInspectInWorkspace && (
                <button
                  onClick={() => {
                    onInspectInWorkspace(selectedScenario);
                    setSelectedScenarioId(null);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Load into Central Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setSelectedScenarioId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
