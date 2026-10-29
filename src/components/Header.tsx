import React, { useState } from 'react';
import { PanelLeft, ChevronDown, Check, Shield, Key, Sparkles, Brain, Zap } from 'lucide-react';
import { HonestModelId, HONEST_MODELS } from '../types/chat';

interface HeaderProps {
  currentModel: HonestModelId;
  onSelectModel: (model: HonestModelId) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenApiKeyModal: () => void;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentModel,
  onSelectModel,
  sidebarOpen,
  onToggleSidebar,
  onOpenApiKeyModal,
  hasCustomKey
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeModel = HONEST_MODELS.find(m => m.id === currentModel) || HONEST_MODELS[0];

  const getModelIcon = (id: HonestModelId) => {
    switch (id) {
      case 'gemini-2.5-pro':
        return Brain;
      case 'gemini-2.0-flash-lite':
        return Zap;
      case 'gemini-2.5-flash':
      default:
        return Sparkles;
    }
  };

  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-3 sm:px-4 sticky top-0 z-20">
      <div className="flex items-center gap-2">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}

        {/* SentinelX Brand Pill */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-bold tracking-tight">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>SentinelX</span>
        </div>

        {/* Honest Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 text-xs sm:text-sm font-semibold text-zinc-800 transition-colors cursor-pointer"
            aria-label="Select Gemini model"
          >
            <span>{activeModel.name}</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-zinc-100 text-zinc-600 rounded-md font-normal">
              {activeModel.badge}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-zinc-200 shadow-xl p-1.5 z-50 text-xs animate-in fade-in duration-100">
              <div className="px-3 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Google DeepMind Models</span>
                <span className="text-[10px] text-zinc-400 font-normal">Verified Specs</span>
              </div>

              {HONEST_MODELS.map(m => {
                const Icon = getModelIcon(m.id);
                const isSelected = m.id === currentModel;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-zinc-100 text-zinc-900' : 'hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-zinc-400'}`} />
                    <div className="flex-1">
                      <div className="font-semibold text-zinc-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          {m.name}
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                            isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {m.badge}
                          </span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{m.description}</div>
                      <div className="text-[10px] text-zinc-400 mt-1 font-mono">{m.contextWindow} context window</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Bring Your Own Key (BYOK) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenApiKeyModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
            hasCustomKey
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
          }`}
          title="Bring Your Own Gemini API Key"
        >
          <Key className={`w-3.5 h-3.5 ${hasCustomKey ? 'text-emerald-600' : 'text-zinc-400'}`} />
          <span className="hidden sm:inline">
            {hasCustomKey ? 'Custom Key' : 'API Key'}
          </span>
          <span className={`w-2 h-2 rounded-full ${hasCustomKey ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
        </button>
      </div>
    </header>
  );
};
