import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  AlertOctagon, 
  AlertTriangle, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  X, 
  Send, 
  HelpCircle,
  Lock
} from 'lucide-react';
import { PaymentRequest, RiskAssessment } from '../../types';
import { runScan } from '../../engine/detector';

interface PaymentGateViewProps {
  initialData?: { recipientId?: string; note?: string };
}

export const PaymentGateView: React.FC<PaymentGateViewProps> = ({ initialData }) => {
  const [recipientId, setRecipientId] = useState(initialData?.recipientId || 'olx.buyer.safe@paytm');
  const [recipientName, setRecipientName] = useState('OLX Direct Buyer');
  const [amount, setAmount] = useState<number>(4500);
  const [paymentMode, setPaymentMode] = useState<'PUSH' | 'COLLECT' | 'QR_SCAN'>('QR_SCAN');
  const [contextNote, setContextNote] = useState(initialData?.note || 'Scan barcode to receive advance payment for wooden table');

  // Simulation flow states
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulationCompleted, setSimulationCompleted] = useState<boolean>(false);
  const [simulationOutcome, setSimulationOutcome] = useState<'CANCELLED' | 'PROCEEDED' | null>(null);

  // Safety gate overrides
  const [userAcknowledgedWarning, setUserAcknowledgedWarning] = useState(false);
  const [understoodPinMyth, setUnderstoodPinMyth] = useState(false);

  useEffect(() => {
    if (initialData?.recipientId) setRecipientId(initialData.recipientId);
    if (initialData?.note) setContextNote(initialData.note);
  }, [initialData]);

  // Preset quick scenarios
  const presets = [
    {
      title: 'High-Risk: OLX Reverse QR Scam',
      recipientId: 'olx.buyer.safe@paytm',
      recipientName: 'OLX Buyer (Rajesh)',
      amount: 4500,
      mode: 'QR_SCAN' as const,
      note: 'Scan QR code barcode to receive advance payment for furniture'
    },
    {
      title: 'High-Risk: Fake SBI Refund VPA',
      recipientId: 'refund.desk.sbi@ybl',
      recipientName: 'SBI Refund Assistance',
      amount: 8000,
      mode: 'PUSH' as const,
      note: 'Transaction refund clearance charge'
    },
    {
      title: 'Caution: Electricity Bill to Personal Number',
      recipientId: '9876543210@upi',
      recipientName: 'Discom Support Officer',
      amount: 1450,
      mode: 'PUSH' as const,
      note: 'Electricity bill payment to avoid tonight power cut'
    },
    {
      title: 'Clean: Grocery Store Push Payment',
      recipientId: 'groceries.sharma@okaxis',
      recipientName: 'Sharma Provisions',
      amount: 350,
      mode: 'PUSH' as const,
      note: 'Milk and bread purchase'
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setRecipientId(p.recipientId);
    setRecipientName(p.recipientName);
    setAmount(p.amount);
    setPaymentMode(p.mode);
    setContextNote(p.note);
    setAssessment(null);
    setSimulationCompleted(false);
    setUserAcknowledgedWarning(false);
    setUnderstoodPinMyth(false);
  };

  const handleInitiatePayment = () => {
    setIsEvaluating(true);
    setSimulationCompleted(false);
    setUserAcknowledgedWarning(false);
    setUnderstoodPinMyth(false);

    const payment: PaymentRequest = {
      recipientId,
      recipientName,
      amount,
      paymentMode,
      contextNote
    };

    // Run real-time detection scan on simulated transaction
    setTimeout(() => {
      const result = runScan({
        payment,
        message: contextNote
      });

      setAssessment(result);
      setIsEvaluating(false);
      setIsModalOpen(true);
    }, 150);
  };

  const handleCancelPayment = () => {
    setIsModalOpen(false);
    setSimulationCompleted(true);
    setSimulationOutcome('CANCELLED');
  };

  const handleForceProceedPayment = () => {
    setIsModalOpen(false);
    setSimulationCompleted(true);
    setSimulationOutcome('PROCEEDED');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* View Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-mono">Pre-Payment Safety Gate Simulator</h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-mono font-medium">
              Safe Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Simulate payment requests and evaluate risk in real-time before reaching confirmation.
            High-risk transactions are actively blocked with mandatory educational friction.
          </p>
        </div>

        <div className="text-[11px] bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-700 flex items-center gap-2 font-medium">
          <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Fictional simulation only. Never communicates with actual bank servers.</span>
        </div>
      </div>

      {/* Preset Loader */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold uppercase tracking-wider text-emerald-800">
            Simulated Test Scenarios
          </span>
          <span className="text-[11px] text-slate-500">Pick a scenario to test gate behaviors</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="text-xs p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all space-y-1 font-medium"
            >
              <div className="font-semibold text-slate-900 line-clamp-1">{preset.title}</div>
              <div className="text-[11px] text-slate-500 font-mono">₹{preset.amount} • {preset.mode}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Form Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900 font-mono">Simulated Transaction Details</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono font-medium">Test Sandbox</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Payment Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">Payment Mechanism / Flow:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('PUSH')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'PUSH'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Send (Push)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('QR_SCAN')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'QR_SCAN'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  <span>QR Code Scan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('COLLECT')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'COLLECT'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-700" />
                  <span>Collect Request</span>
                </button>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold">Recipient UPI ID or Phone:</label>
                <input
                  type="text"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  placeholder="e.g. merchant@upi or 9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-semibold">Display Name / Claimed Entity:</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. OLX Buyer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">Amount to Transfer (INR ₹):</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-mono text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={1}
                  max={100000}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3 text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Context Note / Message */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">Transaction Purpose / Message Note:</label>
              <textarea
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                placeholder="e.g. 'Scan this QR code to receive money for second-hand bicycle'..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-mono"
              />
            </div>

            {/* CTA Button with Emerald to Teal Gradient (no blue/purple/pink) */}
            <button
              type="button"
              onClick={handleInitiatePayment}
              disabled={isEvaluating}
              className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              <span>{isEvaluating ? 'Evaluating Pre-Flight Safety...' : 'Proceed to Simulated Payment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational Guidelines Panel */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-xs shadow-xs">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-emerald-800">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              Pre-Payment Gate Specifications
            </h4>
            
            <p className="text-slate-600 leading-relaxed">
              In real UPI banking applications, users often tap "Approve" or enter their PIN in under 3 seconds due to urgency or manipulation.
            </p>

            <div className="space-y-2.5">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-semibold text-red-700 block mb-1">Gate Rule 1: High-Risk Blocking</span>
                <p className="text-slate-600 text-[11px]">
                  If an input instructs entering a PIN to receive funds, or matches a confirmed fraud record, standard progression is disabled.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-semibold text-amber-700 block mb-1">Gate Rule 2: Caution Delay</span>
                <p className="text-slate-600 text-[11px]">
                  Unverified VPAs or urgency triggers introduce a mandatory verification pause with checklist steps.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-semibold text-emerald-700 block mb-1">Gate Rule 3: Zero Safety Warranty</span>
                <p className="text-slate-600 text-[11px]">
                  Even for clean scans, the system explicitly warns that no automated engine can guarantee absolute innocence.
                </p>
              </div>
            </div>
          </div>

          {/* Outcome notification if tested */}
          {simulationCompleted && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 shadow-xs ${
              simulationOutcome === 'CANCELLED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {simulationOutcome === 'CANCELLED' ? <ShieldCheck className="w-5 h-5 text-emerald-700" /> : <AlertTriangle className="w-5 h-5 text-amber-700" />}
                <span>
                  {simulationOutcome === 'CANCELLED' 
                    ? 'SIMULATION OUTCOME: TRANSACTION SAFELY CANCELLED' 
                    : 'SIMULATION OUTCOME: USER OVERRODE WARNINGS'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {simulationOutcome === 'CANCELLED'
                  ? 'The user successfully paused and aborted the fraudulent transaction, safeguarding simulated funds.'
                  : 'The user accepted full risk and bypassed warnings. In real UPI, entering your PIN at this point debits funds permanently.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Safety Gate Modal */}
      {isModalOpen && assessment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  assessment.riskLevel === 'HIGH_RISK' ? 'bg-red-50 border-red-200 text-red-700' :
                  assessment.riskLevel === 'CAUTION' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {assessment.riskLevel === 'HIGH_RISK' ? <AlertOctagon className="w-6 h-6" /> :
                   assessment.riskLevel === 'CAUTION' ? <AlertTriangle className="w-6 h-6" /> :
                   <ShieldCheck className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">
                    {assessment.riskLevel === 'HIGH_RISK' ? 'Critical Payment Gate Warning' :
                     assessment.riskLevel === 'CAUTION' ? 'Verification Advisory Gate' :
                     'Payment Safety Clearance'}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono font-medium">
                    Transfer: ₹{amount} to {recipientName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Content */}
            <div className="space-y-3 text-xs">
              <div className={`p-4 rounded-xl border ${
                assessment.riskLevel === 'HIGH_RISK' ? 'bg-red-50 border-red-200 text-red-900' :
                assessment.riskLevel === 'CAUTION' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <p className="font-semibold">{assessment.summary}</p>
                <p className="mt-1 text-[11px] opacity-90">{assessment.recommendedAction}</p>
              </div>

              {/* Specific Triggered Evidence */}
              {assessment.triggeredRules.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                    Triggered Safety Interventions:
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {assessment.triggeredRules.map(r => (
                      <div key={r.ruleId} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-800">
                        <strong className="text-emerald-900">{r.ruleName}:</strong> {r.explanation}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* High-Risk Mandatory Friction Checkboxes */}
              {assessment.riskLevel === 'HIGH_RISK' && (
                <div className="space-y-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                  <span className="text-[11px] font-bold text-red-900 uppercase tracking-wider block">
                    Mandatory Safety Friction Requirements
                  </span>
                  <label className="flex items-start gap-2 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={understoodPinMyth}
                      onChange={(e) => setUnderstoodPinMyth(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-0"
                    />
                    <span className="text-[11px] leading-relaxed">
                      I understand that scanning this QR code or approving this request will <strong>DEBIT ₹{amount}</strong> from my account, NOT credit me.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userAcknowledgedWarning}
                      onChange={(e) => setUserAcknowledgedWarning(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-0"
                    />
                    <span className="text-[11px] leading-relaxed">
                      I have verified the recipient's true identity through a separate phone call or trusted channel.
                    </span>
                  </label>
                </div>
              )}

              {assessment.riskLevel === 'NO_KNOWN_WARNING' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] leading-relaxed">
                  <strong>Notice:</strong> No overt threat was matched, but no automated software can guarantee total safety. Always check the official beneficiary name on your banking app before authorizing your PIN.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelPayment}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Cancel &amp; Stop Payment (Safest)</span>
              </button>

              {assessment.riskLevel === 'HIGH_RISK' ? (
                <button
                  type="button"
                  onClick={handleForceProceedPayment}
                  disabled={!understoodPinMyth || !userAcknowledgedWarning}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-red-50 border border-slate-200 text-red-700 text-xs rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  <span>Override &amp; Proceed Simulated Payment</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleForceProceedPayment}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs rounded-xl transition-all font-medium"
                >
                  <span>Proceed to Final Screen</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
