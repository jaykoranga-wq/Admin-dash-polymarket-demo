import { useState, FormEvent } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useSignupMutation } from '../../services/authApi';
import { setCredentials } from '../../store/authSlice';
import { useDispatch } from 'react-redux';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await signup({ email, password, full_name: fullName }).unwrap();
      dispatch(setCredentials(result));
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message ?? 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-6">
            <UserPlus className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Register as an admin
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Jane Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="signup_email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="signup_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="signup_password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="signup_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter a secure password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Secure admin access only
        </p>
      </div>
    </div>
  );
}
