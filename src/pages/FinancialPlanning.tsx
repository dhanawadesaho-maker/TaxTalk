import { Link } from 'react-router-dom';

export default function FinancialPlanning() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline">&larr; Back</Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-2">Financial Planning</h1>
          <p className="text-gray-600 mb-6">
            All you need to know about managing your finances, investments, savings, and long-term financial health.
          </p>

          <ul className="list-disc pl-5 space-y-3 text-gray-700">
            <li><strong>Budgeting:</strong> Learn to create and maintain a personal or business budget to manage expenses and income efficiently.</li>
            <li><strong>Investment Strategies:</strong> Explore various investment avenues such as stocks, bonds, mutual funds, and real estate.</li>
            <li><strong>Retirement Planning:</strong> Plan early for a secure and comfortable retirement. Understand retirement accounts and pension schemes.</li>
            <li><strong>Risk Management:</strong> Importance of insurance, diversification, and emergency funds.</li>
            <li><strong>Tax Planning:</strong> Strategies to reduce tax liability and increase savings.</li>
            <li><strong>Financial Goal Setting:</strong> How to set achievable short-term and long-term financial goals.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}