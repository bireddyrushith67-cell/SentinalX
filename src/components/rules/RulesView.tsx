import React, { useState } from 'react';
import { Sliders, RotateCcw, Play } from 'lucide-react';
import { DETECTION_RULES, DEFAULT_RULE_WEIGHTS } from '../../engine/rules';
import { extractIndicators } from '../../engine/validators';

interface RulesViewProps {
  customWeights: Record<string, number>;
  onUpdateWeights: (weights: Record<string, number>) => void;
}

export const RulesView: React.FC<RulesViewProps> = ({
  customWeights,
  onUpdateWeights
}) => {
  const [weights, setWeights] = useState<Record<string, number>>({ ...DEFAULT_RULE_WEIGHTS, ...customWeights });
  const [testString, setTestString] = useState('Scan QR code to receive Rs 2500 cashback prize');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  const handleWeightChange = (ruleId: string, val: number) => {
    const updated = { ...weights, [ruleId]: val };
    setWeights(updated);
    onUpdateWeights(updated);
  };

  const handleResetWeights = () => {
    setWeights({ ...DEFAULT_RULE_WEIGHTS });
    onUpdateWeights({ ...DEFAULT_RULE_WEIGHTS });
  };

  const testIndicators = extractIndicators(testString);
  const liveEvaluations = DETECTION_RULES.map(rule => {
    const match = rule.evaluate(testString, testIndicators);
    return { rule, match };
  });

  const categories = ['ALL', ...Array.from(new Set(DETECTION_RULES.map(r => r.category)))];

  const filteredRules = activeCategoryFilter === 'ALL'
    ? DETECTION_RULES
    : DETECTION_RULES.filter(r => r.category === activeCategoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* View Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-mono">Explainable Detection Rules Engine</h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-mono font-medium">
              12 Active Rules
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Transparent, deterministic rule catalog. Every rule returns an ID, name, evidence found, severity, explanation, and safe action.
            Weights can be dynamically tuned to demonstrate score calibration.
          </p>
        </div>

        <button
          onClick={handleResetWeights}
          className="text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors self-start md:self-center font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default Weights</span>
        </button>
      </div>

      {/* Live Interactive Rule Sandbox */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Interactive Rule Trigger Playground
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Evaluates rules live as you type</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-2">
            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Type or paste any phrase to test rule triggers..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-500">Quick tests:</span>
              <button 
                onClick={() => setTestString('Your electricity will be disconnected tonight. Call officer at 9876543210 immediately')}
                className="underline hover:text-emerald-800"
              >
                Electricity Cutoff
              </button>
              <span>•</span>
              <button 
                onClick={() => setTestString('Enter your UPI PIN to claim Rs 5000 cashback')}
                className="underline hover:text-emerald-800"
              >
                PIN to Receive
              </button>
              <span>•</span>
              <button 
                onClick={() => setTestString('Download AnyDesk app for bank KYC')}
                className="underline hover:text-emerald-800"
              >
                AnyDesk
              </button>
              <span>•</span>
              <button 
                onClick={() => setTestString('Your OTP is 49201. Never share your OTP with anyone.')}
                className="underline hover:text-emerald-800 font-medium text-emerald-700"
              >
                Legitimate OTP Advisory
              </button>
            </div>
          </div>

          <div className="md:col-span-4 bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-center">
            <div className="text-[11px] text-slate-600 uppercase tracking-wider font-semibold">Rules Fired:</div>
            <div className="text-xl font-bold font-mono text-emerald-800 mt-0.5">
              {liveEvaluations.filter(e => e.match !== null).length} of {DETECTION_RULES.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-mono">
              {liveEvaluations.filter(e => e.match !== null).map(e => e.rule.id).join(', ') || 'No rules triggered'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 text-[11px] uppercase tracking-wider mr-2 font-semibold">Category:</span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all font-mono text-[11px] ${
              activeCategoryFilter === cat
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Rule Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map(rule => {
          const isFiredInPlayground = liveEvaluations.find(e => e.rule.id === rule.id)?.match !== null;
          const currentWeight = weights[rule.id] ?? rule.defaultWeight;

          return (
            <div 
              key={rule.id}
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                isFiredInPlayground
                  ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{rule.name}</span>
                    {isFiredInPlayground && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        FIRED IN TEST
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{rule.id} • {rule.category}</span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  rule.severity === 'CRITICAL' ? 'bg-red-50 text-red-800 border border-red-200' :
                  rule.severity === 'HIGH' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {rule.severity}
                </span>
              </div>

              {/* Rationale & Explanation */}
              <div className="text-xs space-y-1.5 text-slate-700 leading-relaxed">
                <p><strong className="text-slate-900">Engineering Rationale:</strong> {rule.rationale}</p>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-950">
                  <strong className="text-emerald-800">Safe Counteraction:</strong> {rule.safeAction}
                </div>
              </div>

              {/* Weight Slider */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600 font-mono text-[11px] font-medium">Weight Score Contribution:</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={currentWeight}
                    onChange={(e) => handleWeightChange(rule.id, Number(e.target.value))}
                    className="w-24 accent-emerald-700 cursor-pointer"
                  />
                  <span className="text-emerald-800 font-bold w-7 text-right">{currentWeight}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
