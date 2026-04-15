import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Lock, Briefcase, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SignupFormProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function SignupForm({ onClose, onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'ca'>('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    workExperience: '',
    specialization: [] as string[],
    caNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();

  const specializationOptions = [
    'Income Tax',
    'GST',
    'Auditing',
    'Corporate Law',
    'TDS',
    'Financial Planning',
    'Company Law',
    'International Taxation',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecializationChange = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup({
        ...formData,
        userType,
        workExperience: userType === 'ca' ? parseInt(formData.workExperience) : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // For now, we'll disable Google Sign-In and focus on email/password
    // In production, this would integrate with Firebase Auth or similar
    console.log('Google Sign-In clicked - would integrate with OAuth provider');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* User Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setUserType('user')}
            className={`p-4 border rounded-lg text-center transition-colors duration-200 ${
              userType === 'user'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <User className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Regular User</div>
            <div className="text-sm text-gray-500">Looking for CA services</div>
          </button>
          <button
            type="button"
            onClick={() => setUserType('ca')}
            className={`p-4 border rounded-lg text-center transition-colors duration-200 ${
              userType === 'ca'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Award className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Chartered Accountant</div>
            <div className="text-sm text-gray-500">Provide professional services</div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Enter your full name"
                required
              />
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Enter your email"
                required
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="+91 98765 43210"
                required
              />
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Create a strong password"
                required
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* CA-specific fields */}
        {userType === 'ca' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience (Years)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="workExperience"
                    value={formData.workExperience}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="e.g., 5"
                    required
                  />
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CA Membership Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="caNumber"
                    value={formData.caNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="CA123456"
                    required
                  />
                  <Award className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {specializationOptions.map((spec) => (
                  <label key={spec} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.specialization.includes(spec)}
                      onChange={() => handleSpecializationChange(spec)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{spec}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled
          className="mt-4 w-full border border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google (Coming Soon)
        </button>
      </div>

      <div className="mt-6 text-center">
        <span className="text-gray-600">Already have an account? </span>
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Sign in here
        </button>
      </div>
    </div>
  );
}