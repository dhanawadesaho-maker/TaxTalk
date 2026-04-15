import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  ChevronDown,
  ChevronUp,
  Calculator,
  FileCheck,
  AlertCircle,
  RefreshCcw,
  Building2,
  ShieldCheck,
} from 'lucide-react';

// ─── GST Calculator ──────────────────────────────────────────────────────────

const GST_RATES = [5, 12, 18, 28];

function GSTCalculator() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState<'exclusive' | 'inclusive'>('exclusive');

  const base = Number(amount) || 0;

  let taxableAmount: number;
  let gstTotal: number;

  if (mode === 'exclusive') {
    taxableAmount = base;
    gstTotal = base * (rate / 100);
  } else {
    taxableAmount = base / (1 + rate / 100);
    gstTotal = base - taxableAmount;
  }

  const cgst = gstTotal / 2;
  const sgst = gstTotal / 2;
  const total = taxableAmount + gstTotal;

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="bg-green-50 rounded-xl p-6 border border-green-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-green-600" />
        GST Calculator
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 10000"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate</label>
          <select
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {GST_RATES.map(r => (
              <option key={r} value={r}>{r}%</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
          <select
            value={mode}
            onChange={e => setMode(e.target.value as 'exclusive' | 'inclusive')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="exclusive">GST Exclusive (add tax)</option>
            <option value="inclusive">GST Inclusive (extract tax)</option>
          </select>
        </div>
      </div>

      {base > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Taxable Amount', value: fmt(taxableAmount), color: 'bg-white' },
            { label: `CGST (${rate / 2}%)`, value: fmt(cgst), color: 'bg-white' },
            { label: `SGST / UTGST (${rate / 2}%)`, value: fmt(sgst), color: 'bg-white' },
            { label: 'Total Invoice Value', value: fmt(total), color: 'bg-green-600 text-white' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className={`rounded-lg p-4 border border-gray-200 ${color}`}
            >
              <p className={`text-xs mb-1 ${color.includes('600') ? 'text-green-100' : 'text-gray-500'}`}>{label}</p>
              <p className={`text-base font-bold ${color.includes('600') ? 'text-white' : 'text-gray-900'}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        * For intra-state supply: CGST + SGST apply equally. For inter-state supply, IGST = CGST + SGST combined.
      </p>
    </div>
  );
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Who is required to register for GST?',
    a: 'Businesses with aggregate turnover exceeding ₹40 lakh (goods) or ₹20 lakh (services) in a year must register. Threshold is ₹10 lakh for special category states. Certain categories like e-commerce sellers must register regardless of turnover.',
  },
  {
    q: 'What are the different GST return types?',
    a: 'Key returns: GSTR-1 (outward supplies, monthly/quarterly), GSTR-3B (monthly summary return with tax payment), GSTR-9 (annual return), GSTR-2B (auto-drafted ITC statement). Composition dealers file CMP-08 quarterly and GSTR-4 annually.',
  },
  {
    q: 'How does Input Tax Credit (ITC) work?',
    a: 'ITC allows you to deduct GST paid on purchases from your GST liability on sales. Conditions: supplier must have filed their return, goods/services used for business, you hold a valid tax invoice, and payment is made within 180 days.',
  },
  {
    q: 'What is the GST Composition Scheme?',
    a: 'Small taxpayers with turnover up to ₹1.5 crore (₹75 lakh for services) can opt for composition. They pay a flat rate (1% for traders, 2% for manufacturers, 5% for restaurants) but cannot claim ITC or issue tax invoices.',
  },
  {
    q: 'What are the penalties for GST non-compliance?',
    a: 'Late filing: ₹50/day (₹20/day for nil returns), capped at ₹5,000. Non-filing: 18% interest on outstanding tax. Tax evasion penalties range from 100% to 200% of the evaded tax amount.',
  },
  {
    q: 'What is e-invoicing and who needs it?',
    a: 'E-invoicing is mandatory for businesses with aggregate turnover above ₹5 crore. Invoices must be generated on the Invoice Registration Portal (IRP), which assigns a unique IRN and QR code. This helps reduce ITC fraud.',
  },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left flex items-center justify-between px-5 py-4 font-medium text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {q}
        {open ? <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Topic cards ─────────────────────────────────────────────────────────────

const TOPICS = [
  { icon: Building2, title: 'GST Registration', desc: 'Process, documents, and threshold limits for GST registration.' },
  { icon: FileCheck, title: 'GST Returns', desc: 'GSTR-1, GSTR-3B, GSTR-9 — filing timelines and procedures.' },
  { icon: RefreshCcw, title: 'Input Tax Credit', desc: 'Eligibility, conditions, and how to claim ITC correctly.' },
  { icon: Receipt, title: 'E-Invoicing', desc: 'IRN, QR code, and e-way bill requirements for businesses.' },
  { icon: ShieldCheck, title: 'Composition Scheme', desc: 'Benefits and eligibility for small taxpayers.' },
  { icon: AlertCircle, title: 'GST Notices', desc: 'How to respond to demand notices, audits, and scrutiny.' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Gst() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-6">
          ← Back
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 rounded-xl p-3">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold">GST</h1>
          </div>
          <p className="text-green-100 text-lg max-w-xl">
            Everything you need to know about Goods and Services Tax — registration, returns,
            ITC claims, e-invoicing, and compliance under Indian law.
          </p>
        </div>

        {/* Calculator */}
        <div className="mb-10">
          <GSTCalculator />
        </div>

        {/* Key Topics */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="bg-green-50 rounded-lg p-2 w-fit mb-3">
                  <Icon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map(faq => <FAQ key={faq.q} {...faq} />)}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need a GST specialist?</h3>
          <p className="text-gray-500 text-sm mb-4">
            Our verified CAs can help with registration, return filing, ITC reconciliation, and GST audits.
          </p>
          <Link
            to="/"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Find a GST CA →
          </Link>
        </div>
      </div>
    </div>
  );
}
