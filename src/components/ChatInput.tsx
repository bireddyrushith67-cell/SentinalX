import React, { useRef, useEffect } from 'react';
import { ArrowUp, Paperclip, Globe, Lightbulb, Mic } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <div className="relative rounded-3xl border border-zinc-300 bg-white p-2.5 shadow-sm focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask SentinelX or paste a suspicious message, UPI ID, or payment proof..."
          rows={1}
          className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none max-h-48 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1 px-1">
          {/* Action pills & attach buttons */}
          <div className="flex items-center gap-1 text-zinc-500">
            <button
              type="button"
              className="p-1.5 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              title="Attach screenshot or receipt"
              aria-label="Attach screenshot or receipt"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="flex items-center gap-1 text-xs py-1 px-2.5 hover:bg-zinc-100 rounded-full text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              title="Search scam databases"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Threat Intel</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-1 text-xs py-1 px-2.5 hover:bg-zinc-100 rounded-full text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              title="Forensic reasoning"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Forensics</span>
            </button>
          </div>

          {/* Voice & Send button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              title="Voice input"
              aria-label="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onSend}
              disabled={!hasText || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                hasText && !isLoading
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }`}
              title="Send to SentinelX"
              aria-label="Send to SentinelX"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-[11px] text-zinc-500">
          SentinelX is an educational AI safety prototype. Always verify credits directly in your official banking app.
        </p>
      </div>
    </div>
  );
};
