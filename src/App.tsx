import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { clearAndInitializeData } from './utils/initializeData';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { ProfilesGrid } from './components/ProfilesGrid';
import { MessagingInterface } from './components/MessagingInterface';
import { useAuth } from './contexts/AuthContext';
import { useUsers } from './hooks/useUsers';
import FinancialPlanning from './pages/FinancialPlanning';
import CorporateLaw from './pages/CorporateLaw';
import IncomeTax from './pages/IncomeTax';
import Gst from './pages/Gst';

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  const { users } = useUsers();
  const [showLogin, setShowLogin] = useState(!currentUser);
  const [showSignup, setShowSignup] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [contactUserId, setContactUserId] = useState<string | null>(null);

  // Initialize data on first load
  React.useEffect(() => {
    const hasInitialized = localStorage.getItem('dataInitialized');
    if (!hasInitialized) {
      clearAndInitializeData();
      localStorage.setItem('dataInitialized', 'true');
    }
  }, []);

  const handleContact = (userId: string) => {
    setContactUserId(userId);
    setShowMessages(true);
  };

  const handleMessagesClick = () => {
    setContactUserId(null);
    setShowMessages(true);
  };

  const handleBackToProfiles = () => {
    setShowMessages(false);
    setContactUserId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Navbar
          onLoginClick={() => {
            setShowLogin(true);
            setShowSignup(false);
          }}
          onSignupClick={() => {
            setShowSignup(true);
            setShowLogin(false);
          }}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Hero content */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Connect with
                  <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Expert CAs
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Your trusted platform for connecting with qualified Chartered Accountants. 
                  Get professional tax advice, financial guidance, and expert consultation.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  to="/topics/financial-planning"
                  className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Financial Planning</h3>
                  <p className="text-gray-600 text-sm">Connect with verified CAs for professional advice</p>
                </Link>

                <Link
                  to="/topics/corporate-law"
                  className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Corporate Law</h3>
                  <p className="text-gray-600 text-sm">Communicate securely through our platform</p>
                </Link>

                <Link
                  to="/topics/income-tax"
                  className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Income Tax</h3>
                  <p className="text-gray-600 text-sm">Get instant answers to common tax questions</p>
                </Link>

                <Link
                  to="/topics/gst"
                  className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">GST</h3>
                  <p className="text-gray-600 text-sm">All CAs are verified and rated by users</p>
                </Link>
              </div>
            </div>

            {/* Right side - Auth forms */}
            <div className="flex justify-center lg:justify-end">
              {showLogin && (
                <LoginForm
                  onClose={() => setShowLogin(false)}
                  onSwitchToSignup={() => {
                    setShowLogin(false);
                    setShowSignup(true);
                  }}
                />
              )}
              {showSignup && (
                <SignupForm
                  onClose={() => setShowSignup(false)}
                  onSwitchToLogin={() => {
                    setShowSignup(false);
                    setShowLogin(true);
                  }}
                />
              )}
              {!showLogin && !showSignup && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Ready to get started?</p>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showMessages) {
    return (
      <div className="h-screen">
        <MessagingInterface
          users={users}
          onBack={handleBackToProfiles}
          initialContactId={contactUserId || undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
        onMessagesClick={handleMessagesClick}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentUser.userType === 'user' ? 'Find Expert CAs' : 'Connect with Clients'}
          </h1>
          <p className="text-gray-600">
            {currentUser.userType === 'user' 
              ? 'Browse through our verified Chartered Accountants and find the right expert for your needs.'
              : 'Connect with users who need your professional expertise and grow your practice.'
            }
          </p>
        </div>

        <ProfilesGrid users={users} onContact={handleContact} />

        {/* Also include the features grid for authenticated users */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Topics & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/topics/financial-planning"
              className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Financial Planning</h3>
              <p className="text-gray-600 text-sm">Connect with verified CAs for professional advice</p>
            </Link>

            <Link
              to="/topics/corporate-law"
              className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Corporate Law</h3>
              <p className="text-gray-600 text-sm">Communicate securely through our platform</p>
            </Link>

            <Link
              to="/topics/income-tax"
              className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Income Tax</h3>
              <p className="text-gray-600 text-sm">Get instant answers to common tax questions</p>
            </Link>

            <Link
              to="/topics/gst"
              className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 mb-2">GST</h3>
              <p className="text-gray-600 text-sm">All CAs are verified and rated by users</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/topics/financial-planning" element={<FinancialPlanning />} />
          <Route path="/topics/corporate-law" element={<CorporateLaw />} />
          <Route path="/topics/income-tax" element={<IncomeTax />} />
          <Route path="/topics/gst" element={<Gst />} />
          {/* You can add a NotFound route or redirects as needed */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;