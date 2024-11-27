import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogOut, Database, UserCircle, Package } from 'lucide-react';
import { LoadsListPage } from './LoadsList';
import { Button } from '../components/ui/Button';
import { AdminPanel } from './AdminPanel';
import { CprCalculatorPage } from './CprCalculator';
import { ProfilePage } from './Profile';
import { InventoryPage } from './Inventory';
import { useAuthStore } from '../store/auth';
import { DonateButton } from '../components/ui/DonateButton';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary-600 flex items-center">
                  <Database className="w-8 h-8 mr-2" />
                  Reload Data
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `${isActive ? 'border-primary-500' : 'border-transparent'} text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                  }
                >
                  My Loads
                </NavLink>
                <NavLink
                  to="/calculator"
                  className={({ isActive }) =>
                    `${isActive ? 'border-primary-500' : 'border-transparent'} text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                  }
                >
                  CPR Calculator
                </NavLink>
                <NavLink
                  to="/inventory"
                  className={({ isActive }) =>
                    `${isActive ? 'border-primary-500' : 'border-transparent'} text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                  }
                >
                  <Package className="w-4 h-4 mr-1" />
                  Inventory
                </NavLink>
                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `${isActive ? 'border-primary-500' : 'border-transparent'} text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                    }
                  >
                    Admin Panel
                  </NavLink>
                )}
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `${isActive ? 'border-primary-500' : 'border-transparent'} text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                  }
                >
                  <UserCircle className="w-4 h-4 mr-1" />
                  Profile
                </NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DonateButton />
              <Button
                variant=" primary"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<LoadsListPage />} />
          <Route path="/calculator" element={<CprCalculatorPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          {user?.role === 'admin' && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
}