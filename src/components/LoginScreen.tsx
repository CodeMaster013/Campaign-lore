import React, { useState } from 'react';
import { Terminal, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(credentials.username, credentials.password);
      if (!success) {
        setError('Invalid credentials. Access denied.');
      }
    } catch {
      setError('System error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { username: 'founder', password: 'omega-prime-2024', role: 'DM/Admin', clearance: 'Omega' },
    { username: 'operative-alpha', password: 'alpha-clearance', role: 'Player', clearance: 'Alpha' },
    { username: 'operative-beta', password: 'beta-access', role: 'Player', clearance: 'Beta' },
    { username: 'recruit', password: 'new-recruit', role: 'Player', clearance: 'Beta' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Terminal className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">THESEUS TERMINAL</h1>
          <p className="text-sm sm:text-base text-gray-400">United Laboratories Database Interface</p>
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Operative ID
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                placeholder="Enter your operative ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Access Code
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Enter your access code"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Access Terminal
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            Demo Credentials
          </h3>
          <div className="space-y-2 text-xs overflow-x-auto">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="bg-gray-700 rounded p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium">{cred.username}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    cred.clearance === 'Omega' ? 'bg-red-400/20 text-red-400' :
                    cred.clearance === 'Alpha' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-blue-400/20 text-blue-400'
                  }`}>
                    {cred.clearance}
                  </span>
                </div>
                <div className="text-gray-400 break-all">
                  Password: <code className="bg-gray-600 px-1 rounded">{cred.password}</code>
                </div>
                <div className="text-gray-500 text-xs mt-1">{cred.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 United Laboratories. All rights reserved.</p>
          <p className="mt-1">Unauthorized access is strictly prohibited.</p>
        </div>
      </div>
    </div>
  );
};