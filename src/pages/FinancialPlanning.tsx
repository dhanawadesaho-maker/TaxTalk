import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calculator,
  PiggyBank,
  ShieldCheck,
  Target,
  BarChart2,
  Briefcase,
} from 'lucide-react';

// ─── SIP Calculator ──────────────────────────────────────────────────────────

function SIPCalculator() {
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');

  const p = Number(monthly) || 0;
  const r = (Number(rate) || 0) / 100 / 12;
  const n = (Number(years) || 0) * 12;

  // Future value of SIP: P * [(1+r)^n - 1] / r * (1+r)
  const futureValue =
    p > 0 && r > 0 && n > 0
      ? Math.round(p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r))
      : 0;

  const totalInvested = p * n;
  const gains = Math.max(0, futureValue - totalInvested);
  const gainsPct = totalInvested > 0 ? ((gains / totalInvested) * 100).toFixed(1) : '0';

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-purple-600" />
        SIP Future Value Calculator
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly SIP Amount (₹)
          </label>
          <input
            type="number"
            value={monthly}
            onChange={e => setMonthly(e.target.value)}
            placeholder="e.g. 10000"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Annual Return (%)
          </label>
          <input
            type="number"
            value={rate}
            onChange={e => setRate(e.target.value)}
            placeholder="e.g. 12"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Investment Tenure (years)
          </label>
          <input
            type="number"
            value={years}
            onChange={e => setYears(e.target.value)}
            placeholder="e.g. 10"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {futureValue > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total Invested</p>
            <p className="text-lg font-bold text-gray-900">{fmt(totalInvested)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Est. Returns ({gainsPct}%)</p>
            <p className="text-lg font-bold text-green-600">{fmt(gains)}</p>
          </div>
          <div className="bg-purple-600 text-white rounded-lg p-4">
            <p className="text-xs text-purple-200 mb-1">Future Value</p>
            <p className="text-lg font-bold">{fmt(futureValue)}</p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        * Returns shown are estimated based on expected rate. Actual mutual fund returns are subject to market risk.
        Past performance does not guarantee future results.
      </p>
    </div>
  );
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What is the 50/30/20 budgeting rule?',
    a: 'This popular budgeting framework suggests allocating 50% of after-tax income to needs (rent, food, utilities), 30% to wants (entertainment, dining out), and 20% to savings and investments or debt repayment.',
  },
  {
    q: 'When should I start investing for retirement?',
    a: 'The earlier the better, due to compounding. Starting at 25 vs 35 can result in double the corpus at retirement with the same monthly investment. NPS, PPF, and EPF are excellent long-term vehicles in India.',
  },
  {
    q: 'How much emergency fund should I maintain?',
    a: 'Financial advisors recommend 3-6 months of essential living expenses in a liquid account (savings account or liquid mutual fund). For those with irregular income or single-income households, 6-12 months is advisable.',
  },
  {
    q: 'What is the difference between term and whole life insurance?',
    a: 'Term insurance provides pure life cover for a fixed period at low premiums — ideal for income replacement. Whole life/endowment mixes insurance with investment but at much higher cost and lower returns. Most advisors recommend buying term + invest the difference.',
  },
  {
    q: 'How do ELSS mutual funds save tax?',
    a: 'ELSS (Equity Linked Savings Schemes) qualify for deduction up to ₹1.5 lakh under Section 80C of the Income Tax Act in the old regime. They have a mandatory 3-year lock-in period — the shortest among 80C investments — and historically offer market-linked returns.',
  },
  {
    q: 'What is an ideal asset allocation strategy?',
    a: "A common rule of thumb is 100 minus your age as the equity percentage (e.g., 35-year-old → 65% equity). Adjust based on risk tolerance and goals. As you approach goals, gradually shift to debt instruments to protect corpus.",
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
  { icon: PiggyBank, title: 'Budgeting & Savings', desc: 'Frameworks for tracking income, expenses, and building savings habits.' },
  { icon: BarChart2, title: 'Investment Strategies', desc: 'Equities, debt, mutual funds, real estate — building a diversified portfolio.' },
  { icon: Target, title: 'Goal-Based Planning', desc: 'Mapping investments to specific goals: home, education, retirement.' },
  { icon: ShieldCheck, title: 'Insurance Planning', desc: 'Right coverage for life, health, and critical illness protection.' },
  { icon: TrendingUp, title: 'Retirement Planning', desc: 'NPS, EPF, PPF — building a sufficient retirement corpus.' },
  { icon: Briefcase, title: 'Tax-Efficient Investing', desc: 'ELSS, PPF, NPS — maximising post-tax investment returns.' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FinancialPlanning() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mb-6">
          ← Back
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 rounded-xl p-3">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Financial Planning</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-xl">
            Build lasting wealth with expert financial planning — from SIP investments and tax-efficient
            saving to retirement corpus and insurance coverage.
          </p>
        </div>

        {/* Calculator */}
        <div className="mb-10">
          <SIPCalculator />
        </div>

        {/* Key Topics */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="bg-purple-50 rounded-lg p-2 w-fit mb-3">
                  <Icon className="h-5 w-5 text-purple-600" />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Want a personalised financial plan?</h3>
          <p className="text-gray-500 text-sm mb-4">
            Our CAs specialising in financial planning can help you build a roadmap to your goals.
          </p>
          <Link
            to="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Find a Financial Planning CA →
          </Link>
        </div>
      </div>
    </div>
  );
}
