import { Link } from 'react-router-dom';

export default function CorporateLaw() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline">&larr; Back</Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-2">Corporate Law</h1>
          <p className="text-gray-600 mb-6">
            Overview and resources on corporate law matters relevant for businesses and professionals.
          </p>

          <ul className="list-disc pl-5 space-y-3 text-gray-700">
            <li><strong>Company Formation:</strong> Types of companies, incorporation process, and required documentation.</li>
            <li><strong>Compliance:</strong> Statutory filings, board meetings, minutes, and annual compliances.</li>
            <li><strong>Corporate Governance:</strong> Best practices for boards, directors' duties, and shareholder rights.</li>
            <li><strong>Mergers & Acquisitions:</strong> Process, due diligence, valuation, and regulatory approvals.</li>
            <li><strong>Contracts & Agreements:</strong> Drafting, negotiation, and enforceability considerations.</li>
            <li><strong>Dispute Resolution:</strong> Arbitration, litigation, and alternative dispute resolution mechanisms.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}