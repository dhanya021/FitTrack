import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setError('');
      setLoading(true);
      // Try logging into existing demo account or register it if not exists
      try {
        await login('demo@fittrack.app', 'demo1234');
      } catch {
        await register('Demo Athlete', 'demo@fittrack.app', 'demo1234');
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError('Demo login failed: ' + (err.message || 'Please try standard sign up.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0F17] transition-colors">
      <div className="w-full max-w-md">
        {/* Logo & Headline */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 items-center justify-center text-white shadow-xl shadow-brand-500/25 mb-4">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to FitTrack
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Your daily fitness, activity, and recovery command center.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#131B2A] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5">
          {error && <Alert type="error" message={error} className="mb-5" onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="athlete@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#131B2A] px-3 text-slate-400 font-semibold tracking-wider">
                Or
              </span>
            </div>
          </div>

          {/* Quick Demo Access */}
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            ⚡ Explore with Demo Account
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
