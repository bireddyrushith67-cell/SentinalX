export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export type HonestModelId = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.0-flash-lite';
export type AIModel = HonestModelId;

export interface ModelInfo {
  id: HonestModelId;
  name: string;
  provider: string;
  description: string;
  contextWindow: string;
  badge: string;
}

export const HONEST_MODELS: ModelInfo[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google DeepMind',
    description: 'Fast, high-accuracy model ideal for real-time scam detection, fake UPI checks, and threat analysis.',
    contextWindow: '1M tokens',
    badge: 'Recommended'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google DeepMind',
    description: 'Advanced reasoning and forensic analysis for complex fraud schemes, obfuscated links, and security audits.',
    contextWindow: '2M tokens',
    badge: 'Deep Reasoning'
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'Google DeepMind',
    description: 'Ultra-low latency model for quick message verification and lightweight scam queries.',
    contextWindow: '1M tokens',
    badge: 'Fast'
  }
];
