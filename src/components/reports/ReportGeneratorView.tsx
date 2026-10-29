import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  Edit3, 
  PhoneCall
} from 'lucide-react';
import { RiskAssessment } from '../../types';

interface ReportGeneratorViewProps {
  initialAssessment?: RiskAssessment | null;
  initialMessage?: string;
}

export const ReportGeneratorView: React.FC<ReportGeneratorViewProps> = ({
  initialAssessment,
  initialMessage
}) => {
  const [suspectIdentifier, setSuspectIdentifier] = useState(
    initialAssessment?.extractedIndicators.upiIds[0] ||
    initialAssessment?.extractedIndicators.phones[0] ||
    initialAssessment?.extractedIndicators.urls[0] ||
    ''
  );
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(
    initialAssessment?.triggeredRules[0]?.category || 'QR_COLLECT_FRAUD'
  );
  const [financialLoss, setFinancialLoss] = useState<number>(0);
  const [userObservations, setUserObservations] = useState(
    initialMessage || 'Caller claimed to be bank official requesting UPI PIN authorization to release pending refund.'
  );

  // Redaction / Privacy toggles
  const [redactPersonalData, setRedactPersonalData] = useState(true);
  const [confirmedUserReview, setConfirmedUserReview] = useState(false);

  // Copy & Download states
  const [copiedText, setCopiedText] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const generateReportSummaryText = () => {
    return `================================================================================
NATIONAL CYBER FINANCIAL FRAUD DRAFT INCIDENT BRIEF
Generated via UPI GUARD Educational Innovation Prototype
================================================================================
INCIDENT DATE: ${incidentDate}
INCIDENT CLASSIFICATION: ${category}
SUSPECT IDENTIFIER (Phone/UPI/URL): ${suspectIdentifier}
ESTIMATED FINANCIAL LOSS: INR ${financialLoss}

1. USER OBSERVATIONS & TRANSCRIPT:
${userObservations}

2. DETERMINISTIC ENGINE FINDINGS:
- Risk Severity Assessment: ${initialAssessment?.riskLevel || 'NOT EVALUATED'}
- Composite Risk Score Index: ${initialAssessment?.riskScore || 'N/A'}/100
- Critical PIN/OTP Warning Flag: ${initialAssessment?.criticalWarning ? 'YES' : 'NO'}
- Triggered Rules:
${(initialAssessment?.triggeredRules || []).map(r => `  * [${r.ruleId}] ${r.ruleName} (${r.severity}): ${r.explanation}`).join('\n') || '  * None'}

3. EVIDENCE LIMITATION & LEGAL NOTICE:
This brief is compiled for the victim's review prior to official submission to
law enforcement. It does not constitute legal proof of guilt. All allegations
must be independently corroborated by investigating authorities.

4. OFFICIAL SUBMISSION CHANNEL:
- Portal: https://cybercrime.gov.in (National Cyber Crime Reporting Portal)
- National Helpline: 1930 (Immediate 24x7 freeze assistance)
================================================================================`;
  };

  const generateReportJson = () => {
    return JSON.stringify({
      reportHeader: {
        system: 'UPI GUARD',
        version: 'HCL Jigsaw Level 2 Prototype',
        generatedAt: new Date().toISOString(),
      },
      incidentDetails: {
        incidentDate,
        category,
        suspectIdentifier,
        financialLossInr: financialLoss,
        userObservations: redactPersonalData ? userObservations.replace(/\b\d{4}\b/g, '****') : userObservations
      },
      automatedDetectionFindings: initialAssessment ? {
        riskLevel: initialAssessment.riskLevel,
        riskScore: initialAssessment.riskScore,
        criticalWarning: initialAssessment.criticalWarning,
        rules: initialAssessment.triggeredRules.map(r => ({ id: r.ruleId, name: r.ruleName, severity: r.severity })),
        databaseMatches: initialAssessment.databaseMatches.map(m => ({ id: m.id, category: m.category }))
      } : null,
      officialReportingGuidance: {
        portalUrl: 'https://cybercrime.gov.in',
        helpline: '1930',
        goldenHourNotice: 'Report immediately within 2 hours to freeze funds.'
      }
    }, null, 2);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateReportSummaryText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(generateReportJson());
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([generateReportSummaryText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `UPI-GUARD-Incident-Report-${incidentDate}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-mono">Incident Report Builder</h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-mono font-medium">
              Responsible Workflow
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Review and structure detected evidence into a formal cyber fraud incident brief.
            Formatted for user export to the National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-700 self-start md:self-center font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>No automatic publishing. You maintain complete control over this data.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Report Editor */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                1. Review &amp; Edit Incident Details
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono font-medium">Step 1 of 2</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Suspect identifier */}
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Suspect Identifier (Phone, UPI VPA, or URL):</label>
              <input
                type="text"
                value={suspectIdentifier}
                onChange={(e) => setSuspectIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or scammer@upi"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            {/* Date & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Date of Occurrence:</label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Fraud Classification:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-emerald-600 focus:bg-white"
                >
                  <option value="QR_COLLECT_FRAUD">QR Collect Reverse Fraud</option>
                  <option value="PIN_HARVESTING">PIN / OTP Solicitation</option>
                  <option value="REMOTE_ACCESS_APP">Remote Access Software (AnyDesk)</option>
                  <option value="ELECTRICITY_DISCONNECTION">Electricity Bill Cutoff Threat</option>
                  <option value="COURIER_CUSTOMS_SCAM">Detained Parcel / Customs Extortion</option>
                  <option value="LOTTERY_CASHBACK">Fake Lottery / Cashback Scheme</option>
                  <option value="IMPERSONATION">Official Impersonation</option>
                  <option value="SUSPICIOUS_DOMAIN">Phishing Link / Lookalike Domain</option>
                </select>
              </div>
            </div>

            {/* Financial Loss */}
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Actual or Attempted Financial Loss (INR ₹):</label>
              <input
                type="number"
                value={financialLoss}
                onChange={(e) => setFinancialLoss(Number(e.target.value))}
                min={0}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:border-emerald-600 focus:bg-white"
              />
              <span className="text-[10px] text-slate-500">
                Enter 0 if transaction was blocked or aborted before money left account.
              </span>
            </div>

            {/* Narrative */}
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Chronological Incident Narrative:</label>
              <textarea
                value={userObservations}
                onChange={(e) => setUserObservations(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-600 focus:bg-white leading-relaxed"
              />
            </div>

            {/* Redaction & Safety checkboxes */}
            <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={redactPersonalData}
                  onChange={(e) => setRedactPersonalData(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-0"
                />
                <span className="text-[11px] text-slate-700 font-medium">
                  Anonymize sensitive numbers (mask 4-digit PIN/OTP numbers in exported payload).
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedUserReview}
                  onChange={(e) => setConfirmedUserReview(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-0"
                />
                <span className="text-[11px] text-slate-700 font-medium">
                  I have personally verified these statements for factual accuracy.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Export Preview & Official Portal Instructions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  2. Generated Brief Preview
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-medium">Ready for Export</span>
            </div>

            {/* Preview Box */}
            <pre className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono text-slate-800 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
              {generateReportSummaryText()}
            </pre>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors font-semibold"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied Brief' : 'Copy Text Brief'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyJson}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors font-semibold"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>JSON</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadText}
                className="py-2.5 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* Official Portal Filing Guide */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 text-xs shadow-xs">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 text-emerald-800 font-mono">
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              Where &amp; How to File Officially in India
            </h4>

            <div className="space-y-2.5 text-slate-700 text-[11px]">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <PhoneCall className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">Call 1930 immediately if money was deducted:</strong>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Operated by the Indian Cyber Crime Coordination Centre (I4C). It triggers immediate inter-bank alerts to freeze the destination account before funds are cashed out through ATMs.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">Official Portal: cybercrime.gov.in:</strong>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Click "Report Financial Fraud" on the homepage. Copy-paste the structured brief generated above into the incident description box.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
