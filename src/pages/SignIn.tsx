import { SignInForm } from '../components/auth/SignInForm';

export function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow">
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
  );
}