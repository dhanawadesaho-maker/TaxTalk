import Groq from 'groq-sdk';

const MODEL = 'llama-3.3-70b-versatile';
const MAX_CONTEXT_MESSAGES = 20;

const SYSTEM_PROMPT = `You are TaxBot, an expert Indian tax and financial advisor powered by the latest AI.
You specialise in:
- Income Tax (IT Act 1961) — deductions under Section 80C, 80D, HRA, LTA, capital gains, ITR filing
- GST — registration, GSTR-1/3B filing, input tax credit, composition scheme
- Corporate Law — Companies Act 2013, ROC compliance, MCA filings, board resolutions
- Financial Planning — SIP, mutual funds, retirement planning, ELSS, NPS, insurance

Rules:
1. Always cite the relevant law section or rule (e.g., "under Section 80C of the Income Tax Act").
2. Use bullet points for clarity; keep answers concise and actionable.
3. Convert complex jargon into plain English where possible.
4. Always close with: "⚠️ This is general guidance only. Please consult a qualified CA for advice specific to your situation."
5. If asked about topics outside Indian tax/finance, politely redirect to your area of expertise.
6. Use INR (₹) for all monetary examples.`;

let _client: Groq | null = null;

function getClient(): Groq {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not configured');
    _client = new Groq({ apiKey });
  }
  return _client;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function* streamTaxbotResponse(
  history: ConversationMessage[],
  userMessage: string
): AsyncGenerator<string> {
  const client = getClient();

  const messages = [
    ...history.slice(-MAX_CONTEXT_MESSAGES),
    { role: 'user' as const, content: userMessage },
  ];

  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    stream: true,
    max_tokens: 1024,
    temperature: 0.4,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
