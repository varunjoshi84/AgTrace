import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

const WarehouseDashboard = () => {
  const { user } = useAuth();
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableRetailers, setAvailableRetailers] = useState([]);
  const [selectedRetailers, setSelectedRetailers] = useState({});

  useEffect(() => {
    loadAssignedProducts();
    loadRetailers();
  }, []);

  const loadRetailers = async () => {
    try {
      const response = await axiosClient.get('/warehouse/available-retailers');
      setAvailableRetailers(response.data || []);
    } catch (err) {
      console.error('Load retailers error:', err);
    }
  };

  const loadAssignedProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/warehouse/assigned-products');
      setAssignedProducts(response.data || []);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setAssignedProducts([]);
      } else {
        setError('Failed to load assigned products');
        console.error('Load products error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchToRetail = async (productId) => {
    const retailerId = selectedRetailers[productId];
    if (!retailerId) {
      setError('Please select a retailer before dispatching');
      return;
    }
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await axiosClient.put(`/warehouse/${warehouseId}/dispatch`, {
        assignedRetailer: selectedRetailer
      });
      setSuccess('Product dispatched to retail successfully!');
      setSelectedRetailer(''); // Reset selection
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch product');
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
            Warehouse Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Manage warehouse storage and dispatch.
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products Available for Storage */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Available for Storage ({availableProducts.length})
              </h2>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Stage: In Warehouse
              </span>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : availableProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products available for storage
              </div>
            ) : (
              <div className="space-y-4">
                {availableProducts.map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.product_name}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowCreateForm(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Store
                      </button>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div><span className="font-medium">Product Code:</span> {product.productCode}</div>
                      <div><span className="font-medium">Farmer:</span> {product.farmer?.name}</div>
                      <div><span className="font-medium">Quantity:</span> {product.quantity} units</div>
                      <div><span className="font-medium">Quality:</span> {product.quality}</div>
                      <div><span className="font-medium">Harvest Date:</span> {formatDate(product.harvest_date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stored Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Stored Products ({myWarehouseEntries.length})
            </h2>

            {/* Retailer Selection for Dispatch */}
            {myWarehouseEntries.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Retailer for Dispatch
                </label>
                <select
                  value={selectedRetailer}
                  onChange={(e) => setSelectedRetailer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a retailer...</option>
                  {availableRetailers.map((retailer) => (
                    <option key={retailer._id} value={retailer._id}>
                      {retailer.name} ({retailer.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a retailer before dispatching products
                </p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : myWarehouseEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products stored yet
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myWarehouseEntries.map((entry) => (
                  <div key={entry._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {entry.product?.product_name || 'Product'}
                        </h4>
                        <div className="text-sm text-gray-600">
                          <div><span className="font-medium">Location:</span> {entry.storage_location}</div>
                          <div><span className="font-medium">Temperature:</span> {entry.temperature}</div>
                          <div><span className="font-medium">Stored Date:</span> {formatDate(entry.stored_date)}</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDispatchToRetail(entry._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Dispatch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Warehouse Entry Form Modal */}
        {showCreateForm && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Store Product: {selectedProduct.product_name}
              </h3>
              
              <form onSubmit={handleCreateWarehouseEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={warehouseForm.storage_location}
                    onChange={(e) => setWarehouseForm(prev => ({
                      ...prev,
                      storage_location: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Section A, Shelf 3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Temperature
                  </label>
                  <select
                    value={warehouseForm.temperature}
                    onChange={(e) => setWarehouseForm(prev => ({
                      ...prev,
                      temperature: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Normal">Normal (Room Temperature)</option>
                    <option value="Cold">Cold Storage</option>
                    <option value="Frozen">Frozen</option>
                    <option value="Controlled">Controlled Temperature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Date
                  </label>
                  <input
                    type="date"
                    value={warehouseForm.stored_date}
                    onChange={(e) => setWarehouseForm(prev => ({
                      ...prev,
                      stored_date: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
                  >
                    Store Product
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseDashboard;