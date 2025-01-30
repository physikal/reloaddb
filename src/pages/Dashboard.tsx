import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Database, UserCircle, Package, Calculator, Target, FileText } from 'lucide-react';
import { LoadsListPage } from './LoadsList';
import { Button } from '../components/ui/Button';
import { AdminPanel } from './AdminPanel';
import { CprCalculatorPage } from './CprCalculator';
import { ProfilePage } from './Profile';
import { InventoryPage } from './Inventory';
import { RangeLogPage } from './RangeLog';
import { ChangelogPage } from './Changelog';
import { useAuthStore } from '../store/auth';
import { DonateButton } from '../components/ui/DonateButton';
import { useState, useRef, useEffect } from 'react';
import { signOut } from '../lib/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowToolsMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = () => {
    setShowToolsMenu(false);
  };

  async function handleLogout() {
    try {
      await signOut();
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowToolsMenu(!showToolsMenu);
                    }}
                    tabIndex={0}
                  >
                    Tools
                  </button>
                  {showToolsMenu && (
                    <div ref={menuRef} className="absolute left-0 top-14 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <NavLink
                          to="/calculator"
                          onClick={handleNavigation}
                          className={({ isActive }) => `${
                            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block px-4 py-2 text-sm hover:bg-gray-100 flex items-center focus:outline-none`}
                        >
                          <Calculator className="w-4 h-4 inline-block mr-2" />
                          CPR Calculator
                        </NavLink>
                        <NavLink
                          to="/inventory"
                          onClick={handleNavigation}
                          className={({ isActive }) => `${
                            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block px-4 py-2 text-sm hover:bg-gray-100 flex items-center focus:outline-none`}
                        >
                          <Package className="w-4 h-4 inline-block mr-2" />
                          Inventory
                        </NavLink>
                        <NavLink
                          to="/range-log"
                          onClick={handleNavigation}
                          className={({ isActive }) => `${
                            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } block px-4 py-2 text-sm hover:bg-gray-100 flex items-center focus:outline-none`}
                        >
                          <Target className="w-4 h-4 inline-block mr-2" />
                          Range Log
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
                <NavLink
                  to="/changelog"
                  className={({ isActive }) =>
                    `${isActive ? 'border-primary-500' : 'border-transparent'} text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                  }
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Changelog
                </NavLink>
                {user?.email === 'boody@physikal.com' && (
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
          <Route path="/changelog" element={<ChangelogPage />} />
          {user?.email === 'boody@physikal.com' && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
}