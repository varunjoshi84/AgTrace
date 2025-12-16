import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';

// Import Components
import Footer from './components/common/Footer';
import ScrollToTop from './components/ScrollToTop';
import BackToTopButton from './components/BackToTopButton';

// Import Pages
import LoginPage from './pages/LoginPage';
import Signup from './pages/Signup';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import TransporterDashboard from './pages/TransporterDashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TrackPage from './pages/TrackPage';

// Helper function to get dashboard route based on user role
const getDashboardRoute = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin-dashboard';
    case 'Farmer':
      return '/farmer-dashboard';
    case 'Retailer':
      return '/retailer-dashboard';
    case 'Warehouse':
      return '/warehouse-dashboard';
    case 'Transporter':
      return '/transporter-dashboard';
    case 'Customer':
    default:
      return '/dashboard';
  }
};

// Navigation Component
const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="shrink-0">
              <h1 className="text-xl font-bold text-green-600">AgriChain</h1>
            </div>
            {!user && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Home
                  </a>
                  <a href="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    About
                  </a>
                  <a href="/track" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Track
                  </a>
                </div>
              </div>
            )}
            
            {user && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="/track" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Track
                  </a>
                  <a 
                    href={getDashboardRoute(user.role)} 
                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 text-sm font-medium rounded-md"
                  >
                    📊 My Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Mobile dashboard link */}
                <div className="md:hidden">
                  <a 
                    href={getDashboardRoute(user.role)} 
                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 text-sm font-medium rounded-md"
                  >
                    📊 Dashboard
                  </a>
                </div>
                
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-medium">{user.name}</span>
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <a 
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Dashboard Route Component - uses unified dashboard
const DashboardRoute = () => {
  return <Dashboard />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <div className="App min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/track" element={<TrackPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRoute />
                </ProtectedRoute>
              } 
            />

            {/* Role-specific Dashboards */}
            <Route 
              path="/farmer-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/transporter-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Transporter']}>
                  <TransporterDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/warehouse-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Warehouse']}>
                  <WarehouseDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/retailer-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Retailer']}>
                  <RetailerDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                </div>
              } 
            />
          </Routes>          </main>
          <Footer />        </div>
        <BackToTopButton />
      </AuthProvider>
    </Router>
  );
};

export default App;
