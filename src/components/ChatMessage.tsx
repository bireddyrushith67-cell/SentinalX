import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Shield } from 'lucide-react';
import { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRegenerate, isLastAssistant }) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple Markdown renderer for code blocks, bold text, lists, and headers
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].match(/^[a-z0-9_-]+/i) ? lines[0].trim() : 'code';
        const codeText = lines[0].match(/^[a-z0-9_-]+/i) ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900 text-zinc-100 text-xs font-mono shadow-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 text-zinc-400 text-[11px] border-b border-zinc-700">
              <span className="font-semibold text-zinc-300">{language}</span>
              <button
                onClick={() => handleCopy(codeText)}
                className="flex items-center gap-1.5 hover:text-zinc-100 transition-colors py-0.5 px-2 rounded hover:bg-zinc-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy code'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Format standard markdown (headers, bold, lists, paragraphs)
      return (
        <div key={index} className="space-y-2 text-sm leading-7 text-zinc-900 font-sans">
          {part.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('#### ')) {
              return (
                <h4 key={pIdx} className="text-sm font-bold text-zinc-900 mt-3 mb-1">
                  {paragraph.replace(/^#### /, '')}
                </h4>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={pIdx} className="text-base font-bold text-zinc-900 mt-3 mb-1">
                  {paragraph.replace(/^### /, '')}
                </h3>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={pIdx} className="text-lg font-bold text-zinc-900 mt-4 mb-2">
                  {paragraph.replace(/^## /, '')}
                </h2>
              );
            }
            if (paragraph.startsWith('# ')) {
              return (
                <h1 key={pIdx} className="text-xl font-bold text-zinc-900 mt-4 mb-2">
                  {paragraph.replace(/^# /, '')}
                </h1>
              );
            }

            if (paragraph.startsWith('> ')) {
              return (
                <blockquote key={pIdx} className="border-l-4 border-emerald-600 pl-3.5 py-1 text-zinc-700 italic bg-emerald-50/40 rounded-r-lg my-2 text-xs sm:text-sm">
                  {paragraph.replace(/^>\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                </blockquote>
              );
            }

            if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
              const items = paragraph.trim().split('\n');
              return (
                <ul key={pIdx} className="list-disc list-outside ml-5 space-y-1 my-2">
                  {items.map((item, i) => (
                    <li key={i} dangerouslySetInnerHTML={{
                      __html: item.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                  ))}
                </ul>
              );
            }

            if (/^\d+\.\s/.test(paragraph.trim())) {
              const items = paragraph.trim().split('\n');
              return (
                <ol key={pIdx} className="list-decimal list-outside ml-5 space-y-1 my-2">
                  {items.map((item, i) => (
                    <li key={i} dangerouslySetInnerHTML={{
                      __html: item.replace(/^\d+\.\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                  ))}
                </ol>
              );
            }

            return (
              <p 
                key={pIdx}
                dangerouslySetInnerHTML={{
                  __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }}
              />
            );
          })}
        </div>
      );
    });
  };

  const isUser = message.role === 'user';

  return (
    <div className={`py-4 px-4 sm:px-6 w-full ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className={`flex gap-3 max-w-3xl w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
        )}

        <div className={`space-y-1.5 ${isUser ? 'max-w-xl' : 'flex-1'}`}>
          <div className={
            isUser
              ? 'bg-zinc-100 text-zinc-900 px-4 py-2.5 rounded-3xl text-sm leading-6 inline-block font-sans'
              : 'text-zinc-900 text-sm leading-relaxed font-sans'
          }>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div>
                {renderFormattedContent(message.content)}
              </div>
            )}
          </div>

          {!isUser && (
            <div className="flex items-center gap-1 text-zinc-400 pt-1 text-xs">
              <button
                onClick={() => handleCopy(message.content)}
                className="p-1.5 hover:text-zinc-800 rounded-md hover:bg-zinc-100 transition-colors"
                title="Copy response"
                aria-label="Copy response"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setLiked(liked === true ? null : true)}
                className={`p-1.5 rounded-md hover:bg-zinc-100 transition-colors ${liked === true ? 'text-zinc-800 font-bold' : 'hover:text-zinc-800'}`}
                title="Good response"
                aria-label="Good response"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => setLiked(liked === false ? null : false)}
                className={`p-1.5 rounded-md hover:bg-zinc-100 transition-colors ${liked === false ? 'text-zinc-800 font-bold' : 'hover:text-zinc-800'}`}
                title="Bad response"
                aria-label="Bad response"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>

              {isLastAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 hover:text-zinc-800 rounded-md hover:bg-zinc-100 transition-colors flex items-center gap-1 ml-1"
                  title="Regenerate response"
                  aria-label="Regenerate response"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
