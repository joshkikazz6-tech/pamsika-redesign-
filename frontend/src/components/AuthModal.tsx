import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

interface AuthModalProps {
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onShowToast }) => {
  const { authModalOpen, authModalMode, closeAuthModal, login, register, openAuthModal } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, authModalOpen]);

  useEffect(() => {
    if (!authModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        onShowToast('Welcome back!');
      } else {
        await register(fullName, email, password);
        onShowToast('Account created — welcome to Pa_mSikA!');
      }
      setFullName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="pm-dialog-backdrop"
      onClick={closeAuthModal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? 'Welcome back' : 'Create your account'}
        onClick={(e) => e.stopPropagation()}
        className="pm-dialog-card max-w-sm w-full overflow-hidden p-6"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="font-serif-source text-lg font-bold text-[#5300b7]">Pa_mSikA</span>
          <button onClick={closeAuthModal} className="text-[#7b7486] hover:text-[#121c2a]" title="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <h3 className="font-serif-source text-2xl font-bold text-[#121c2a] mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h3>
        <p className="text-xs text-[#4a4455] mb-5">
          {mode === 'login'
            ? 'Sign in to shop, message sellers, and track orders.'
            : 'Join Pa_mSikA to shop, sell, and earn as a Dolo affiliate.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
                className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#4a4455] uppercase mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-[#eff4ff] border border-[#ccc3d7]/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5300b7]/30"
              placeholder={mode === 'register' ? 'Min 8 chars, 1 uppercase, 1 number' : '••••••••'}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#5300b7] hover:bg-[#6d28d9] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-[#4a4455]">
          {mode === 'login' ? (
            <>
              New to Pa_mSikA?{' '}
              <button onClick={() => openAuthModal('register')} className="text-[#5300b7] font-bold hover:underline">
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => openAuthModal('login')} className="text-[#5300b7] font-bold hover:underline">
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};