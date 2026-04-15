import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  FileText,
  Users,
  Scale,
  Handshake,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

// ─── Compliance Checklist ────────────────────────────────────────────────────

interface CheckItem {
  id: string;
  label: string;
  frequency: string;
  due: string;
}

const CHECKLIST_ITEMS: CheckItem[] = [
  { id: 'c1', label: 'Board Meeting (minimum 4 per year)', frequency: 'Quarterly', due: 'Within 30 days of quarter end' },
  { id: 'c2', label: 'Annual General Meeting (AGM)', frequency: 'Annual', due: 'Within 6 months of financial year end' },
  { id: 'c3', label: 'Annual Return filing — MCA (AOC-4 & MGT-7)', frequency: 'Annual', due: 'Within 60/60 days of AGM' },
  { id: 'c4', label: 'Statutory Audit completion', frequency: 'Annual', due: 'Before AGM' },
  { id: 'c5', label: 'Director KYC (DIR-3 KYC)', frequency: 'Annual', due: 'September 30 every year' },
  { id: 'c6', label: 'Income Tax Return filing', frequency: 'Annual', due: 'October 31 (audit cases)' },
  { id: 'c7', label: 'GST Annual Return (GSTR-9)', frequency: 'Annual', due: 'December 31' },
  { id: 'c8', label: 'TDS return filing (24Q/26Q)', frequency: 'Quarterly', due: '31st of the month after quarter end' },
  { id: 'c9', label: 'Deposit of TDS with government', frequency: 'Monthly', due: '7th of following month' },
  { id: 'c10', label: 'Provident Fund (PF) remittance', frequency: 'Monthly', due: '15th of following month' },
];

function ComplianceChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completed = checked.size;
  const total = CHECKLIST_ITEMS.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <CheckSquare className="h-5 w-5 text-orange-600" />
        Annual Compliance Checklist
      </h2>
      <p className="text-xs text-gray-500 mb-4">Track key compliances for a private limited company. Click items to mark as done.</p>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{completed} of {total} completed</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map(item => {
          const done = checked.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                done
                  ? 'bg-orange-100 border-orange-200'
                  : 'bg-white border-gray-200 hover:border-orange-200'
              }`}
            >
              {done
                ? <CheckSquare className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                : <Square className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.frequency} · Due: {item.due}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        * Deadlines are indicative and may change. Always verify with the MCA/NSDL portal or your CA.
      </p>
    </div>
  );
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What is the difference between a Private Limited and LLP?',
    a: 'A Private Limited Company (Pvt Ltd) is governed by the Companies Act 2013, suitable for businesses seeking investment. An LLP (Limited Liability Partnership) has simpler compliance, no share capital requirement, and partners have limited liability. LLPs are often preferred by professionals and small businesses for lower compliance costs.',
  },
  {
    q: 'How many board meetings must a company hold?',
    a: 'A private limited company must hold at least 4 board meetings per year with a maximum gap of 120 days between two meetings. The first board meeting must be held within 30 days of incorporation.',
  },
  {
    q: 'What is DIN and who needs it?',
    a: 'Director Identification Number (DIN) is a unique 8-digit number mandatory for anyone who wishes to become a director in any Indian company. It is obtained by filing Form DIR-3 with the Ministry of Corporate Affairs (MCA). Annual KYC of DIN holders is required by September 30.',
  },
  {
    q: 'When must a company conduct an AGM?',
    a: 'Every company (except OPC) must hold its Annual General Meeting (AGM) within 6 months from the end of the financial year — i.e., by September 30 for companies with an April-March financial year. The first AGM must be held within 9 months of incorporation.',
  },
  {
    q: 'What are the consequences of late ROC filings?',
    a: 'Late filing of annual returns (AOC-4 / MGT-7) attracts additional fees: ₹100 per day of delay. Directors may be disqualified if the company fails to file for 3 consecutive financial years. The company may also be struck off the register.',
  },
  {
    q: 'What is the MSME Samadhaan portal and when should I use it?',
    a: 'MSME Samadhaan is a government portal for micro and small enterprises to file applications against delayed payments by buyers. Under the MSME Development Act, buyers must pay within 45 days. If not paid, interest at 3× the bank rate is payable. CAs can help file applications and quantify the interest due.',
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
  { icon: Building2, title: 'Company Formation', desc: 'Incorporation of Pvt Ltd, OPC, LLP — process and documents.' },
  { icon: FileText, title: 'ROC Compliance', desc: 'Annual returns, form filings, and MCA portal obligations.' },
  { icon: Users, title: 'Corporate Governance', desc: 'Board meetings, director duties, and shareholder rights.' },
  { icon: Handshake, title: 'Mergers & Acquisitions', desc: 'Due diligence, valuation, NCLT approvals, and post-merger integration.' },
  { icon: Scale, title: 'Dispute Resolution', desc: 'Arbitration, NCLT proceedings, and mediation mechanisms.' },
  { icon: AlertCircle, title: 'Regulatory Compliance', desc: 'SEBI, RBI, FEMA, and sector-specific regulatory requirements.' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CorporateLaw() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-6">
          ← Back
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 rounded-xl p-3">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Corporate Law</h1>
          </div>
          <p className="text-orange-100 text-lg max-w-xl">
            Navigate company formation, ROC compliance, board governance, and M&amp;A transactions
            with confidence under the Companies Act 2013.
          </p>
        </div>

        {/* Compliance checklist tool */}
        <div className="mb-10">
          <ComplianceChecklist />
        </div>

        {/* Key Topics */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="bg-orange-50 rounded-lg p-2 w-fit mb-3">
                  <Icon className="h-5 w-5 text-orange-600" />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need a Corporate Law specialist?</h3>
          <p className="text-gray-500 text-sm mb-4">
            Our CAs with corporate law expertise can help with company formation, ROC filings, and M&amp;A advisory.
          </p>
          <Link
            to="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Find a Corporate Law CA →
          </Link>
        </div>
      </div>
    </div>
  );
}
