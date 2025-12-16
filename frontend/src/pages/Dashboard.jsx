import React from 'react';
import { useAuth } from '../context/useAuth';
import FarmerDashboard from './Dashboard/FarmerDashboard';
import CustomerDashboard from './Dashboard/CustomerDashboard';
import SupplierDashboard from './Dashboard/Supplier';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'Farmer':
        return <FarmerDashboard />;
      case 'Customer':
        return <CustomerDashboard />;
      case 'Supplier':
        return <SupplierDashboard />;
      case 'Transporter':
        return <SupplierDashboard />; // Use Supplier dashboard for now
      case 'Warehouse':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Welcome, {user.name}!</h2>
            <p className="text-muted-foreground">Warehouse dashboard is coming soon.</p>
          </div>
        );
      case 'Retailer':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Welcome, {user.name}!</h2>
            <p className="text-muted-foreground">Retailer dashboard is coming soon.</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Welcome, {user.name}!</h2>
            <p className="text-muted-foreground">Dashboard for {user.role} role is not implemented yet.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Role: {user.role}</p>
        </div>
        
        {renderDashboard()}
      </div>
    </div>
  );
}