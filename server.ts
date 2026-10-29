import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

import { evaluateSentinelChat } from './src/engine/conversationEngine.ts';

// API: Chat Endpoint with Honest Models, Deterministic Engine & BYOK
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, model } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const priorHistory = messages.slice(0, -1);

  // 1. Evaluate deterministically using SentinelX Core Engine
  const deterministicResult = evaluateSentinelChat(lastUserMsg, priorHistory);

  // Model selection (default to gemini-2.5-flash)
  const allowedModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-lite'];
  const targetModel = allowedModels.includes(model) ? model : 'gemini-2.5-flash';

  // If intent was explicit GREETING or IDENTITY, return the dedicated response immediately
  if (deterministicResult.intent === 'GREETING' || deterministicResult.intent === 'IDENTITY') {
    return res.json({
      reply: deterministicResult.reply,
      verdict: deterministicResult.verdict,
      model: targetModel,
      source: 'sentinel_core_engine'
    });
  }

  // Check for Custom API key in request header or body (BYOK)
  const customKeyHeader = req.headers['x-custom-api-key'] || req.headers['x-gemini-api-key'];
  const customKey = typeof customKeyHeader === 'string' ? customKeyHeader.trim() : (req.body.apiKey ? String(req.body.apiKey).trim() : '');
  
  const serverKey = process.env.GEMINI_API_KEY;
  const effectiveApiKey = (customKey && customKey.length > 5) 
    ? customKey 
    : ((serverKey && serverKey !== 'MY_GEMINI_API_KEY') ? serverKey : '');

  // If no effective key is configured, use SentinelX's deterministic detection engine directly
  if (!effectiveApiKey) {
    return res.json({ 
      reply: deterministicResult.reply,
      verdict: deterministicResult.verdict,
      model: targetModel,
      source: 'sentinel_core_engine',
      byok: Boolean(customKey)
    });
  }

  const systemInstruction = `You are SentinelX, an advanced AI security intelligence and digital fraud prevention assistant created by Rushith.

CRITICAL IDENTITY & GREETING RULES:
- Your name is SentinelX.
- You were created and developed by Rushith.
- If the user asks "who created you", "who made you", "who is your creator", "who built you", or about your origins, you MUST explicitly state that you are SentinelX, created by Rushith.
- If a new conversation starts or the user greets ("hi", "hello") or explicitly restarts ("restart", "reset"), respond ONLY with: "I am SentinelX, created by Rushith. How can I help you today?"
- NEVER repeat that greeting as the answer to any other user message.

CRITICAL INVESTIGATION RESPONSE FORMAT:
For EVERY investigated situation or suspicious scenario, you MUST structure your response with these exact sections:
- **Verdict:** [Must be exactly one of: HIGH RISK, CAUTION, or NO KNOWN WARNING]
- **Why:** [A short, clear explanation of the relevant warning signs, or why the scenario is legitimate or ambiguous]
- **What to do:** [Clear, practical, numbered step-by-step safety actions]
- **Reporting:** [If money has been lost or credentials exposed, advise contacting India's national cybercrime helpline 1930 promptly and visiting https://www.cybercrime.gov.in/]

CONVERSATION MEMORY:
- Maintain conversation memory across turns. If the user asks follow-up questions such as "what should I do next?", "is it safe?", "can I get my money back?", or "how do I block my account?", contextualize your answer based on what was discussed earlier in this conversation.

CORE UPI SECURITY PRINCIPLES:
- Scanning a QR code or entering a UPI PIN strictly DEBITS money. You NEVER need to enter a PIN or scan a QR code to receive money, advance payments, refunds, or cashbacks.
- Beware of: fake loan demands with upfront fees, fake customer care numbers found on Google search, remote desktop apps (AnyDesk, TeamViewer, RustDesk), fake UPI payment screenshots (Paytm Spoof/FakePay), accidental refund tricks, and urgent utility/KYC disconnection threats.
- Legitimate scenarios (paying at a physical grocery store counter, transferring to known family members) must be recognized with "Verdict: NO KNOWN WARNING".`;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

    // Map conversation history to Gemini contents format
    const contents = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: lastUserMsg }] }],
      config: {
        systemInstruction,
        temperature: 0.4,
      }
    });

    let reply = response.text?.trim() || deterministicResult.reply;
    // Enforce required Verdict structure if the model outputs an unformatted generic message
    if (!reply.includes('Verdict:')) {
      reply = deterministicResult.reply;
    }

    return res.json({ 
      reply, 
      verdict: deterministicResult.verdict,
      model: targetModel,
      source: 'gemini_api',
      byok: Boolean(customKey)
    });
  } catch (err: any) {
    console.error('SentinelX Chat API Error:', err?.message || err);
    return res.json({ 
      reply: deterministicResult.reply, 
      verdict: deterministicResult.verdict,
      model: targetModel, 
      source: 'sentinel_core_engine_fallback',
      error: err?.message || 'API request failed'
    });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`SentinelX server running on http://localhost:${port}`);
  });
}

startServer();
