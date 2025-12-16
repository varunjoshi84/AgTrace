import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Search, Package, Clock, CheckCircle, Shield } from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [trackingCode, setTrackingCode] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    verifiedProducts: 0,
    organicProducts: 0,
    trackedProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      // Get customer's purchases based on phone number
      const response = await axiosClient.get(`/customer/purchases/${user.phone}`);
      const customerPurchases = response.data.purchases || [];
      setPurchases(customerPurchases);
      
      // Calculate stats from real data
      const totalPurchases = customerPurchases.length;
      const verifiedProducts = customerPurchases.filter(p => p.productCode).length;
      const organicProducts = customerPurchases.filter(p => 
        p.product_name?.toLowerCase().includes('organic')
      ).length;
      const trackedProducts = customerPurchases.filter(p => p.currentStage).length;
      
      setStats({
        totalPurchases,
        verifiedProducts,
        organicProducts,
        trackedProducts
      });
    } catch (err) {
      setError('Failed to load purchase history');
      console.error('Load customer data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      // Navigate to track page with the product code
      navigate(`/track?code=${trackingCode.trim()}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'in_retail':
      case 'sold':
        return 'text-green-600 bg-green-50';
      case 'in_transport':
      case 'in transit':
        return 'text-blue-600 bg-blue-50';
      case 'in_warehouse':
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'in_retail':
      case 'sold':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_transport':
      case 'in transit':
        return <Clock className="w-4 h-4" />;
      case 'in_warehouse':
      case 'processing':
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Track Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2 text-green-600" />
          Quick Track
        </h3>
        <form onSubmit={handleTrack} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Enter product code (e.g., PC1734590123ABCDE)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={!trackingCode.trim()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Track
          </button>
        </form>
      </div>

      {/* Purchase Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verifiedProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Organic Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.organicProducts}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Purchases */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Recent Purchases</h3>
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No purchases found. Your purchase history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.slice(0, 5).map((purchase) => (
              <div key={purchase._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{purchase.product_name || 'Product'}</h4>
                    <p className="text-sm text-gray-500 mt-1">from {purchase.shop_name || purchase.vendor || 'Store'}</p>
                    <p className="text-xs text-gray-400 mt-1">Code: {purchase.productCode || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.currentStage || 'processing')}`}>
                      {getStatusIcon(purchase.currentStage || 'processing')}
                      <span className="ml-1">{purchase.currentStage || 'Processing'}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(purchase.purchase_date || purchase.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => navigate(`/track?code=${purchase.productCode}`)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={!purchase.productCode}
                  >
                    Track Journey →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust & Transparency */}
      <div className="bg-green-50 p-6 rounded-xl border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Trust & Transparency</h3>
        <p className="text-green-700 mb-4">
          Every product you purchase is tracked from farm to table, ensuring complete transparency and authenticity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            100% authentic products
          </div>
        </div>
      </div>
    </div>
  );
}