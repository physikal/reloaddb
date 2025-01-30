import { SignInForm } from '../components/auth/SignInForm';
import { AlertCircle } from 'lucide-react';

export function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Important Notice</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  We've upgraded our platform! Existing users will need to create a new account.
                </p>
                <p className="mt-2">
                  To access your old data, visit{' '}
                  <a 
                    href="https://old.reloaddb.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-amber-900"
                  >
                    old.reloaddb.com
                  </a>
                  {' '}and sign in with your previous account.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Sign in to ReloadDB
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your credentials to access your account or{' '}
              <a href="/register" className="text-primary-600 hover:text-primary-500">
                create a new account
              </a>
            </p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}