import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Leaf, Eye, EyeOff, User, Mail, Lock, UserCheck } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const { confirmPassword: _, ...registrationData } = formData;
      const result = await register(registrationData);
      
      // Redirect based on user's role
      const userRole = result.user?.role || formData.role;
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
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const roleDescriptions = {
    Customer: 'Track your food from farm to table, view purchase history, and verify product authenticity.',
    Farmer: 'Manage your crops, create batch records, track shipments, and showcase your sustainable practices.',
    Transporter: 'Oversee logistics, manage shipments, update delivery status, and ensure supply chain transparency.',
    Warehouse: 'Manage inventory, process shipments, update storage status, and maintain quality control.',
    Retailer: 'Sell products to customers, manage inventory, process orders, and track sales performance.'
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-secondary/20">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Leaf size={24} />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground">Join AgriChain</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account to start tracking agricultural produce
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-input rounded-lg placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-input rounded-lg placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-input rounded-lg placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-input rounded-lg placeholder-muted-foreground text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} className="text-muted-foreground" />
                  ) : (
                    <Eye size={16} className="text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
                I am a
              </label>
              <div className="relative">
                <UserCheck size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-8 py-2 border border-input rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Customer">Customer</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Transporter">Transporter</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Retailer">Retailer</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {roleDescriptions[formData.role]}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border  text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/90 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}