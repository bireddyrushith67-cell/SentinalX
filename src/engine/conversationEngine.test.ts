import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSentinelChat } from './conversationEngine.ts';

test('Greeting: Returns exact greeting on start/restart', () => {
  const res1 = evaluateSentinelChat('hello');
  assert.equal(res1.intent, 'GREETING');
  assert.equal(res1.reply, 'I am SentinelX, created by Rushith. How can I help you today?');

  const res2 = evaluateSentinelChat('restart');
  assert.equal(res2.intent, 'GREETING');
  assert.equal(res2.reply, 'I am SentinelX, created by Rushith. How can I help you today?');

  const res3 = evaluateSentinelChat('start over');
  assert.equal(res3.intent, 'GREETING');
  assert.equal(res3.reply, 'I am SentinelX, created by Rushith. How can I help you today?');
});

test('Identity: Attributes to SentinelX and Rushith', () => {
  const res = evaluateSentinelChat('Who created you?');
  assert.equal(res.intent, 'IDENTITY');
  assert.ok(res.reply.includes('SentinelX'));
  assert.ok(res.reply.includes('Rushith'));
});

test('Scam Detection: Reverse QR Code trap returns HIGH RISK and required sections', () => {
  const res = evaluateSentinelChat('A buyer on OLX sent a QR code saying I must scan it and enter my UPI PIN to receive payment for my bicycle.');
  assert.equal(res.verdict, 'HIGH RISK');
  assert.ok(res.reply.includes('**Verdict:** HIGH RISK'));
  assert.ok(res.reply.includes('**Why:**'));
  assert.ok(res.reply.includes('**What to do:**'));
  assert.ok(res.reply.includes('**Reporting:**'));
  assert.ok(res.reply.includes('1930'));
  assert.ok(res.reply.includes('https://www.cybercrime.gov.in/'));
  // Never returns just the greeting
  assert.notEqual(res.reply, 'I am SentinelX, created by Rushith. How can I help you today?');
});

test('Scam Detection: Fake loan demand with upfront processing fee returns HIGH RISK', () => {
  const res = evaluateSentinelChat('An instant loan app approved my 50000 loan but requires me to pay 2500 processing fee upfront before disbursement and threatens to contact my gallery.');
  assert.equal(res.verdict, 'HIGH RISK');
  assert.ok(res.reply.includes('**Verdict:** HIGH RISK'));
  assert.ok(res.reply.includes('1930'));
  assert.ok(res.reply.includes('cybercrime.gov.in'));
});

test('Scam Detection: Screen-sharing app AnyDesk coercion returns HIGH RISK', () => {
  const res = evaluateSentinelChat('Someone claiming to be customer service asked me to install AnyDesk so they can process my refund.');
  assert.equal(res.verdict, 'HIGH RISK');
  assert.ok(res.reply.includes('**Verdict:** HIGH RISK'));
  assert.ok(res.reply.includes('AnyDesk'));
  assert.ok(res.reply.includes('1930'));
});

test('Scam Detection: Electricity disconnection tonight urgency returns HIGH RISK', () => {
  const res = evaluateSentinelChat('Dear consumer your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer immediately at 9876543210.');
  assert.equal(res.verdict, 'HIGH RISK');
  assert.ok(res.reply.includes('**Verdict:** HIGH RISK'));
  assert.ok(res.reply.includes('1930'));
});

test('Scam Detection: Legitimate grocery store QR payment returns NO KNOWN WARNING', () => {
  const res = evaluateSentinelChat('I am paying 80 rupees at my local grocery store by scanning their printed merchant QR counter.');
  assert.equal(res.verdict, 'NO KNOWN WARNING');
  assert.ok(res.reply.includes('**Verdict:** NO KNOWN WARNING'));
  assert.ok(res.reply.includes('**Why:**'));
  assert.ok(res.reply.includes('**What to do:**'));
});

test('Scam Detection: Ambiguous query returns CAUTION', () => {
  const res = evaluateSentinelChat('Is it safe to share my UPI ID with someone?');
  assert.equal(res.verdict, 'CAUTION');
  assert.ok(res.reply.includes('**Verdict:** CAUTION'));
  assert.ok(res.reply.includes('**Why:**'));
  assert.ok(res.reply.includes('**What to do:**'));
});

test('Conversation Memory: Follow-up question "Can I get my money back?" uses prior history', () => {
  const history = [
    { role: 'user', content: 'A buyer sent me a QR code and I scanned it and entered my PIN to receive 5000 on OLX.' },
    { role: 'assistant', content: '### 🛡️ SentinelX Investigation Result\n\n- **Verdict:** HIGH RISK\n- **Why:** Reverse QR scam.' }
  ];

  const res = evaluateSentinelChat('Can I get my money back?', history);
  assert.equal(res.intent, 'FOLLOW_UP');
  assert.equal(res.verdict, 'HIGH RISK');
  assert.ok(res.reply.includes('golden window') || res.reply.includes('1930'));
  assert.ok(res.reply.includes('Chargeback'));
  assert.ok(res.reply.includes('https://www.cybercrime.gov.in/'));
});

test('Conversation Memory: Follow-up question "How do I block my account?" provides unlinking steps', () => {
  const history = [
    { role: 'user', content: 'Someone tricked me into sharing my OTP.' },
    { role: 'assistant', content: 'Verdict: HIGH RISK' }
  ];

  const res = evaluateSentinelChat('How do I block my account?', history);
  assert.equal(res.intent, 'FOLLOW_UP');
  assert.ok(res.reply.includes('Google Pay') || res.reply.includes('PhonePe') || res.reply.includes('Paytm'));
  assert.ok(res.reply.includes('1930'));
});
