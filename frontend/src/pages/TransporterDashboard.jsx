import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

const TransporterDashboard = () => {
  const { user } = useAuth();
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAssignedProducts();
  }, []);

  const loadAssignedProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/transport/assigned-products');
      setAssignedProducts(response.data || []);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setAssignedProducts([]);
      } else {
        setError('Failed to load assigned products');
        console.error('Load products error:', err);
        console.error('Error response:', err.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async (productId) => {
    try {
      await axiosClient.put(`/transport/${productId}/pickup`);
      setSuccess('Product marked as picked up!');
      loadAssignedProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to pickup product');
    }
  };

  const handleDeliver = async (productId) => {
    try {
      await axiosClient.put(`/transport/${productId}/deliver`);
      setSuccess('Product delivered to warehouse!');
      loadAssignedProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deliver product');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Transporter Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Manage your assigned deliveries.
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Assigned Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Assigned Deliveries ({assignedProducts.length})
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : assignedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-3">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Deliveries Assigned</h3>
              <p className="text-gray-500 text-sm mb-4">
                You don't have any products assigned for delivery yet.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm">
                <p className="font-medium text-blue-900 mb-2">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Farmers create products and assign them to you for transport</li>
                  <li>Once assigned, products will appear here in "Ready for Pickup" status</li>
                  <li>Click "Mark Picked Up" when you collect the products</li>
                  <li>Click "Mark Delivered" when you deliver to the warehouse</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedProducts.map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.product_name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.currentStage === 'harvested' ? 'bg-yellow-100 text-yellow-800' :
                      product.currentStage === 'in_transport' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.currentStage === 'harvested' ? 'Ready for Pickup' :
                       product.currentStage === 'in_transport' ? 'In Transit' : product.currentStage}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div><span className="font-medium">Code:</span> {product.productCode}</div>
                    <div><span className="font-medium">Farmer:</span> {product.farmer?.name}</div>
                    <div><span className="font-medium">Pickup:</span> {product.farmer?.location || 'Not specified'}</div>
                    <div><span className="font-medium">Deliver to:</span> {product.assignedWarehouse?.name || 'Not specified'}</div>
                    <div><span className="font-medium">Quantity:</span> {product.quantity} units</div>
                    <div><span className="font-medium">Harvest Date:</span> {formatDate(product.harvest_date)}</div>
                  </div>

                  <div className="flex gap-2">
                    {product.currentStage === 'harvested' && (
                      <button
                        onClick={() => handlePickup(product._id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {product.currentStage === 'in_transport' && (
                      <button
                        onClick={() => handleDeliver(product._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransporterDashboard;