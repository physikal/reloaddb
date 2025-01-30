import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function RegisterSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">
            Account Created Successfully!
          </h3>
        </div>

        <div className="space-y-4">
          <div className="text-gray-600">
            <p className="text-lg">We've sent a verification email to:</p>
            <p className="font-medium text-lg text-gray-900 mt-2">{email}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4 text-lg">Next Steps:</h4>
            <ol className="text-left space-y-4">
              <li className="flex items-center">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 text-lg font-medium mr-3">
                  1
                </span>
                <span className="text-gray-700">Check your email inbox</span>
              </li>
              <li className="flex items-center">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 text-lg font-medium mr-3">
                  2
                </span>
                <span className="text-gray-700">Click the verification link</span>
              </li>
              <li className="flex items-center">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 text-lg font-medium mr-3">
                  3
                </span>
                <span className="text-gray-700">Sign in to your account</span>
              </li>
            </ol>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 text-sm">
              <Mail className="inline-block w-5 h-5 mr-2 mb-1" />
              Can't find the email? Check your spam folder or click the button below to go to the sign in page.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={() => navigate('/signin')}
            className="w-full text-lg py-3"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}