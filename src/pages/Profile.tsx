import { useState } from 'react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Key, Smartphone } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/auth';
import { generateSecret, verifyToken, generateQRCodeUrl } from '../lib/2fa';

export function ProfilePage() {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorEnabled || false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [secret2FA, setSecret2FA] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user?.email || '',
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPassword);
      
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to update password. Please check your current password.');
    }
  };

  const handle2FAToggle = async () => {
    if (!is2FAEnabled) {
      const newSecret = generateSecret();
      setSecret2FA(newSecret);
      setShowQRCode(true);
    } else {
      try {
        await updateDoc(doc(db, 'users', user!.id), {
          twoFactorEnabled: false,
          twoFactorSecret: null
        });
        setIs2FAEnabled(false);
        setSuccess('2FA has been disabled');
      } catch (err) {
        setError('Failed to disable 2FA');
      }
    }
  };

  const handleVerify2FA = async () => {
    if (!secret2FA || !verificationCode) {
      setError('Please enter a verification code');
      return;
    }

    try {
      const isValid = verifyToken(verificationCode, secret2FA);
      
      if (isValid) {
        await updateDoc(doc(db, 'users', user!.id), {
          twoFactorEnabled: true,
          twoFactorSecret: secret2FA
        });
        setIs2FAEnabled(true);
        setShowQRCode(false);
        setSuccess('2FA has been enabled successfully');
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError('Failed to enable 2FA');
    }
  };

  const qrCodeUrl = user?.email ? generateQRCodeUrl(secret2FA, user.email) : '';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-3">
        <Shield className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 p-4 rounded-md">
          {success}
        </div>
      )}

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium flex items-center text-gray-900">
            <Key className="w-5 h-5 mr-2" />
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
            <div>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-medium flex items-center text-gray-900">
            <Smartphone className="w-5 h-5 mr-2" />
            Two-Factor Authentication
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Add an extra layer of security to your account using authenticator apps like Google Authenticator, Authy, or 2FAS.
          </p>
          
          <div className="mt-4">
            <Button
              onClick={handle2FAToggle}
              variant={is2FAEnabled ? 'secondary' : 'primary'}
            >
              {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>

          {showQRCode && !is2FAEnabled && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg inline-block">
                <QRCodeSVG
                  value={qrCodeUrl}
                  size={200}
                />
              </div>
              <p className="text-sm text-gray-600">
                Scan this QR code with your authenticator app, then enter the verification code below.
              </p>
              <div className="max-w-xs">
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              <Button onClick={handleVerify2FA}>Verify and Enable 2FA</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}