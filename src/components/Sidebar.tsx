import React, { useState } from 'react';
import { 
  SquarePen, 
  MessageSquare, 
  Trash2, 
  PanelLeftClose, 
  Key, 
  ShieldCheck
} from 'lucide-react';
import { ChatSession } from '../types/chat';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenApiKeyModal: () => void;
  hasCustomKey: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onToggle,
  onOpenApiKeyModal,
  hasCustomKey
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        onClick={onToggle}
        className="fixed inset-0 bg-black/30 z-30 sm:hidden"
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 left-0 sm:relative w-64 bg-zinc-50 border-r border-zinc-200 h-screen flex flex-col justify-between shrink-0 select-none z-40 sm:z-auto transition-transform shadow-xl sm:shadow-none">
        {/* Top Controls */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={onToggle}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>

            <button
              onClick={onNewChat}
              className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
              title="New scan session"
              aria-label="New scan session"
            >
              <SquarePen className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Primary Button */}
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-800 hover:bg-zinc-200/60 transition-colors cursor-pointer"
          >
            <SquarePen className="w-4 h-4 text-emerald-700" />
            <span>New Investigation</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 text-xs">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Investigations
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-4 text-zinc-400 italic text-xs">
              No previous investigations
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onMouseEnter={() => setHoveredId(session.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-200/80 text-zinc-900 font-medium'
                      : 'text-zinc-700 hover:bg-zinc-200/50 hover:text-zinc-900'
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    <MessageSquare className="w-4 h-4 shrink-0 text-zinc-400 group-hover:text-emerald-700" />
                    <span className="truncate">{session.title || 'New inquiry'}</span>
                  </div>

                  {(hoveredId === session.id || isActive) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors shrink-0 cursor-pointer"
                      title="Delete inquiry"
                      aria-label="Delete inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* SentinelX & Rushith Attribution Footer */}
        <div className="p-3 border-t border-zinc-200 space-y-2">
          <button
            onClick={onOpenApiKeyModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-xs text-zinc-700 font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-emerald-700" />
              <span>Gemini API Key</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              hasCustomKey ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'
            }`}>
              {hasCustomKey ? 'Custom' : 'Default'}
            </span>
          </button>

          <div className="px-3 py-2 rounded-xl bg-zinc-100/70 border border-zinc-200/60 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <div className="font-semibold text-zinc-900 text-xs leading-none">SentinelX</div>
                <div className="text-[10px] text-zinc-500 mt-1">Created by <span className="font-semibold text-zinc-700">Rushith</span></div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
