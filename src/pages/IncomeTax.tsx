import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  FileText,
  Percent,
  BookOpen,
  AlertCircle,
  Calendar,
  TrendingDown,
} from 'lucide-react';

// ─── Tax slab calculator ────────────────────────────────────────────────────

function calcTaxNew(income: number): number {
  // FY 2024-25 new regime slabs (post Budget 2023)
  const slabs = [
    { limit: 300000, rate: 0 },
    { limit: 600000, rate: 0.05 },
    { limit: 900000, rate: 0.1 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.2 },
    { limit: Infinity, rate: 0.3 },
  ];
  let tax = 0;
  let prev = 0;
  for (const { limit, rate } of slabs) {
    if (income <= prev) break;
    tax += (Math.min(income, limit) - prev) * rate;
    prev = limit;
  }
  return tax;
}

function calcTaxOld(income: number): number {
  // FY 2024-25 old regime slabs
  const slabs = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.2 },
    { limit: Infinity, rate: 0.3 },
  ];
  let tax = 0;
  let prev = 0;
  for (const { limit, rate } of slabs) {
    if (income <= prev) break;
    tax += (Math.min(income, limit) - prev) * rate;
    prev = limit;
  }
  return tax;
}

function addSurchargeAndCess(tax: number, income: number): number {
  let surcharge = 0;
  if (income > 50000000) surcharge = tax * 0.37;
  else if (income > 20000000) surcharge = tax * 0.25;
  else if (income > 10000000) surcharge = tax * 0.15;
  else if (income > 5000000) surcharge = tax * 0.1;
  const cess = (tax + surcharge) * 0.04;
  return Math.round(tax + surcharge + cess);
}

function fmt(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

function TaxCalculator() {
  const [salary, setSalary] = useState('');
  const [deductions, setDeductions] = useState('');

  const gross = Number(salary) || 0;
  const ded = Number(deductions) || 0;
  const taxableOld = Math.max(0, gross - ded - 50000); // standard deduction in old regime
  const taxableNew = Math.max(0, gross - 75000); // standard deduction in new regime

  const taxOld = gross > 0 ? addSurchargeAndCess(calcTaxOld(taxableOld), taxableOld) : 0;
  const taxNew = gross > 0 ? addSurchargeAndCess(calcTaxNew(taxableNew), taxableNew) : 0;
  const better = taxNew < taxOld ? 'New Regime' : 'Old Regime';

  return (
    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-blue-600" />
        Income Tax Calculator — FY 2024-25
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Gross Salary (₹)
          </label>
          <input
            type="number"
            value={salary}
            onChange={e => setSalary(e.target.value)}
            placeholder="e.g. 1200000"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            80C + Other Deductions (₹) — for Old Regime
          </label>
          <input
            type="number"
            value={deductions}
            onChange={e => setDeductions(e.target.value)}
            placeholder="e.g. 150000"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {gross > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Tax — Old Regime</p>
            <p className="text-xl font-bold text-gray-900">{fmt(taxOld)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Taxable income: {fmt(taxableOld)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Tax — New Regime</p>
            <p className="text-xl font-bold text-gray-900">{fmt(taxNew)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Taxable income: {fmt(taxableNew)}
            </p>
          </div>
          <div className="bg-blue-600 text-white rounded-lg p-4">
            <p className="text-xs text-blue-200 mb-1">Recommended</p>
            <p className="text-lg font-bold">{better}</p>
            <p className="text-xs text-blue-200 mt-0.5">
              Saves {fmt(Math.abs(taxOld - taxNew))}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        * Includes 4% cess + surcharge where applicable. Standard deduction: ₹75,000 (new) / ₹50,000 (old).
        This is an estimate — consult a CA for exact computation.
      </p>
    </div>
  );
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What is the due date for filing ITR for salaried individuals?',
    a: 'For salaried individuals (non-audit cases), the due date is typically July 31 of the assessment year. E.g., for FY 2024-25 income, the due date is July 31, 2025.',
  },
  {
    q: 'What deductions are available under Section 80C?',
    a: 'Section 80C allows up to ₹1.5 lakh deduction for investments in PPF, ELSS mutual funds, life insurance premiums, NSC, home loan principal, tuition fees, and more. This is only available under the Old Regime.',
  },
  {
    q: 'How is HRA exemption calculated?',
    a: 'HRA exemption is the lowest of: (a) actual HRA received, (b) 50% of basic salary (metro cities) or 40% (non-metro), (c) rent paid minus 10% of basic salary.',
  },
  {
    q: 'What is Advance Tax and when is it required?',
    a: 'If your total tax liability exceeds ₹10,000 in a year, you must pay advance tax in four installments: 15% by June 15, 45% by September 15, 75% by December 15, and 100% by March 15.',
  },
  {
    q: 'Can I switch between old and new tax regimes?',
    a: 'Salaried individuals can switch every year. However, those with business income can only opt out of the new regime once and then cannot switch back.',
  },
  {
    q: 'What happens if I miss the ITR filing deadline?',
    a: 'You can file a belated return by December 31 of the assessment year with a penalty of ₹5,000 (₹1,000 if income ≤ ₹5 lakh). You also lose the ability to carry forward most losses.',
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
  { icon: FileText, title: 'ITR Filing', desc: 'Step-by-step e-filing for individuals, HUFs, and businesses.' },
  { icon: TrendingDown, title: 'Deductions & Exemptions', desc: 'Sections 80C, 80D, HRA, LTA, and all available deductions.' },
  { icon: Calendar, title: 'Advance Tax & TDS', desc: 'Quarterly advance tax computation and TDS compliance.' },
  { icon: Percent, title: 'Tax Slabs', desc: 'FY 2024-25 slabs under both old and new regimes explained.' },
  { icon: AlertCircle, title: 'Notices & Assessment', desc: 'How to respond to IT department notices and scrutiny.' },
  { icon: BookOpen, title: 'Tax Planning', desc: 'Legal strategies to reduce tax liability for salaried and business.' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function IncomeTax() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-6">
          ← Back
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 rounded-xl p-3">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Income Tax</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-xl">
            India's comprehensive guide to income tax — from slab rates and ITR filing to deductions,
            advance tax, and smart tax planning.
          </p>
        </div>

        {/* Calculator */}
        <div className="mb-10">
          <TaxCalculator />
        </div>

        {/* Key Topics */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="bg-blue-50 rounded-lg p-2 w-fit mb-3">
                  <Icon className="h-5 w-5 text-blue-600" />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need help with income tax filing?</h3>
          <p className="text-gray-500 text-sm mb-4">
            Connect with a verified CA who specialises in income tax and ITR filing.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Find an Income Tax CA →
          </Link>
        </div>
      </div>
    </div>
  );
}
