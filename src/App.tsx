import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { SignInPage } from './pages/SignIn';
import { RegisterPage } from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useAuthInit } from './lib/auth';

function App() {
  const { user, loading } = useAuthStore();
  useAuthInit();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/signin"
        element={user ? <Navigate to="/" /> : <SignInPage />}
      />
      <Route 
        path="/register"
        element={user ? <Navigate to="/" /> : <RegisterPage />}
      />
      <Route 
        path="/*"
        element={user ? <Dashboard /> : <Navigate to="/signin" />}
      />
    </Routes>
  );
}

export default App;