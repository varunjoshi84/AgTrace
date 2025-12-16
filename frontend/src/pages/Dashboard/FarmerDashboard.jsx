import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import axiosClient from '../../api/axiosClient';
import { Leaf, Package, TrendingUp, Users } from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    soldProducts: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFarmerData();
  }, []);

  const loadFarmerData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/farmer/products');
      const farmerProducts = response.data.products || [];
      setProducts(farmerProducts);
      
      // Calculate stats from real data
      const totalProducts = farmerProducts.length;
      const activeProducts = farmerProducts.filter(p => p.isActive && p.currentStage !== 'sold').length;
      const soldProducts = farmerProducts.filter(p => p.currentStage === 'sold').length;
      const totalRevenue = farmerProducts
        .filter(p => p.price && p.currentStage === 'sold')
        .reduce((sum, p) => sum + (p.price * p.quantity), 0);
      
      setStats({
        totalProducts,
        activeProducts,
        soldProducts,
        totalRevenue
      });
    } catch (err) {
      setError('Failed to load farmer data');
      console.error('Load farmer data error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sold Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.soldProducts}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">Add New Product</div>
            <div className="text-sm text-gray-500 mt-1">Create a new product batch</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">View Products</div>
            <div className="text-sm text-gray-500 mt-1">Manage existing products</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">Track Shipments</div>
            <div className="text-sm text-gray-500 mt-1">Monitor product journey</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">View Reports</div>
            <div className="text-sm text-gray-500 mt-1">Analyze performance</div>
          </button>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Recent Products</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Organic Tomatoes</p>
                <p className="text-sm text-gray-500">Batch #BT2025001</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">50 kg</p>
              <p className="text-sm text-green-600">Active</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Fresh Lettuce</p>
                <p className="text-sm text-gray-500">Batch #BL2025002</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">30 kg</p>
              <p className="text-sm text-blue-600">In Transit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}