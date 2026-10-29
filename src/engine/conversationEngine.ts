/**
 * Deterministic Conversation and Scam Detection Engine for SentinelX.
 * Created by Rushith.
 *
 * Implements:
 * 1. Contextual scam detection rules across all major fraud archetypes.
 * 2. Proper response formatting: Verdict, Why, What to do, Reporting (1930 & cybercrime.gov.in).
 * 3. Legitimate & Ambiguous case handling.
 * 4. Multi-turn conversation memory for follow-up questions.
 * 5. Distinct greeting and identity handling.
 */

export type RiskVerdict = 'HIGH RISK' | 'CAUTION' | 'NO KNOWN WARNING';

export interface SentinelAnalysisResult {
  reply: string;
  verdict?: RiskVerdict;
  intent: 'GREETING' | 'IDENTITY' | 'INVESTIGATION' | 'FOLLOW_UP';
  category?: string;
}

export interface ChatMessageContext {
  role: string;
  content: string;
}

/**
 * Main conversation evaluator
 */
export function evaluateSentinelChat(
  userMessage: string,
  history: ChatMessageContext[] = []
): SentinelAnalysisResult {
  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase();

  // 1. GREETING & RESTART
  // Only trigger greeting when it is an explicit greeting or restart request
  const isGreetingOrRestart = 
    /^(hi|hello|hey|namaste|good morning|good afternoon|good evening|greetings)\b/i.test(trimmed) ||
    /^(restart|start over|reset|new conversation|new chat|clear chat|reset chat)$/i.test(trimmed);

  if (isGreetingOrRestart && trimmed.split(/\s+/).length <= 4) {
    return {
      reply: 'I am SentinelX, created by Rushith. How can I help you today?',
      intent: 'GREETING'
    };
  }

  // 2. IDENTITY & CREATOR QUERIES
  const isIdentityQuery = 
    lower.includes('who created you') ||
    lower.includes('who made you') ||
    lower.includes('who built you') ||
    lower.includes('who developed you') ||
    lower.includes('who is your creator') ||
    lower.includes('who designed you') ||
    lower.includes('who coded you') ||
    lower.includes('who are you') ||
    lower.includes('what is your name') ||
    lower.includes('tell me about yourself');

  if (isIdentityQuery) {
    return {
      reply: `I am **SentinelX**, an AI scam detection and digital fraud prevention assistant created by **Rushith**.

My mission is to analyze suspicious messages, payment requests, QR codes, links, and phone calls to help you detect fraud before any money is lost.

You can describe any suspicious situation or paste a message in your own words, and I will evaluate the risk level for you. How can I help you today?`,
      intent: 'IDENTITY'
    };
  }

  // 3. CONVERSATION MEMORY: Check for Follow-Up Inquiries
  // If the user asks a follow-up ("what should I do next?", "can I get my money back?", "is it safe?", "how to block account?")
  const followUpMatch = detectFollowUpIntent(lower);
  if (followUpMatch) {
    const priorContext = extractPriorTopic(history);
    const followUpResponse = buildContextualFollowUp(followUpMatch, priorContext);
    return {
      reply: followUpResponse.reply,
      verdict: followUpResponse.verdict,
      intent: 'FOLLOW_UP',
      category: priorContext.category
    };
  }

  // 4. DETAILED SCAM DETECTION & FREE-TEXT UNDERSTANDING
  return analyzeScenario(userMessage, lower, history);
}

/**
 * Detect follow-up intent types
 */
function detectFollowUpIntent(lower: string): string | null {
  if (
    /^(what should i do next\??|what next\??|what do i do now\??|what should i do\??|what to do next\??|next steps\??)$/i.test(lower) ||
    lower.includes('what should i do next') ||
    lower.includes('what do i do now') ||
    lower.includes('what steps should i take')
  ) {
    return 'NEXT_STEPS';
  }

  if (
    lower.includes('get my money back') ||
    lower.includes('recover my money') ||
    lower.includes('refund my money') ||
    lower.includes('can i get a refund') ||
    lower.includes('reverse the transaction') ||
    lower.includes('can bank reverse') ||
    lower.includes('money back')
  ) {
    return 'RECOVER_MONEY';
  }

  if (
    /^(is it safe\??|is that safe\??|is it secure\??|can i trust (them|him|this|her)\??|should i trust (them|him|this|her)\??)$/i.test(lower) ||
    lower === 'is it safe' ||
    lower === 'is it safe?' ||
    lower === 'is it secure' ||
    lower === 'is it secure?' ||
    lower === 'can i trust them?'
  ) {
    return 'IS_IT_SAFE';
  }

  if (
    lower.includes('how do i block') ||
    lower.includes('how to block my account') ||
    lower.includes('freeze my bank') ||
    lower.includes('block upi') ||
    lower.includes('freeze account') ||
    lower.includes('stop transaction')
  ) {
    return 'BLOCK_ACCOUNT';
  }

  if (
    lower.includes('i already entered my pin') ||
    lower.includes('i entered pin') ||
    lower.includes('i gave them the otp') ||
    lower.includes('i shared the otp') ||
    lower.includes('i scanned it already') ||
    lower.includes('i transferred the money') ||
    lower.includes('i already paid') ||
    lower.includes('money is deducted') ||
    lower.includes('money got debited')
  ) {
    return 'COMPROMISED_CREDENTIALS';
  }

  if (
    lower.includes('threatening') ||
    lower.includes('blackmail') ||
    lower.includes('police threat') ||
    lower.includes('calling my family') ||
    lower.includes('threatened me')
  ) {
    return 'THREATS_HARASSMENT';
  }

  if (
    lower.includes('how to report') ||
    lower.includes('where do i report') ||
    lower.includes('file a complaint') ||
    lower.includes('lodge complaint')
  ) {
    return 'HOW_TO_REPORT';
  }

  return null;
}

interface PriorTopicContext {
  category: string;
  verdict: RiskVerdict;
  summary: string;
  involvesQrPin: boolean;
  involvesAnydesk: boolean;
  involvesLoan: boolean;
  involvesOtp: boolean;
  involvesFakeProof: boolean;
  involvesImpersonation: boolean;
}

/**
 * Inspect conversation history to understand context for follow-up questions
 */
function extractPriorTopic(history: ChatMessageContext[]): PriorTopicContext {
  const combinedText = history.map(m => m.content).join(' ').toLowerCase();

  const involvesQrPin = combinedText.includes('qr') || combinedText.includes('pin') || combinedText.includes('olx');
  const involvesAnydesk = combinedText.includes('anydesk') || combinedText.includes('teamviewer') || combinedText.includes('screen-share') || combinedText.includes('apk');
  const involvesLoan = combinedText.includes('loan') || combinedText.includes('processing fee') || combinedText.includes('nbfc');
  const involvesOtp = combinedText.includes('otp') || combinedText.includes('cvv') || combinedText.includes('credentials');
  const involvesFakeProof = combinedText.includes('screenshot') || combinedText.includes('spoof') || combinedText.includes('fakepay');
  const involvesImpersonation = combinedText.includes('electricity') || combinedText.includes('kyc') || combinedText.includes('police') || combinedText.includes('customs');

  let category = 'GENERAL_UPI_FRAUD';
  let summary = 'the previously analyzed transaction';

  if (involvesQrPin) {
    category = 'REVERSE_QR_COLLECT';
    summary = 'the reverse QR code / UPI PIN collect request scenario';
  } else if (involvesAnydesk) {
    category = 'REMOTE_ACCESS';
    summary = 'the remote screen-sharing / malicious APK request';
  } else if (involvesLoan) {
    category = 'LOAN_EXTORTION';
    summary = 'the fake loan app / upfront processing fee demand';
  } else if (involvesOtp) {
    category = 'OTP_THEFT';
    summary = 'the unauthorized OTP / secret credential solicitation';
  } else if (involvesFakeProof) {
    category = 'FAKE_PAYMENT_PROOF';
    summary = 'the fake UPI payment screenshot / spoofed transfer claim';
  } else if (involvesImpersonation) {
    category = 'OFFICIAL_IMPERSONATION';
    summary = 'the bank/utility/police impersonation threat';
  }

  return {
    category,
    verdict: 'HIGH RISK',
    summary,
    involvesQrPin,
    involvesAnydesk,
    involvesLoan,
    involvesOtp,
    involvesFakeProof,
    involvesImpersonation
  };
}

/**
 * Build contextual follow-up answers using prior context
 */
function buildContextualFollowUp(
  intent: string,
  context: PriorTopicContext
): { reply: string; verdict: RiskVerdict } {
  if (intent === 'RECOVER_MONEY' || intent === 'COMPROMISED_CREDENTIALS') {
    return {
      verdict: 'HIGH RISK',
      reply: `### 🛡️ SentinelX Follow-Up Advisory

- **Verdict:** HIGH RISK
- **Why:** In UPI, transactions are immediate, irrevocable bank-to-bank settlements. However, if reported within the **2 to 3 hour "golden window"**, cyber police and destination banks can freeze the scammer's beneficiary account or place a financial lien on the stolen funds before they are withdrawn through ATMs or mule accounts.
- **What to do:**
  1. **Dial 1930 Immediately:** Call the National Cybercrime Reporting Helpline at **1930** without delay. Provide your 12-digit UPI UTR/RRN number, exact deduction timestamp, and the recipient's UPI ID / bank details.
  2. **File a Bank Chargeback Dispute:** Call your bank's 24x7 fraud prevention helpline and demand an immediate chargeback/dispute ticket for fraudulent UPI debit.
  3. **Dispute Inside Your UPI App:** Open Google Pay / PhonePe / Paytm -> Go to **Transaction History** -> Select the transaction -> Tap **Report a Problem** or **Raise Dispute**.
  4. **Register Formal Cybercrime Complaint:** Submit a complaint at **https://www.cybercrime.gov.in/** and download the acknowledgement receipt to submit to your home bank branch.
- **Reporting:** Immediate reporting is critical. Call **1930** right now and log into **https://www.cybercrime.gov.in/**.`
    };
  }

  if (intent === 'NEXT_STEPS') {
    if (context.involvesAnydesk) {
      return {
        verdict: 'HIGH RISK',
        reply: `### 🛡️ SentinelX Follow-Up Advisory

- **Verdict:** HIGH RISK
- **Why:** With screen-sharing tools (AnyDesk, TeamViewer, RustDesk) or rogue APKs, attackers maintain background visibility over your device and can read incoming SMS OTPs.
- **What to do:**
  1. **Cut Network Access Immediately:** Put your smartphone in **Airplane Mode** or disable Wi-Fi and mobile data to terminate any active remote session.
  2. **Uninstall the Application:** Locate and delete AnyDesk / TeamViewer / QuickSupport and remove any recently downloaded APK files from your "Downloads" folder.
  3. **Revoke Permissions:** Go to your phone's **Settings > Accessibility** and ensure no unauthorized service or app has active accessibility controls.
  4. **Block UPI & NetBanking:** Call your bank immediately and request a temporary block on UPI payments and mobile banking until your device is verified clean.
- **Reporting:** If you noticed unauthorized transactions or entered any PIN/password while the tool was running, call **1930** and visit **https://www.cybercrime.gov.in/** immediately.`
      };
    }

    if (context.involvesLoan) {
      return {
        verdict: 'HIGH RISK',
        reply: `### 🛡️ SentinelX Follow-Up Advisory

- **Verdict:** HIGH RISK
- **Why:** Rogue loan apps use psychological intimidation, continuous spam calls, and threats to contact your phonebook to extort money. Paying them once only invites larger demands.
- **What to do:**
  1. **Do Not Pay:** Under no circumstances should you pay the demanded "processing fee", "file charge", or extorted repayment amount.
  2. **Revoke App Permissions & Uninstall:** Open phone **Settings > Apps > [Suspicious Loan App] > Permissions** and revoke Contacts, Storage, Camera, and SMS permissions, then uninstall the app.
  3. **Notify Close Contacts:** Post a brief status or message to close friends and family stating that your contacts were compromised by a malicious spam app and to ignore any fake messages or morphed photos.
  4. **Block Harassment Numbers:** Block incoming numbers and report them on WhatsApp / Truecaller.
- **Reporting:** File a criminal harassment and financial extortion complaint at **1930** and **https://www.cybercrime.gov.in/**. Also report the illegal entity on RBI's Sachet portal at **https://sachet.rbi.org.in/**.`
      };
    }

    return {
      verdict: 'HIGH RISK',
      reply: `### 🛡️ SentinelX Follow-Up Advisory

- **Verdict:** HIGH RISK
- **Why:** Based on ${context.summary}, taking protective measures immediately prevents unauthorized account access and financial loss.
- **What to do:**
  1. **Break Off Contact:** Do not reply, click links, scan QR codes, or engage with the sender/caller. Block their number on WhatsApp and phone dialer.
  2. **Verify Through Official Channels:** If a bank, utility, or delivery was mentioned, check exclusively via the official app or website—never using numbers provided in the message.
  3. **Protect Your Account:** If you shared any credentials or clicked a link, reset your UPI PIN and NetBanking passwords immediately.
- **Reporting:** If you experienced financial loss or shared sensitive bank credentials, call **1930** immediately and lodge an official complaint at **https://www.cybercrime.gov.in/**.`
    };
  }

  if (intent === 'BLOCK_ACCOUNT') {
    return {
      verdict: 'HIGH RISK',
      reply: `### 🛡️ SentinelX Follow-Up Advisory

- **Verdict:** HIGH RISK
- **Why:** Freezing or blocking compromised UPI credentials prevents any further unauthorized debits if an OTP, PIN, or remote session was compromised.
- **What to do:**
  1. **Bank Emergency Helpline:** Call your bank's dedicated 24x7 debit card & fraud hotline (printed on the back of your ATM card or official bank portal) and state: *"I suspect unauthorized access, please freeze my UPI and NetBanking services."*
  2. **Deregister / Block in UPI App:**
     - In **Google Pay:** Tap Profile > Bank Account > select your bank > tap three dots > select *Remove Account*.
     - In **PhonePe:** Tap Profile > Payment Instruments > select bank > scroll down > tap *Unlink Bank Account*.
     - In **Paytm:** Tap Profile > Payment Settings > UPI & Linked Bank Accounts > *Deregister UPI Profile*.
  3. **Reset UPI PIN:** Once secured, set a completely new UPI PIN from a safe device.
- **Reporting:** If any unauthorized transaction has already cleared, dial **1930** immediately and register a complaint at **https://www.cybercrime.gov.in/**.`
    };
  }

  if (intent === 'IS_IT_SAFE') {
    return {
      verdict: 'HIGH RISK',
      reply: `### 🛡️ SentinelX Follow-Up Advisory

- **Verdict:** HIGH RISK
- **Why:** It is **NOT safe** to proceed with this transaction or request. The warning signs identified in ${context.summary} are classic hallmarks of digital financial fraud.
- **What to do:**
  1. **Do Not Proceed:** Do not scan the QR code, do not enter your UPI PIN, do not approve the collect request, and do not transfer any money.
  2. **Remember the Golden Rule:** Entering your UPI PIN or scanning a QR code is strictly for SENDING money. You never need to enter a PIN to receive payments or refunds.
  3. **Cut Communication:** Block the caller or sender immediately.
- **Reporting:** If you have already sent money or entered your PIN, call **1930** immediately and report at **https://www.cybercrime.gov.in/**.`
    };
  }

  if (intent === 'THREATS_HARASSMENT') {
    return {
      verdict: 'HIGH RISK',
      reply: `### 🛡️ SentinelX Follow-Up Advisory

- **Verdict:** HIGH RISK
- **Why:** Fraudsters routinely use intimidation, fake arrest warrants (digital arrest), customs contraband threats, and power cutoff warnings to induce panic and prevent victims from thinking rationally.
- **What to do:**
  1. **Understand Legal Reality:** Indian law enforcement (Police, CBI, ED, Customs) never issues arrest warrants over WhatsApp video calls, nor do they settle criminal matters via UPI payments or "safe custody accounts".
  2. **Do Not Transfer Any Money:** Paying extortion demands will only lead to escalating demands.
  3. **Preserve Evidence:** Take screenshots of chat logs, caller numbers, transaction requests, and payment VPAs.
  4. **Block the Callers:** Do not answer further calls from unknown numbers.
- **Reporting:** Report harassment, impersonation, and digital arrest threats to the National Cybercrime Helpline at **1930** and submit full details at **https://www.cybercrime.gov.in/**.`
    };
  }

  // Default follow-up reporting guide
  return {
    verdict: 'HIGH RISK',
    reply: `### 🛡️ SentinelX Follow-Up Advisory

- **Verdict:** HIGH RISK
- **Why:** Prompt action significantly increases the chance of freezing fraudulent transactions and blacklisting the scammer's UPI handles.
- **What to do:**
  1. Have the exact 12-digit UPI UTR/Reference number, transaction date, and recipient UPI ID ready.
  2. Contact your bank's fraud control department immediately to raise an unauthorized debit dispute.
  3. File a report on the National Cybercrime Portal with screenshots of the conversation and payment logs.
- **Reporting:** Call India's Cybercrime Helpline at **1930** immediately and submit an official complaint at **https://www.cybercrime.gov.in/**.`
  };
}

/**
 * Core Scenario Analyzer implementing deterministic rules across all scam archetypes
 */
function analyzeScenario(
  originalMessage: string,
  lower: string,
  history: ChatMessageContext[]
): SentinelAnalysisResult {

  // ==========================================
  // RULE 1: REVERSE QR CODE & SCAN TO RECEIVE
  // ==========================================
  const mentionsQr = /\b(qr|qr code|barcode|code)\b/i.test(lower);
  const mentionsScan = /\b(scan|scanning|scanner)\b/i.test(lower);
  const mentionsReceive = /\b(receive|credit|get money|get paid|claim money|accept money|refund|cashback|advance payment)\b/i.test(lower);
  const mentionsPin = /\b(pin|mpin|upi pin)\b/i.test(lower);
  const isReverseQr = 
    (mentionsQr || mentionsScan) && mentionsReceive ||
    mentionsPin && mentionsReceive ||
    /\b(buyer sent qr|sent me qr|scan.*receive|enter pin to receive|enter mpin to get)\b/i.test(lower) ||
    lower.includes('olx') && (mentionsQr || mentionsScan || mentionsReceive);

  if (isReverseQr) {
    return {
      verdict: 'HIGH RISK',
      intent: 'INVESTIGATION',
      category: 'REVERSE_QR_FRAUD',
      reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** HIGH RISK
- **Why:** This is a classic **Reverse QR Code scam**. In the UPI protocol governed by NPCI, scanning a QR code or entering your UPI PIN is **exclusively for authorizing an outgoing debit (sending money)**. You NEVER need to scan a QR code or enter a PIN to receive money, advance payments, refunds, or cashback.
- **What to do:**
  1. **Do Not Scan or Enter PIN:** Refuse to scan the QR code and never enter your UPI PIN. If you enter your PIN, money will be instantly deducted from your bank account.
  2. **Educate the Buyer/Sender:** Inform them that receiving money in UPI only requires sharing your mobile number or UPI ID (VPA). You do not need to take any action or enter any credentials.
  3. **Block and Report:** Block the sender on WhatsApp / messaging apps, and report their profile on the platform (e.g. OLX, Quikr, Facebook Marketplace).
- **Reporting:** If you have already scanned the QR code or entered your PIN and money was deducted, immediately call India's Cybercrime Helpline at **1930** and register a complaint at **https://www.cybercrime.gov.in/** to freeze the recipient's bank account.`
    };
  }

  // ==========================================
  // RULE 2: FAKE LOAN DEMANDS & EXTORTION
  // ==========================================
  const mentionsLoan = /\b(loan|instant loan|loan app|sanction letter|credit line|loan approved)\b/i.test(lower);
  const mentionsLoanHarassment = /\b(processing fee|advance fee|file charge|security deposit|gallery|contacts|threaten|harass|extort|morph|double interest)\b/i.test(lower);

  if (mentionsLoan && mentionsLoanHarassment) {
    return {
      verdict: 'HIGH RISK',
      intent: 'INVESTIGATION',
      category: 'FAKE_LOAN_SCAM',
      reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** HIGH RISK
- **Why:** This is an **Illegal Lending & Extortion Scam**. Fraudulent loan apps lure victims with instant approvals without paperwork, then demand upfront "processing fees" or "insurance deposits" via personal UPI before disbursing funds, or access phone contacts to blackmail victims with morphed images. Legitimate RBI-registered banks and NBFCs **never** ask for advance fees through personal UPI handles.
- **What to do:**
  1. **Do Not Pay Upfront Fees:** Never pay any processing fee, GST, or verification deposit to receive a loan. Any upfront demand is 100% fraudulent.
  2. **Revoke App Permissions & Delete:** Immediately open **Settings > Apps > [Loan App]**, revoke permissions for Contacts, Storage, Camera, and Location, then uninstall the app.
  3. **Warn Contacts:** If the app threatens to contact your phonebook, inform your family and friends that a rogue data-scraping app has stolen your contacts and to ignore any suspicious messages.
  4. **Verify Legitimacy:** Only borrow from lenders listed on the official Reserve Bank of India (RBI) list of registered NBFCs.
- **Reporting:** If money has been extorted or you are facing harassment, immediately dial **1930** and register a complaint at **https://www.cybercrime.gov.in/**. You should also report the predatory app on the RBI Sachet Portal at **https://sachet.rbi.org.in/**.`
    };
  }

  // ==========================================
  // RULE 3: SCREEN-SHARING APPS & MALICIOUS APKS
  // ==========================================
  const remoteAppNames = ['anydesk', 'teamviewer', 'quicksupport', 'rustdesk', 'zoho assist', 'airdroid', 'screen share', 'remote desktop'];
  const mentionsRemoteApp = remoteAppNames.some(app => lower.includes(app));
  const mentionsApk = /\b(\.apk|download apk|install apk|customer care asked.*install|update app|kyc\.apk|support\.apk)\b/i.test(lower);

  if (mentionsRemoteApp || mentionsApk) {
    return {
      verdict: 'HIGH RISK',
      intent: 'INVESTIGATION',
      category: 'REMOTE_ACCESS_SCAM',
      reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** HIGH RISK
- **Why:** This is a **Remote Access & Malware Takeover Scam**. Remote desktop applications (AnyDesk, TeamViewer, QuickSupport) and unverified APK files allow attackers to view your screen in real time, record your keystrokes, and read incoming SMS OTPs. Legitimate banks and customer support will **never** ask you to install screen-sharing software or sideload APKs.
- **What to do:**
  1. **Do Not Install or Share Code:** Do not download the application and never disclose the 9-digit remote access code or session ID.
  2. **If Already Installed:** Immediately turn on **Airplane Mode** to cut off internet access, then uninstall the application and delete the APK from your phone's "Downloads" folder.
  3. **Check Accessibility Settings:** Go to your phone's **Settings > Accessibility** and ensure no unauthorized services are turned ON.
  4. **Temporarily Freeze Banking:** Call your bank to temporarily block your NetBanking and UPI handle until you confirm your device is clean.
- **Reporting:** If an attacker had access to your device or if money was debited, call the National Cybercrime Helpline at **1930** immediately and register a complaint at **https://www.cybercrime.gov.in/**.`
    };
  }

  // ==========================================
  // RULE 4: OTP & CREDENTIAL THEFT
  // ==========================================
  const asksForSecret = 
    /\b(share|give|tell|send|enter|provide|disclose)\b.{0,30}\b(otp|one time password|upi pin|mpin|cvv|netbanking password|atm pin)\b/i.test(lower) ||
    /\b(otp|upi pin|mpin|cvv)\b.{0,30}\b(required|needed|to verify|to unblock|to claim|to process refund|to update kyc)\b/i.test(lower);

  const isLegitimateWarning = /\b(never share|do not share|don't share|will never ask)\b/i.test(lower);

  if (asksForSecret && !isLegitimateWarning) {
    return {
      verdict: 'HIGH RISK',
      intent: 'INVESTIGATION',
      category: 'CREDENTIAL_THEFT',
      reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** HIGH RISK
- **Why:** Demanding an **OTP, UPI PIN, CVV, or NetBanking password** is a critical red flag for credential theft. Authentication secrets are strictly meant for your own authorization on secure screens. Neither banks, RBI, police, nor payment apps (Google Pay, PhonePe, Paytm) ever ask customers to disclose their OTPs or PINs.
- **What to do:**
  1. **Never Share OTP or PIN:** Under no circumstances should you read out, copy, or type your OTP/PIN for someone else.
  2. **Read the SMS Content:** Carefully inspect the text of the OTP message; it will show what action it authorizes (e.g. "INR 15,000 debit" or "new device registration").
  3. **If Already Shared:** Call your bank's emergency helpline immediately to block your debit card, NetBanking login, and UPI handle before funds are transferred out.
- **Reporting:** If credentials were stolen or money was deducted, dial **1930** immediately and register a case at **https://www.cybercrime.gov.in/**.`
    };
  }

  // ==========================================
  // RULE 5: FAKE BANK CALLS, DIGITAL ARREST & THREATENING IMPERSONATION
  // ==========================================
  const mentionsAuthority = /\b(sbi manager|hdfc officer|rbi officer|cyber cell|cbi|police|customs|customs officer|narcotics|telecom regulatory|trai notice|electricity department|power corporation)\b/i.test(lower);
  const mentionsThreat = /\b(power will be disconnected|electricity will be cut|power cut at 9:30|sim will be blocked|account blocked|account frozen|digital arrest|arrest warrant|illegal parcel|drugs in parcel)\b/i.test(lower);

  if (mentionsAuthority || mentionsThreat) {
    return {
      verdict: 'HIGH RISK',
      intent: 'INVESTIGATION',
      category: 'IMPERSONATION_EXTORTION',
      reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** HIGH RISK
- **Why:** This matches a **High-Pressure Impersonation Scam** (such as Digital Arrest, Electricity Disconnection, or Bank Account Suspension). Scammers manufacture false urgency (threat of power cut tonight, police raid, or frozen accounts) from personal 10-digit mobile numbers to bypass rational thinking and extort immediate UPI transfers.
- **What to do:**
  1. **Hang Up and Disconnect:** Do not join video calls (Skype, WhatsApp) and do not call back phone numbers sent via SMS.
  2. **Verify Sender ID:** Official government entities, utility boards (e.g. BESCOM, MSEDCL), and banks send SMS alerts from verified 6-character alpha headers (e.g., \`VM-BESCOM\`, \`VK-SBIINB\`), never personal 10-digit mobile numbers.
  3. **Independent Verification:** Verify your utility bill or bank account status exclusively through your official bank branch or utility portal.
  4. **Never Transfer "Verification Fees":** Law enforcement and banks never ask citizens to transfer money to "security accounts" to clear investigations.
- **Reporting:** Report impersonation and digital extortion attempts promptly to the National Cybercrime Helpline at **1930** and lodge a report at **https://www.cybercrime.gov.in/**.`
    };
  }

  // ==========================================
  // RULE 6: REFUND SCAMS & ACCIDENTAL TRANSFERS
  // ==========================================
  const mentionsAccidentalTransfer = 
    /\b(sent money by mistake|transferred by mistake|sent by mistake|wrongly credited|accidentally sent|refund my money|return my money)\b/i.test(lower) ||
    /\b(refund desk|amazon refund|flipkart refund|swiggy refund|irctc refund)\b.{0,40}\b(call|click|collect|upi)\b/i.test(lower);

  if (mentionsAccidentalTransfer) {
    return {
      verdict: 'HIGH RISK',
      intent: 'INVESTIGATION',
      category: 'REFUND_SCAM',
      reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** HIGH RISK
- **Why:** This is an **Accidental Transfer / Fake Refund Scam**. Scammers forge a fake bank credit SMS or claim they mistakenly transferred money into your account, pressuring you to immediately "return" it via UPI. In other cases, they send an incoming UPI Collect Request disguised as a refund credit.
- **What to do:**
  1. **Check Real Bank Statement:** Open your official bank app and check your actual account balance and statement. Never rely on SMS messages from personal numbers or caller screenshots.
  2. **Do Not Send Money Back:** If money was not actually credited to your bank account, you have no obligation to return anything.
  3. **Official Reversal Process:** If genuine funds arrived by error, advise the caller to contact their own bank to initiate an official inter-bank banking reversal. Never send money back via personal UPI transfers.
  4. **Reject Collect Requests:** Decline any incoming UPI Collect Requests; approving a collect request debits your bank account.
- **Reporting:** If you fell for the trick and transferred money, immediately contact **1930** and lodge a complaint at **https://www.cybercrime.gov.in/**.`
    };
  }

  // ==========================================
  // RULE 7: FAKE CUSTOMER CARE SEARCH NUMBERS
  // ==========================================
  const mentionsCustomerCare = /\b(customer care|support number|helpline|toll free|customer service)\b/i.test(lower);
  const mentionsSearchEngine = /\b(google search|searched on google|google maps|found number on search|called number)\b/i.test(lower);

  if (mentionsCustomerCare && (mentionsSearchEngine || /\b(paid fee|download app|refund support)\b/i.test(lower))) {
    return {
      verdict: 'HIGH RISK',
      intent: 'INVESTIGATION',
      category: 'FAKE_CUSTOMER_CARE',
      reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** HIGH RISK
- **Why:** This is a **Fake Customer Care SEO Scam**. Fraudsters manipulate Google Search results and Google Maps listings with their own 10-digit mobile numbers, pretending to be customer care for Swiggy, Zomato, airlines, couriers, or banks. When called, they pose as executives and instruct victims to install screen-sharing apps or pay "registration fees".
- **What to do:**
  1. **Use Only In-App Support:** Never search for customer service phone numbers on Google. Only contact support through the verified mobile app (e.g. Swiggy Help Center, airline app).
  2. **Never Pay for Customer Service:** Genuine customer service representatives will never ask you to pay a verification fee (e.g. ₹5, ₹10) or download AnyDesk/TeamViewer.
  3. **Block the Number:** Disconnect and block the fraudulent number immediately.
- **Reporting:** If money was deducted or remote access was granted, immediately dial **1930** and report the incident at **https://www.cybercrime.gov.in/**.`
    };
  }

  // ==========================================
  // RULE 8: FAKE UPI TRANSFER PROOFS & SPOOF APPS
  // ==========================================
  const mentionsFakeScreenshot = 
    /\b(fake upi|fake payment|fake screenshot|paytm spoof|fakepay|spoofed app|customer showed screenshot|buyer showed payment|payment screenshot|utr not reflecting|money not credited)\b/i.test(lower);

  if (mentionsFakeScreenshot) {
    return {
      verdict: 'HIGH RISK',
      intent: 'INVESTIGATION',
      category: 'FAKE_PAYMENT_PROOF',
      reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** HIGH RISK
- **Why:** Scammers use **Spoof UPI Apps** (like FakePay, Paytm Spoof) to generate counterfeit payment success screens, forged 12-digit UTR numbers, and fake audio announcements. They show this screen to merchants or sellers to convince them that payment has been made when no money was transferred.
- **What to do:**
  1. **Never Trust Customer Screenshots:** Never release merchandise, goods, or services based on a screenshot or screen shown by a buyer.
  2. **Verify on Your Own Device:** Only confirm payment by checking the credit notification in your own bank app, official bank SMS, or physical Soundbox.
  3. **12-Digit UTR Verification:** A genuine UPI transaction always produces a 12-digit bank reference (UTR) that reflects directly in your bank account ledger.
  4. **Rule of Thumb:** If your own bank balance has not increased, the transaction has **not** occurred.
- **Reporting:** If merchandise or services were handed over without payment, contact local police and dial **1930** to file a fraud complaint at **https://www.cybercrime.gov.in/** with the scammer's phone number and CCTV footage.`
    };
  }

  // ==========================================
  // RULE 9: SUSPICIOUS LINKS & OBFUSCATED DOMAINS
  // ==========================================
  const mentionsShortener = /\b(bit\.ly|tinyurl\.com|is\.gd|t\.co|cutt\.ly|ngrok\.io|rb\.gy)\b/i.test(lower);
  const mentionsSuspiciousDomain = /\b([a-z0-9-]+)\.(xyz|top|work|click|link|online|live|club|cam|tk|ml)\b/i.test(lower);
  const mentionsLookalike = /\b(sbi-[a-z0-9]+\.|hdfc-[a-z0-9]+\.|paytm-[a-z0-9]+\.|kyc-[a-z0-9]+\.)\b/i.test(lower);

  if (mentionsShortener || mentionsSuspiciousDomain || mentionsLookalike) {
    return {
      verdict: 'HIGH RISK',
      intent: 'INVESTIGATION',
      category: 'PHISHING_LINK',
      reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** HIGH RISK
- **Why:** The message contains a **Suspicious or Obfuscated Domain Pattern**. Shortened URLs and lookalike banking domains are heavily used in phishing attacks to clone official banking portals and harvest login credentials, debit card CVVs, and UPI MPINs.
- **What to do:**
  1. **Do Not Click the Link:** Never click on links sent via SMS or messaging apps claiming to update KYC, unblock SIM cards, or credit rewards.
  2. **Official Banking Domains:** Indian banks operate on reserved domains (such as \`.bank.in\`, \`onlinesbi.sbi\`, \`hdfcbank.com\`), never generic or high-risk TLDs.
  3. **If Clicked Already:** If you entered any banking password or PIN on that page, immediately change your credentials and call your bank to freeze netbanking.
- **Reporting:** Report phishing links and SMS headers to the Cybercrime Portal at **https://www.cybercrime.gov.in/** and dial **1930**.`
    };
  }

  // ==========================================
  // RULE 10: LEGITIMATE CASES (No known warning)
  // ==========================================
  const isPhysicalStorePayment = 
    /\b(paying|paid|buy|buying|groceries|supermarket|tea stall|shop|store|counter|vegetables|restaurant|petrol pump|fuel)\b/i.test(lower) &&
    /\b(qr|scanner|upi|pay|scanned)\b/i.test(lower) &&
    !mentionsReceive && !asksForSecret && !mentionsRemoteApp;

  const isFriendFamilyTransfer = 
    /\b(sending|sent|transfer|transferring|split bill|sharing bill)\b/i.test(lower) &&
    /\b(friend|brother|sister|mom|dad|father|mother|family|colleague|roommate)\b/i.test(lower) &&
    !mentionsReceive && !asksForSecret;

  const isLegitimateBankCreditAlert = 
    /\b(credited with|salary credited|refund from amazon|refund from flipkart|acct credited)\b/i.test(lower) &&
    !/\b(click|claim|call|scan|collect|win|won)\b/i.test(lower);

  const isGeneralHowToQuestion =
    /^(how do i pay a merchant|how does upi work|how to use upi safely|what is a vpa|how to set up upi)\b/i.test(lower);

  if (isPhysicalStorePayment || isFriendFamilyTransfer || isLegitimateBankCreditAlert || isGeneralHowToQuestion) {
    return {
      verdict: 'NO KNOWN WARNING',
      intent: 'INVESTIGATION',
      category: 'LEGITIMATE_OPERATION',
      reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** NO KNOWN WARNING
- **Why:** This describes standard, legitimate UPI functionality. Scanning a merchant's printed QR code at a store counter to send payment, or transferring funds to a known, verified contact using their UPI ID, follows normal payment protocol. No indicators of reverse collect, credential phishing, or remote app coercion were detected.
- **What to do:**
  1. **Verify Beneficiary Name:** Always check the merchant or recipient name displayed on your app screen before confirming the transaction.
  2. **Ensure Secure NPCI PIN Screen:** Make sure you enter your UPI PIN exclusively on the official, system-level UPI PIN screen.
  3. **Confirm Transaction Amount:** Verify that the amount entered matches your intended payment.
- **Reporting:** Since no fraudulent signals were identified and no credentials compromised, no report is necessary. If you ever detect unauthorized deductions in the future, promptly call **1930** and visit **https://www.cybercrime.gov.in/**.`
    };
  }

  // ==========================================
  // RULE 11: AMBIGUOUS / CAUTION CASES
  // ==========================================
  // If the user's message is brief, asking about general safety of sharing UPI ID, or unknown callers
  const isVagueOrCaution = 
    lower.includes('is it safe to share upi id') ||
    lower.includes('is it safe to give my phone number') ||
    lower.includes('someone messaged me on olx') ||
    lower.includes('got a call from unknown number') ||
    lower.includes('can someone hack me with just my upi') ||
    lower.includes('can someone hack me with just my phone') ||
    lower.split(/\s+/).length < 7;

  return {
    verdict: 'CAUTION',
    intent: 'INVESTIGATION',
    category: 'AMBIGUOUS_SCENARIO',
    reply: `### 🛡️ SentinelX Investigation Result

- **Verdict:** CAUTION
- **Why:** The information provided does not show an active scam attempt, but requires cautious handling. Sharing your public UPI ID (e.g., \`username@bank\`) or phone number is technically safe for receiving payments, but scammers often follow up with fake payment screenshots, collect requests, or reverse QR traps.
- **What to do:**
  1. **Remember the Golden Rule:** You **never** need to scan a QR code, approve a collect request, or enter your UPI PIN to receive money.
  2. **Never Share OTPs:** Do not share any OTP, passwords, or install remote access software (AnyDesk, TeamViewer).
  3. **Provide More Details:** If the person sent you a specific message, link, QR code, or payment screenshot, paste the exact text here and SentinelX will perform a full security evaluation.
- **Reporting:** If no credentials were shared and no money was transferred, no report is required. If money has been lost, immediately call India's Cybercrime Helpline at **1930** and report at **https://www.cybercrime.gov.in/**.`
  };
}
