import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Shield, UserCog, RefreshCw } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { User } from '../types';

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as User;
      });
      setUsers(usersData);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (user: User) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await updateDoc(doc(db, 'users', user.id), {
        role: newRole
      });
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, role: newRole } : u
      ));
      setSuccessMessage(`Successfully ${newRole === 'admin' ? 'promoted' : 'demoted'} user`);
    } catch (err) {
      setError('Failed to update user role');
      console.error(err);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent');
    } catch (err) {
      setError('Failed to send password reset email');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-primary-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-500 p-4 rounded-md">
          {successMessage}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAdmin(user)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <UserCog className="h-4 w-4 mr-1" />
                    {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetPassword(user.email)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset Password
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}