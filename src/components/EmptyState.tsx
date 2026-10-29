import React from 'react';
import { ShieldAlert, QrCode, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export interface SuggestionItem {
  title: string;
  desc: string;
  icon: any;
  badge: string;
  prompt: string;
}

export const SUGGESTED_INVESTIGATIONS: SuggestionItem[] = [
  {
    title: 'Stop Fake UPI Transfers',
    desc: 'Verify fake payment screenshot, edited SMS alert, or 12-digit UTR',
    icon: ShieldAlert,
    badge: 'High Threat',
    prompt: 'How can I detect if a customer is showing me a fake UPI payment screenshot or spoofed app (like Paytm Spoof / FakePay)? What are the exact signs to look for?'
  },
  {
    title: 'Reverse QR Code Trap',
    desc: 'Why scanning a QR code or entering a PIN always debits funds',
    icon: QrCode,
    badge: 'Golden Rule',
    prompt: 'A buyer on OLX sent me a QR code saying I must scan it and enter my UPI PIN to receive ₹5,000 for my item. Is this legitimate or a scam? Explain how UPI PIN works.'
  },
  {
    title: 'Electricity / KYC Threat',
    desc: 'Analyze urgent SMS claiming power cutoff or SIM suspension',
    icon: AlertTriangle,
    badge: 'Impersonation',
    prompt: 'I received this message: "Dear consumer your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Call electricity officer immediately at 9876543210." Is this a scam?'
  },
  {
    title: 'Verify Suspect UPI ID / VPA',
    desc: 'Check if handles like refund.desk.sbi@ybl are spoofed',
    icon: ShieldCheck,
    badge: 'VPA Check',
    prompt: 'How do I verify whether a UPI ID like "sbi.customer.refund.desk@okhdfcbank" is an official bank handle or a scammer impersonating customer support?'
  }
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const suggestions = SUGGESTED_INVESTIGATIONS;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-2xl mx-auto my-auto animate-in fade-in duration-200">
      <div className="space-y-3 mb-8">
        {/* SentinelX Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-sm shadow-emerald-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 font-sans">
            SentinelX
          </h1>
          <p className="text-xs sm:text-sm font-medium text-emerald-700 mt-1">
            Detect. Verify. Prevent.
          </p>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          AI scam detection and digital fraud prevention system created by <strong className="text-zinc-700 font-semibold">Rushith</strong>.
        </p>
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3.5 sm:p-4 rounded-2xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/30 bg-white text-left transition-all shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-zinc-500 group-hover:text-emerald-700 transition-colors shrink-0" />
                  <span className="text-sm font-semibold text-zinc-900 leading-snug">{item.title}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors shrink-0">
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Quick Creator / Identity query shortcut */}
      <div className="mt-5 flex items-center justify-center">
        <button
          onClick={() => onSelectPrompt("Who created you and what is your mission?")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-900 text-xs font-medium transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>Ask SentinelX: &ldquo;Who created you?&rdquo;</span>
        </button>
      </div>
    </div>
  );
};
