import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Leaf, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const result = await login(formData);
      const userRole = result.user.role;
      
      // Show success message before redirect
      setSuccess(`Welcome back! Redirecting to your ${userRole} dashboard...`);
      
      // Small delay to show success message
      setTimeout(() => {
        // Redirect based on user's role
        switch (userRole) {
          case 'Admin':
            navigate('/admin-dashboard');
            break;
          case 'Farmer':
            navigate('/farmer-dashboard');
            break;
          case 'Retailer':
            navigate('/retailer-dashboard');
            break;
          case 'Warehouse':
            navigate('/warehouse-dashboard');
            break;
          case 'Transporter':
            navigate('/transporter-dashboard');
            break;
          case 'Customer':
          default:
            navigate('/dashboard');
            break;
        }
      }, 1000);
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Leaf size={24} />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground">Sign in to AgriChain</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your personalized dashboard
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-input rounded-lg placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-input rounded-lg placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={16} className="text-muted-foreground" />
                  ) : (
                    <Eye size={16} className="text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group border-2 relative w-full flex justify-center py-3 px-4   text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary hover:text-primary/90 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}