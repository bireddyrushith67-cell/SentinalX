/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { EmptyState, SUGGESTED_INVESTIGATIONS } from './components/EmptyState';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Message, ChatSession, HonestModelId } from './types/chat';
import { HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'sentinelx_app_sessions';
const API_KEY_STORAGE = 'sentinelx_custom_api_key';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  const [model, setModel] = useState<HonestModelId>('gemini-2.5-flash');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  // Bring Your Own API Key state
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(API_KEY_STORAGE) || '';
    } catch {
      return '';
    }
  });

  const handleSaveApiKey = (newKey: string) => {
    setCustomApiKey(newKey);
    try {
      if (newKey) {
        localStorage.setItem(API_KEY_STORAGE, newKey);
      } else {
        localStorage.removeItem(API_KEY_STORAGE);
      }
    } catch {
      // ignore
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to create the initial SentinelX greeting for new conversations
  const createWelcomeMessage = (): Message => ({
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    content: 'I am SentinelX, created by Rushith. How can I help you today?',
    timestamp: new Date().toISOString()
  });

  const createInitialSession = (id = `session-${Date.now()}`): ChatSession => ({
    id,
    title: 'New investigation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [createWelcomeMessage()]
  });

  // Initialize sessions from localStorage or default
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: ChatSession) => {
            if (!s.messages || s.messages.length === 0) {
              return { ...s, messages: [createWelcomeMessage()] };
            }
            return s;
          });
        }
      }
    } catch {
      // ignore
    }
    return [createInitialSession('session-1')];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-1';
  });

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  // Current active session
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleNewChat = () => {
    const newSession = createInitialSession();
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const fresh = createInitialSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    setInput('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];

    // Auto-title session based on the first user inquiry
    const isFirstUserMessage = messages.filter(m => m.role === 'user').length === 0;
    const sessionTitle = isFirstUserMessage 
      ? messageText.substring(0, 32) + (messageText.length > 32 ? '...' : '')
      : currentSession.title;

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: sessionTitle,
          updatedAt: new Date().toISOString(),
          messages: updatedMessages
        };
      }
      return s;
    }));

    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (customApiKey) {
        headers['x-custom-api-key'] = customApiKey;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          model
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantReply = data.reply || "SentinelX analysis completed. Please provide any additional indicators you would like to verify.";

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date().toISOString()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            updatedAt: new Date().toISOString(),
            messages: [...updatedMessages, assistantMessage]
          };
        }
        return s;
      }));
    } catch (err) {
      console.error('Failed to send message:', err);
      const fallbackMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `### ⚠️ Connection Notice\n\nI was unable to complete the analysis due to a connection issue. Please verify your connection or try again.\n\n- **Reporting:** If you have already lost money or shared your UPI PIN/OTP, dial India's National Cybercrime Helpline immediately at **1930** or lodge a complaint at **https://www.cybercrime.gov.in/**.`,
        timestamp: new Date().toISOString()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            updatedAt: new Date().toISOString(),
            messages: [...updatedMessages, fallbackMsg]
          };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (messages.length === 0 || isLoading) return;
    const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserIndex;
    const lastUserMsg = messages[actualIndex].content;

    // Remove following assistant message
    const sliced = messages.slice(0, actualIndex);
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: sliced };
      }
      return s;
    }));

    handleSendMessage(lastUserMsg);
  };

  return (
    <div className="flex h-screen bg-white text-zinc-900 font-sans overflow-hidden">
      {/* Sidebar with investigations & SentinelX / Rushith identity */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        hasCustomKey={Boolean(customApiKey)}
      />

      {/* Main Conversation Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        {/* Header with Honest Model Selector & BYOK Modal trigger */}
        <Header
          currentModel={model}
          onSelectModel={setModel}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
          hasCustomKey={Boolean(customApiKey)}
        />

        {/* Chat Thread or Empty State */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <EmptyState onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          ) : (
            <div className="flex-1 max-w-3xl w-full mx-auto py-4">
              {messages.map((message, idx) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRegenerate={handleRegenerate}
                  isLastAssistant={idx === messages.length - 1 && message.role === 'assistant'}
                />
              ))}

              {/* Suggestions grid displayed on new conversation start right below the greeting */}
              {messages.length === 1 && messages[0].role === 'assistant' && (
                <div className="px-4 sm:px-6 pt-2 pb-4 animate-in fade-in duration-200">
                  <div className="max-w-3xl mx-auto space-y-3 pl-0 sm:pl-11">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Suggested Investigations
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SUGGESTED_INVESTIGATIONS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(item.prompt)}
                            className="p-3.5 rounded-2xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/40 bg-white text-left transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-zinc-500 group-hover:text-emerald-700 transition-colors shrink-0" />
                                <span className="text-xs sm:text-sm font-semibold text-zinc-900 leading-snug">{item.title}</span>
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

                    <div className="pt-2 flex items-center justify-start">
                      <button
                        onClick={() => handleSendMessage("Who created you and what is your mission?")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-900 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Ask SentinelX: &ldquo;Who created you?&rdquo;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="py-4 px-4 sm:px-6 w-full flex justify-start">
                  <div className="flex gap-3 max-w-3xl w-full">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-sm pt-1">
                      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSendMessage()}
          isLoading={isLoading}
        />
      </div>

      {/* Bring Your Own Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        customKey={customApiKey}
        onSaveKey={handleSaveApiKey}
      />
    </div>
  );
}
