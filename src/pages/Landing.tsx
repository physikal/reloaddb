import { Link } from 'react-router-dom';
import { Database, Target, Package, Calculator, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-600 flex items-center">
                <Database className="w-8 h-8 mr-2" />
                ReloadDB
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Your Complete Reloading Data Management Solution
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
              Track your loads, manage inventory, and log range sessions with precision and ease.
              Built by reloaders, for reloaders.
            </p>
            <div className="mt-8">
              <Link to="/register">
                <Button size="lg" className="px-8">
                  Start Free <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Load Data Management */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <img 
                  src="https://nrddhhushtdalsuuiiob.supabase.co/storage/v1/object/sign/Screenshots/Loadcard.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJTY3JlZW5zaG90cy9Mb2FkY2FyZC5wbmciLCJpYXQiOjE3MzgzNTk5ODUsImV4cCI6MjYwMjI3MzU4NX0.JKPBgpW9Xh5sUst7kaOSbP71TbgFlKxCFvY5R24Gsa8"
                  alt="Load Data Management"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Load Data Management</h3>
              <p className="text-gray-600">
                Create and manage your reloading data with ease. Track bullet, powder, primer, and brass details.
                Add notes, mark favorites, and keep your loads organized.
              </p>
            </div>

            {/* Cost Per Round Calculator */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <img 
                  src="https://nrddhhushtdalsuuiiob.supabase.co/storage/v1/object/sign/Screenshots/CostPerRound.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJTY3JlZW5zaG90cy9Db3N0UGVyUm91bmQucG5nIiwiaWF0IjoxNzM4MzU5OTMxLCJleHAiOjI2MDIyNzM1MzF9.lbrB7NIcgXNBoq8_5DYF1w7tTlYObOmeQO30UKTVTH0"
                  alt="Cost Per Round Calculator"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cost Per Round Calculator</h3>
              <p className="text-gray-600">
                Calculate your reloading costs with precision. Track component costs, factor in brass reuse,
                and understand your cost per round breakdown.
              </p>
            </div>

            {/* Inventory Management */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <img 
                  src="https://nrddhhushtdalsuuiiob.supabase.co/storage/v1/object/sign/Screenshots/InventoryManagement.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJTY3JlZW5zaG90cy9JbnZlbnRvcnlNYW5hZ2VtZW50LnBuZyIsImlhdCI6MTczODM1OTk2MCwiZXhwIjoyNjAyMjczNTYwfQ.u2P6__JmzMLZoC88gWsUwvCwFLbkumAQIvTg-BC97uc"
                  alt="Inventory Management"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h3>
              <p className="text-gray-600">
                Keep track of all your reloading components. Monitor quantities, track lot numbers,
                and manage your firearms inventory in one place.
              </p>
            </div>

            {/* Range Log */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <img 
                  src="https://nrddhhushtdalsuuiiob.supabase.co/storage/v1/object/sign/Screenshots/RangeLog.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJTY3JlZW5zaG90cy9SYW5nZUxvZy5wbmciLCJpYXQiOjE3MzgzNTk5OTcsImV4cCI6MjYwMjI3MzU5N30.a2SGnWRL999Qs4XqvLLQLKv3_3HCJYqTL1pOfz070T4"
                  alt="Range Log"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Range Log</h3>
              <p className="text-gray-600">
                Document your range sessions with detailed shot strings, muzzle velocity data,
                and statistical analysis. Import data directly from your Garmin device.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
            <p className="mt-4 text-lg text-gray-600">
              A comprehensive suite of tools for the serious reloader
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Load Management</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Detailed load data tracking</li>
                <li>• Customizable load cards</li>
                <li>• Favorite loads</li>
                <li>• Excel import/export</li>
                <li>• Cost tracking</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Control</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Component tracking</li>
                <li>• Lot number management</li>
                <li>• Usage history</li>
                <li>• Automatic updates</li>
                <li>• Firearms inventory</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Range Tools</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Shot string analysis</li>
                <li>• Muzzle velocity tracking</li>
                <li>• Statistical calculations</li>
                <li>• Garmin data import</li>
                <li>• Ammunition usage tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join the community of reloaders who trust ReloadDB to manage their reloading data.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8">
                  Create Free Account <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Database className="w-6 h-6 text-primary-600 mr-2" />
              <span className="text-gray-900 font-semibold">ReloadDB</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} ReloadDB. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}