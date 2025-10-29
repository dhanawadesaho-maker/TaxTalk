import { Link } from 'react-router-dom';

export default function Gst() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline">&larr; Back</Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-2">GST (Goods and Services Tax)</h1>
          <p className="text-gray-600 mb-6">
            Everything about GST registration, return filing, input tax credit, and compliance.
          </p>

          <ul className="list-disc pl-5 space-y-3 text-gray-700">
            <li><strong>GST Basics:</strong> What is GST, and how does it work in India?</li>
            <li><strong>Registration:</strong> Who needs to register for GST? Process and documents required.</li>
            <li><strong>GST Returns:</strong> Types of returns (GSTR-1, GSTR-3B, etc.) and their filing process.</li>
            <li><strong>Input Tax Credit:</strong> How to claim ITC and comply with matching rules.</li>
            <li><strong>Composition Scheme:</strong> Benefits and eligibility.</li>
            <li><strong>GST Compliance:</strong> Invoicing, audits, and dealing with notices.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}