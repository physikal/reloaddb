import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { PasswordResetModal } from './PasswordResetModal';
import { signIn, resetPassword } from '../../lib/auth';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await resetPassword(email);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
      setIsResetModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
            {successMessage}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </button>
        </div>
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>

      <PasswordResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSubmit={handlePasswordReset}
        defaultEmail={email}
      />
    </>
  );
}