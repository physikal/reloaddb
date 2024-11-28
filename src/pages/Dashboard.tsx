import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogOut, Database, UserCircle, Package, Calculator, Target } from 'lucide-react';
import { LoadsListPage } from './LoadsList';
import { Button } from '../components/ui/Button';
import { AdminPanel } from './AdminPanel';
import { CprCalculatorPage } from './CprCalculator';
import { ProfilePage } from './Profile';
import { InventoryPage } from './Inventory';
import { RangeLogPage } from './RangeLog';
import { useAuthStore } from '../store/auth';
import { DonateButton } from '../components/ui/DonateButton';
import { useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showToolsMenu, setShowToolsMenu] = useState(false);

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
                <div className="relative group">
                  <button
                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-gray-300 h-16"
                    onClick={() => setShowToolsMenu(!showToolsMenu)}
                    onBlur={() => setTimeout(() => setShowToolsMenu(false), 100)}
                  >
                    Tools
                  </button>
                  {showToolsMenu && (
                    <div className="absolute left-0 top-14 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <NavLink
                          to="calculator"
                          className={({ isActive }) => `${
                            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block px-4 py-2 text-sm hover:bg-gray-100 flex items-center`}
                          onClick={() => setShowToolsMenu(false)}
                        >
                          <Calculator className="w-4 h-4 inline-block mr-2" />
                          CPR Calculator
                        </NavLink>
                        <NavLink
                          to="inventory"
                          className={({ isActive }) => `${
                            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block px-4 py-2 text-sm hover:bg-gray-100 flex items-center`}
                          onClick={() => setShowToolsMenu(false)}
                        >
                          <Package className="w-4 h-4 inline-block mr-2" />
                          Inventory
                        </NavLink>
                        <NavLink
                          to="range-log"
                          className={({ isActive }) => `${
                            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block px-4 py-2 text-sm hover:bg-gray-100 flex items-center`}
                          onClick={() => setShowToolsMenu(false)}
                        >
                          <Target className="w-4 h-4 inline-block mr-2" />
                          Range Log
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
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
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profile
                </NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DonateButton />
              <Button
                variant="primary"
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
          <Route path="/range-log" element={<RangeLogPage />} />
          {user?.role === 'admin' && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
}