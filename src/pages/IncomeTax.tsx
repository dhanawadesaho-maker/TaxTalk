import { Link } from 'react-router-dom';

export default function IncomeTax() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline">&larr; Back</Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-2">Income Tax</h1>
          <p className="text-gray-600 mb-6">
            Comprehensive guide to income tax rules, filing procedures, and exemptions in India.
          </p>

          <ul className="list-disc pl-5 space-y-3 text-gray-700">
            <li><strong>Income Tax Basics:</strong> Understanding tax slabs, due dates, and PAN requirements.</li>
            <li><strong>Tax Filing:</strong> Step-by-step process for e-filing returns for individuals and businesses.</li>
            <li><strong>Deductions & Exemptions:</strong> Section 80C, HRA, LTA, and various other deductions available.</li>
            <li><strong>Advance Tax & TDS:</strong> Calculating and paying advance tax, and understanding Tax Deducted at Source.</li>
            <li><strong>Assessment & Notices:</strong> What to do if you receive a notice from the Income Tax Department.</li>
            <li><strong>Tax Planning:</strong> Legal ways to save tax and avoid penalties.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}