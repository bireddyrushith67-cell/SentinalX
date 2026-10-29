import React from 'react';
import { Bot, ShieldAlert, Sparkles, X } from 'lucide-react';
import { ExplanationResponse } from '../../services/aiExplainer';

interface AIExplanationCardProps {
  explanationData: ExplanationResponse | null;
  onClose: () => void;
  isLoading: boolean;
}

export const AIExplanationCard: React.FC<AIExplanationCardProps> = ({
  explanationData,
  onClose,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-5 space-y-3 animate-pulse shadow-sm">
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>Generating Plain-Language Explainability Synthesis...</span>
        </div>
        <p className="text-xs text-slate-500">
          Synthesizing deterministic engine findings, separating direct observations from assumptions, and formatting actionable advice.
        </p>
      </div>
    );
  }

  if (!explanationData) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <Bot className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 font-mono">Plain-Language Safety Assistant</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                explanationData.source === 'gemini_ai'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {explanationData.source === 'gemini_ai' ? 'Gemini 2.5 Flash Grounded' : 'Deterministic Logic Model'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{explanationData.notice}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close Assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Render Markdown / Structured text */}
      <div className="text-xs text-slate-700 space-y-3 leading-relaxed font-sans">
        {explanationData.explanation.split('\n\n').map((paragraph, idx) => {
          if (paragraph.startsWith('###')) {
            return (
              <h4 key={idx} className="text-xs font-bold text-emerald-800 uppercase tracking-wider pt-2 border-t border-slate-100">
                {paragraph.replace(/###\s*/, '')}
              </h4>
            );
          }
          if (paragraph.startsWith('-')) {
            const items = paragraph.split('\n').filter(Boolean);
            return (
              <ul key={idx} className="list-disc list-inside space-y-1.5 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {items.map((item, i) => (
                  <li key={i} dangerouslySetInnerHTML={{
                    __html: item.replace(/^-\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
                  }} />
                ))}
              </ul>
            );
          }
          return (
            <p 
              key={idx}
              dangerouslySetInnerHTML={{
                __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
              }}
            />
          );
        })}
      </div>

      {/* Safety Guardrail reminder */}
      <div className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Assistant strictly explains engine data; it cannot override deterministic rules or invent claims.</span>
        </span>
      </div>
    </div>
  );
};
