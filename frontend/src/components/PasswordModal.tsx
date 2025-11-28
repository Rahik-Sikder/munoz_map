import { useState, type FormEvent } from 'react';
import { authUtils } from '../api/auth';

interface PasswordModalProps {
  onAuthenticated: () => void;
}

export default function PasswordModal({ onAuthenticated }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate password
    if (authUtils.login(password)) {
      onAuthenticated();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-parchment">
      <div className="w-full max-w-md px-8">
        <div className="bg-aged-paper border-2 border-map-border rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-serif font-bold text-colonial-brown mb-2">
              Admin Panel
            </h1>
            <p className="text-sm text-aged-ink">
              Enter the password to access the admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-colonial-brown mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors"
                placeholder="Enter password"
                autoFocus
                disabled={isSubmitting}
              />
              {error && (
                <p className="mt-2 text-sm text-colonial-red">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full px-4 py-2 bg-colonial-blue text-parchment rounded hover:bg-colonial-brown transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </form>

          {/* Back to Map Link */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-colonial-blue hover:text-colonial-brown transition-colors"
            >
              ← Back to Map
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
