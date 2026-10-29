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

// Conversational Fallback Engine when API key is not provided or rate limited
function generateSentinelXFallback(userMessage: string, history: Array<{ role: string; content: string }>): string {
  const lower = userMessage.toLowerCase();

  // Creator & Identity queries
  if (
    lower.includes('who created you') ||
    lower.includes('who made you') ||
    lower.includes('who built you') ||
    lower.includes('who developed you') ||
    lower.includes('creator') ||
    lower.includes('who are you') ||
    lower.includes('what is your name') ||
    lower.includes('what are you')
  ) {
    return `I am **SentinelX**, an AI-powered scam detection and digital fraud prevention assistant created by **Rushith**.

My mission is to help you detect, analyze, and prevent financial scams—especially fake UPI payment proofs, reverse QR code fraud, phishing messages, impersonation VPAs, and malicious screen-sharing requests.

How can I protect your transactions today?`;
  }

  // Greetings
  if (/^(hi|hello|hey|good morning|good evening|namaste)/i.test(lower)) {
    return `Hello! I am **SentinelX**, created by **Rushith** to protect you against digital fraud, fake UPI transfers, and online scams.

You can paste suspicious SMS messages, payment receipts, UPI IDs, QR code scenarios, or ask me any question about payment safety. What would you like to verify?`;
  }

  // Fake UPI transfer verification
  if (
    lower.includes('fake upi') ||
    lower.includes('fake transfer') ||
    lower.includes('fake screenshot') ||
    lower.includes('fake payment') ||
    lower.includes('spoof') ||
    lower.includes('edited screenshot')
  ) {
    return `### 🛡️ SentinelX Fake UPI Transfer Verification Guide

Scammers frequently use spoof payment generator apps (such as FakePay, Paytm Spoof) or edited screenshots to convince sellers they have transferred funds.

#### 🔍 Critical Signs of a Fake UPI Screenshot:
1. **Mismatched Fonts & Alignment:** Look closely at the transaction amount (₹), timestamp, and UTR/Reference number. Spoofed apps often use generic sans-serif fonts that don't match genuine banking typography.
2. **Missing Bank Notification:** Never trust the buyer's screen. A genuine UPI transfer **always** triggers an SMS and an in-app push notification directly from your own bank or UPI app.
3. **Delayed UTR / Invalid Reference:** Real UPI transaction references (RRN / UTR) are exactly 12 digits. If the UTR doesn't match an actual ledger credit in your bank statement, no money was received.
4. **"Payment Processing" vs "Success" Trick:** Scammers show a pending or timed-out screen and rush you to release goods.

#### ⚡ Rule of Thumb:
**If your own bank balance has not increased, the payment has NOT happened.** Never release goods or services based solely on a customer's screenshot.`;
  }

  // Reverse QR code collect scam
  if (
    lower.includes('qr') ||
    lower.includes('scan') ||
    lower.includes('pin to receive') ||
    lower.includes('reverse qr') ||
    lower.includes('receive money')
  ) {
    return `### 🚨 The Golden Rule of UPI Safety

> **“You NEVER need to enter a UPI PIN or scan a QR code to RECEIVE money.”**

#### How the Reverse QR Scam Works:
1. **The Trap:** A scammer pretending to buy your item on OLX, Facebook Marketplace, or Quikr claims they are sending payment via UPI.
2. **The Deception:** They send you a QR code or a collect request on Google Pay / PhonePe / Paytm, saying: *"Scan this QR and enter your PIN to claim the ₹5,000 credit."*
3. **The Result:** The moment you input your 4-digit or 6-digit UPI PIN, money is **debited from your bank account** and instantly transferred to the scammer.

#### 🛡️ Protection Checklist:
- **Receiving funds:** Only share your phone number or UPI ID (e.g. \`username@bank\`). The sender initiates the transfer; you do not need to press any button or approve anything.
- **Entering UPI PIN:** A PIN prompt is **strictly for authorizing an outflow/debit**.`;
  }

  // Electricity / KYC / APK scam
  if (
    lower.includes('electricity') ||
    lower.includes('kyc') ||
    lower.includes('sim block') ||
    lower.includes('power cutoff') ||
    lower.includes('apk') ||
    lower.includes('anydesk') ||
    lower.includes('rustdesk')
  ) {
    return `### ⚠️ High Risk Alert: Impersonation & Malicious APK Scam

#### Typical Scam Pattern:
*"Dear consumer, your electricity power will be disconnected tonight at 9:30 PM because your previous month's bill was not updated. Please immediately contact officer at 98xxxxxxx."*

#### Fraud Mechanics:
1. **Urgency & Panic:** They create an artificial countdown (power cutoff, SIM suspension, bank account freeze) to bypass your rational thinking.
2. **Personal Number:** Official power utility boards (BESCOM, MSEDCL, Tata Power, etc.) send messages from verified 6-character sender IDs (e.g., \`VM-BESCOM\`), never from ordinary 10-digit mobile numbers.
3. **Malicious APK or Screen Share:** When you call, they ask you to install an app (e.g., \`Electricity_Update.apk\`, AnyDesk, or TeamViewer QuickSupport) or transfer ₹10 for "verification". This grants them full remote access or intercepts your banking OTPs.

#### 🛑 Immediate Actions:
- Do **not** call the number in the SMS.
- Do **not** install any APK file sent via WhatsApp or Telegram.
- Verify your bill exclusively through the official utility app or portal.`;
  }

  // General scam investigation fallback
  return `### 🛡️ SentinelX Security Analysis

**Query:** *${userMessage.trim().substring(0, 75)}*

1. **Threat Evaluation:**
   - Always verify the origin of unrequested payment links, SMS alerts, and UPI collect requests.
   - Genuine financial institutions will **never** ask for your UPI PIN, OTP, CVV, or passwords over phone, email, or chat.

2. **Detection & Verification Steps:**
   - **Check Bank Balance:** Verify all incoming credits directly inside your bank app, not from third-party screenshots.
   - **Validate Identifiers:** Look out for impersonation handles such as \`support.desk.sbi@okhdfcbank\` or unofficial domains.
   - **Report Fraud:** If you suspect an ongoing scam in India, immediately dial **1930** (National Cyber Crime Helpline) or lodge a complaint at **cybercrime.gov.in** within the first 2-hour "golden period".

I am **SentinelX**, created by **Rushith**. Would you like me to inspect a specific message, link, or transaction identifier?`;
}

// API: Chat Endpoint with Honest Models & Bring Your Own Key (BYOK)
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, model } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const lastUserMsg = messages[messages.length - 1]?.content || '';

  // Check for Custom API key in request header or body (BYOK)
  const customKeyHeader = req.headers['x-custom-api-key'] || req.headers['x-gemini-api-key'];
  const customKey = typeof customKeyHeader === 'string' ? customKeyHeader.trim() : (req.body.apiKey ? String(req.body.apiKey).trim() : '');
  
  const serverKey = process.env.GEMINI_API_KEY;
  const effectiveApiKey = (customKey && customKey.length > 5) 
    ? customKey 
    : ((serverKey && serverKey !== 'MY_GEMINI_API_KEY') ? serverKey : '');

  // Model selection (default to gemini-2.5-flash)
  const allowedModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-lite'];
  const targetModel = allowedModels.includes(model) ? model : 'gemini-2.5-flash';

  const systemInstruction = `You are SentinelX, an advanced AI security intelligence and digital fraud prevention assistant created by Rushith.

CRITICAL IDENTITY RULES:
- Your name is SentinelX.
- You were created and developed by Rushith.
- If the user asks "who created you", "who made you", "who is your creator", "who built you", or about your origins, you MUST explicitly state that you are SentinelX, created by Rushith.
- You specialize in explainable scam detection, fake UPI payment verification, phishing forensics, and payment safety.
- Format all responses with clear Markdown headings, bullet points, risk level indicators (Low / Medium / High / Critical), and actionable advice.
- When explaining payment scams, emphasize the golden rule: Entering a UPI PIN always DEBITS money, never receives money.`;

  // If no effective key is configured, use SentinelX's intelligent fallback
  if (!effectiveApiKey) {
    const fallbackReply = generateSentinelXFallback(lastUserMsg, messages);
    return res.json({ 
      reply: fallbackReply, 
      model: targetModel,
      source: 'offline_heuristic_engine',
      byok: Boolean(customKey)
    });
  }

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
        temperature: 0.6,
      }
    });

    const reply = response.text || generateSentinelXFallback(lastUserMsg, messages);
    return res.json({ 
      reply, 
      model: targetModel,
      source: 'gemini_api',
      byok: Boolean(customKey)
    });
  } catch (err: any) {
    console.error('SentinelX Chat API Error:', err?.message || err);
    const fallbackReply = generateSentinelXFallback(lastUserMsg, messages);
    return res.json({ 
      reply: fallbackReply, 
      model: targetModel, 
      source: 'fallback_after_error',
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
