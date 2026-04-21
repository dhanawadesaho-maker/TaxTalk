import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { ProfilesGrid } from './components/ProfilesGrid';
import { MessagingInterface } from './components/MessagingInterface';
import { CAProfileEdit } from './components/CAProfileEdit';
import { BookingsPage } from './pages/BookingsPage';
import { useAuth } from './contexts/AuthContext';
import type { Notification } from './types';
import FinancialPlanning from './pages/FinancialPlanning';
import CorporateLaw from './pages/CorporateLaw';
import IncomeTax from './pages/IncomeTax';
import Gst from './pages/Gst';
import NotFound from './pages/NotFound';

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [contactUserId, setContactUserId] = useState<string | null>(null);

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

  const handleNotificationClick = (n: Notification) => {
    if (n.type === 'message') {
      setShowBookings(false);
      setContactUserId(null);
      setShowMessages(true);
    } else if (n.type.startsWith('appointment')) {
      setShowMessages(false);
      setShowBookings(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Navbar
          onLoginClick={() => { setShowLogin(true); setShowSignup(false); }}
          onSignupClick={() => { setShowSignup(true); setShowLogin(false); }}
        />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Hero */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { to: '/topics/financial-planning', title: 'Financial Planning', desc: 'SIP calculators, investment planning guidance' },
                  { to: '/topics/corporate-law', title: 'Corporate Law', desc: 'Compliance checklists and company registration' },
                  { to: '/topics/income-tax', title: 'Income Tax', desc: 'Slab-wise tax calculator for new & old regimes' },
                  { to: '/topics/gst', title: 'GST', desc: 'CGST/SGST breakdown and registration guide' },
                ].map(({ to, title, desc }) => (
                  <Link
                    key={to}
                    to={to}
                    className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth forms */}
            <div className="flex justify-center lg:justify-end">
              {showLogin && (
                <LoginForm
                  onClose={() => setShowLogin(false)}
                  onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }}
                />
              )}
              {showSignup && (
                <SignupForm
                  onClose={() => setShowSignup(false)}
                  onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
                />
              )}
              {!showLogin && !showSignup && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Ready to get started?</p>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
          users={[]}
          onBack={handleBackToProfiles}
          initialContactId={contactUserId ?? undefined}
        />
      </div>
    );
  }

  if (showBookings) {
    return <BookingsPage onBack={() => setShowBookings(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
        onMessagesClick={handleMessagesClick}
        onBookingsClick={() => setShowBookings(true)}
        onEditProfile={currentUser.role === 'ca' ? () => setShowProfileEdit(true) : undefined}
        onNotificationClick={handleNotificationClick}
      />

      {showProfileEdit && currentUser.role === 'ca' && (
        <CAProfileEdit onClose={() => setShowProfileEdit(false)} />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentUser.role === 'client' ? 'Find Expert CAs' : 'Connect with Clients'}
          </h1>
          <p className="text-gray-600">
            {currentUser.role === 'client'
              ? 'Browse through our verified Chartered Accountants and find the right expert for your needs.'
              : 'Connect with clients who need your professional expertise and grow your practice.'}
          </p>
        </div>

        <ProfilesGrid onContact={handleContact} />

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Topics &amp; Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { to: '/topics/financial-planning', title: 'Financial Planning', desc: 'SIP calculators, investment planning guidance' },
              { to: '/topics/corporate-law', title: 'Corporate Law', desc: 'Compliance checklists and company registration' },
              { to: '/topics/income-tax', title: 'Income Tax', desc: 'Slab-wise tax calculator for new & old regimes' },
              { to: '/topics/gst', title: 'GST', desc: 'CGST/SGST breakdown and registration guide' },
            ].map(({ to, title, desc }) => (
              <Link
                key={to}
                to={to}
                className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </Link>
            ))}
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
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route
              path="/topics/financial-planning"
              element={<ErrorBoundary><FinancialPlanning /></ErrorBoundary>}
            />
            <Route
              path="/topics/corporate-law"
              element={<ErrorBoundary><CorporateLaw /></ErrorBoundary>}
            />
            <Route
              path="/topics/income-tax"
              element={<ErrorBoundary><IncomeTax /></ErrorBoundary>}
            />
            <Route
              path="/topics/gst"
              element={<ErrorBoundary><Gst /></ErrorBoundary>}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
