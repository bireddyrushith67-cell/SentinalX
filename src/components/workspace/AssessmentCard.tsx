import React from 'react';
import { 
  RiskAssessment, 
  RiskLevel 
} from '../../types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  FileText,
  Copy,
  Check
} from 'lucide-react';

interface AssessmentCardProps {
  assessment: RiskAssessment;
  onSendToPaymentGate?: () => void;
  onSendToReportBuilder?: () => void;
  onToggleAiExplanation?: () => void;
  isAiLoading?: boolean;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  onSendToPaymentGate,
  onSendToReportBuilder,
  onToggleAiExplanation,
  isAiLoading
}) => {
  const [copied, setCopied] = React.useState(false);

  const getRiskTheme = (level: RiskLevel) => {
    switch (level) {
      case 'HIGH_RISK':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50/50',
          badgeBg: 'bg-red-100 text-red-800 border-red-300',
          scoreColor: 'text-red-700',
          barColor: 'bg-red-600',
          icon: AlertOctagon,
          title: 'HIGH RISK DETECTED'
        };
      case 'CAUTION':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50/50',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          scoreColor: 'text-amber-700',
          barColor: 'bg-amber-500',
          icon: AlertTriangle,
          title: 'CAUTION — SUSPICIOUS PATTERNS'
        };
      case 'NO_KNOWN_WARNING':
        return {
          border: 'border-emerald-200',
          bg: 'bg-emerald-50/40',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          scoreColor: 'text-emerald-700',
          barColor: 'bg-emerald-600',
          icon: ShieldCheck,
          title: 'NO KNOWN WARNING DETECTED'
        };
    }
  };

  const theme = getRiskTheme(assessment.riskLevel);
  const Icon = theme.icon;

  const handleCopySummary = () => {
    const text = `[UPI GUARD Assessment Summary]
Risk Category: ${assessment.riskLevel}
Explainable Score: ${assessment.riskScore}/100
Findings: ${assessment.summary}
Recommended Action: ${assessment.recommendedAction}
Triggered Rules: ${assessment.triggeredRules.map(r => r.ruleName).join(', ') || 'None'}
Database Matches: ${assessment.databaseMatches.map(m => m.normalizedIdentifier).join(', ') || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-2xl border ${theme.border} ${theme.bg} p-6 space-y-5 transition-all shadow-sm bg-white`}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <Icon className={`w-7 h-7 ${theme.scoreColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-bold font-mono tracking-wider rounded border ${theme.badgeBg}`}>
                {theme.title}
              </span>
              {assessment.criticalWarning && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">
                  CRITICAL PIN/OTP GATE ACTIVE
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-800 mt-1">{assessment.summary}</p>
          </div>
        </div>

        {/* Explainable Score Gauge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl self-start sm:self-center">
          <div>
            <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-medium">Risk Score Index</div>
            <div className="text-xl font-bold font-mono text-slate-900">
              <span className={theme.scoreColor}>{assessment.riskScore}</span>
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
          </div>
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${theme.barColor} transition-all duration-500`}
              style={{ width: `${assessment.riskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Critical Override Notice if applicable */}
      {assessment.criticalWarning && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-red-900">
            <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
            <span>ARCHITECTURAL SAFETY OVERRIDE: UPI PIN IS NEVER ENTERED TO RECEIVE MONEY</span>
          </div>
          <p className="text-red-800 leading-relaxed">
            Under NPCI UPI architectural specifications, entering a UPI PIN solely authorizes an outgoing debit from your bank account.
            Any claim that entering your PIN will credit money, accept a refund, or claim a prize is a deceptive technique designed to drain your balance.
          </p>
        </div>
      )}

      {/* Actionable Recommendation */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-xs space-y-1">
          <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block">
            Recommended Safe Action:
          </span>
          <p className="text-slate-900 font-medium">{assessment.recommendedAction}</p>
        </div>
      </div>

      {/* Triggered Rules Breakdown */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold uppercase tracking-wider">
          <span>Evaluated Detection Rules ({assessment.triggeredRules.length} Triggered)</span>
          <span className="text-[11px] lowercase font-normal text-slate-500">contextual rules engine</span>
        </div>

        {assessment.triggeredRules.length === 0 ? (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>None of the 12 deterministic scam pattern rules were triggered by this input.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {assessment.triggeredRules.map((rule) => (
              <div 
                key={rule.ruleId}
                className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{rule.ruleName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.severity === 'CRITICAL' ? 'bg-red-50 text-red-800 border border-red-200' :
                      rule.severity === 'HIGH' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">+{rule.scoreContribution} pts</span>
                </div>
                
                <p className="text-slate-700 leading-relaxed">{rule.explanation}</p>

                <div className="text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                  <strong className="text-emerald-800">Safe Rule:</strong> {rule.safeAction}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Matches */}
      {assessment.databaseMatches.length > 0 && (
        <div className="space-y-2.5">
          <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider flex items-center gap-2">
            <span>Threat Demonstration Database Matches ({assessment.databaseMatches.length})</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Demonstration Records
            </span>
          </div>

          <div className="space-y-2">
            {assessment.databaseMatches.map((record) => (
              <div 
                key={record.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs space-y-2 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800">{record.displayIdentifier}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px]">
                      {record.category}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    record.verificationStatus === 'VERIFIED_SCAM' ? 'bg-red-50 text-red-800 border border-red-200' :
                    'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {record.verificationStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-slate-700">{record.evidenceDescription}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <div><strong>Source:</strong> {record.source} ({record.reportedCasesCount} reports)</div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Last Updated: {record.reportDate}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 italic">
                  <strong>Evidence Limitation:</strong> {record.limitations} A match is evidence to investigate, not automatic proof of wrongdoing.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supporting vs Contradictory Evidence & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5">
          <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
            Supporting Evidence ({assessment.supportingEvidence.length})
          </span>
          {assessment.supportingEvidence.length === 0 ? (
            <p className="text-slate-500 italic">No overt supporting evidence of fraud found.</p>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {assessment.supportingEvidence.slice(0, 3).map((item, i) => (
                <li key={i} className="line-clamp-2">{item}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5">
          <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
            Confidence Limitations &amp; Context
          </span>
          <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
            {assessment.confidenceLimitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Workflow Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 transition-colors font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Summary Copied' : 'Copy Findings'}</span>
          </button>

          {onToggleAiExplanation && (
            <button
              onClick={onToggleAiExplanation}
              disabled={isAiLoading}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs rounded-xl flex items-center gap-1.5 transition-colors font-medium disabled:opacity-50"
            >
              <Info className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isAiLoading ? 'Analyzing...' : 'AI Plain-Language Breakdown'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onSendToPaymentGate && (
            <button
              onClick={onSendToPaymentGate}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 transition-colors font-medium"
            >
              <span>Test in Payment Gate</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}

          {onSendToReportBuilder && (
            <button
              onClick={onSendToReportBuilder}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs rounded-xl font-medium flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Draft Incident Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
