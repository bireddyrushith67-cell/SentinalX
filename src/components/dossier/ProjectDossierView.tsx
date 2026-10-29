import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  Cpu, 
  Target, 
  Compass
} from 'lucide-react';

export const ProjectDossierView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-800">
      {/* Title Card with Emerald to Teal Gradient (avoiding blue/purple/pink) */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 border border-emerald-700/60 p-8 rounded-3xl shadow-md text-white relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-700/60 pb-5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-950 text-emerald-200 border border-emerald-600 rounded-full font-mono text-xs font-semibold">
              HCL Jigsaw Level 2 — Innovation Project
            </span>
            <span className="px-3 py-1 bg-white/10 text-emerald-100 rounded-full font-mono text-xs">
              Class 9 Category
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <h1 className="text-3xl font-extrabold font-mono tracking-tight text-white">
            UPI GUARD: Explainable, Proactive UPI Scam Detection &amp; Prevention
          </h1>
          <p className="text-base text-emerald-200 font-medium">
            “Detect. Verify. Prevent.”
          </p>
          <p className="text-xs text-emerald-100/90 max-w-3xl leading-relaxed pt-2">
            A student innovation prototype proving that algorithmic transparency, deterministic protocol knowledge,
            and pre-payment behavioral gates can halt digital financial fraud before money transfers occur.
          </p>
        </div>
      </div>

      {/* Section 1: Problem Statement & Research */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-800 border-b border-slate-100 pb-3">
          <Target className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
            1. Problem Statement &amp; Research Foundations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">The Core Vulnerability in Indian UPI</h3>
            <p>
              Unified Payments Interface (UPI) handles over 14 billion transactions monthly in India.
              While UPI's underlying cryptography (PKI, AES, NPCI 2-factor authentication) is mathematically secure,
              fraudsters target the <em>human-in-the-loop</em> via psychological manipulation, reverse-payment myths,
              and remote screen sharing.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">The "Sub-3-Second" Decision Dilemma</h3>
            <p>
              Research into consumer fraud shows victims make payment authorization decisions in under 3 seconds
              when confronted with urgency (e.g. "power cutoff at 9:30 PM", "OLX advance payment QR code").
              Existing fraud response in India is predominantly reactive (filing FIRs after money is lost via 1930).
              <strong>UPI GUARD shifts the paradigm from reactive complaint to proactive, explainable prevention.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Design Thinking Process */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-800 border-b border-slate-100 pb-3">
          <Compass className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
            2. Design-Thinking Process
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-mono text-emerald-800 font-bold block text-[11px]">PHASE I: EMPATHIZE &amp; OBSERVE</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Interviewed everyday citizens, elderly users, and small marketplace sellers who fell victim to reverse-collect requests.
              Key takeaway: Users genuinely believe scanning a QR code or entering a PIN can credit money to their account.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-mono text-emerald-800 font-bold block text-[11px]">PHASE II: PROTOTYPE ARCHITECTURE</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Built a hybrid engine: deterministic contextual rules for absolute guarantees (PIN/OTP hard gates) +
              structured threat repository + optional LLM plain-language translation.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-mono text-emerald-800 font-bold block text-[11px]">PHASE III: BENCHMARK VALIDATION</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Crafted 44 multi-class adversarial and legitimate test fixtures to strictly verify that legitimate bank notifications
              containing words like "OTP" and "cashback" are never flagged falsely.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: System Architecture */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-800 border-b border-slate-100 pb-3">
          <Cpu className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
            3. System Architecture &amp; Technical Execution
          </h2>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto leading-relaxed">
          {`[ USER INPUT ] (SMS Text / Phone / UPI VPA / URL / Simulated Payment)
       │
       ▼
[ VALIDATOR & NORMALIZER ] (Rejects Malformed, Checks Sensitive Secrets, Masks PII)
       │
       ├──► [ 12 CONTEXTUAL DETECTION RULES ]
       │      • Rule-01: Authentication Secret Solicitation (PIN/OTP) [CRITICAL]
       │      • Rule-02: Reverse Debit Myth (PIN to Receive) [CRITICAL]
       │      • Rule-03: QR Code Reverse Fraud [HIGH]
       │      • Rule-04: Remote Access Coercion (AnyDesk/APK) [HIGH]
       │      • Rule-05: Official Impersonation (Bank/Police) [HIGH]
       │      • Rule-06: Unsolicited Lottery / Reward Bait [MEDIUM]
       │      • Rule-07: Utility Disconnection Extortion [HIGH]
       │      • Rule-08: Detained Parcel / Customs Extortion [HIGH]
       │      • Rule-09: Suspicious Lookalike / Obfuscated Link [MEDIUM]
       │      • Rule-10: Collect Request Misuse [HIGH]
       │      • Rule-11: Artificial Urgency & Intimidation [LOW]
       │      • Rule-12: Adversarial Prompt Injection Defense [MEDIUM]
       │
       ├──► [ THREAT INVESTIGATION DATABASE ]
       │      • Local Indexed Demonstration Ledger (Staleness >90d flags)
       │      • Official Provider Abstraction (NCCRP / I4C / 1930)
       │
       ▼
[ RISK SYNTHESIS & SAFETY GATE ]
       │
       ├──► HIGH RISK: Mandatory Architectural Override (Hard Gate Blocks Proceed)
       ├──► CAUTION: Friction Delay & Independent Verification Checklist
       └──► NO KNOWN WARNING: Standard Caution Notice (Zero Warranty)`}
        </div>
      </div>

      {/* Section 4: Implemented vs Future Features */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-800 border-b border-slate-100 pb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
            4. Feature Status: Implemented vs. Proposed Roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h3 className="font-semibold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Fully Implemented in Current Working Prototype
            </h3>
            <ul className="space-y-1.5 text-slate-700 text-[11px]">
              <li>✓ 12 Contextual, explainable detection rules with configurable weights.</li>
              <li>✓ Hard architectural gate overriding any prompt claiming PIN receives money.</li>
              <li>✓ Local structured threat database with staleness markers and exact search.</li>
              <li>✓ Pre-Payment simulated sandbox with mandatory friction &amp; cancellation flow.</li>
              <li>✓ User-reviewed incident report builder with JSON &amp; text export.</li>
              <li>✓ 44-case automated benchmark suite with real-time confusion matrix.</li>
              <li>✓ Server-side Gemini explainability assistant with deterministic offline fallback.</li>
              <li>✓ Full unit test suite passing via Node test runner (`node:test`).</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-slate-500" />
              Proposed Future Roadmap (Subject to Regulatory Authorization)
            </h3>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li>✦ Native Android Accessibility Service integration for on-device real-time overlay during live UPI app usage.</li>
              <li>✦ Direct authenticated API integration with I4C Citizen Portal upon regulatory authorization.</li>
              <li>✦ Federated edge learning for zero-knowledge scam signature sharing across devices.</li>
              <li>✦ Multi-lingual audio warning synthesis for non-English/vernacular users in tier-2/3 regions.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 5: Judges' Demonstration Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-800 border-b border-slate-100 pb-3">
          <Award className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
            5. Quick Tour for Competition Judges
          </h2>
        </div>

        <div className="space-y-2 text-xs text-slate-700">
          <p>To evaluate the full capability of UPI GUARD in under 3 minutes, follow this sequence:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 text-[11px] bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
            <li>
              <strong>Investigation Workspace:</strong> Click preset <em>"Electricity Cutoff Threat"</em> and click <em>Run Scan</em>. Note the HIGH RISK badge, rule breakdown, and demonstration record match.
            </li>
            <li>
              <strong>Legitimate Safety Check:</strong> Click preset <em>"Legitimate Bank OTP (Clean)"</em> and run scan. Notice it evaluates as <em>NO KNOWN WARNING</em> without false alarms, despite containing "OTP" and "UPI PIN".
            </li>
            <li>
              <strong>Pre-Payment Safety Gate:</strong> Navigate to the <em>Pre-Payment Gate</em> tab and click <em>"Proceed to Simulated Payment"</em>. Notice the mandatory high-risk friction blocking ordinary progression.
            </li>
            <li>
              <strong>Benchmark Evaluation Suite:</strong> Open the <em>Evaluation Lab</em> tab and click <em>"Rerun Full Test Suite"</em> to witness real-time execution across 44 adversarial scenarios.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
