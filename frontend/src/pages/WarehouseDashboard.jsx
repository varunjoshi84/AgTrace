import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

const WarehouseDashboard = () => {
  const { user } = useAuth();
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [storedProducts, setStoredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableRetailers, setAvailableRetailers] = useState([]);
  const [selectedRetailers, setSelectedRetailers] = useState({});
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAllStored, setShowAllStored] = useState(false);
  const [storeForm, setStoreForm] = useState({
    storage_location: '',
    temperature: 'Normal',
    stored_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAssignedProducts();
    loadStoredProducts();
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
      const [productsResponse, storedResponse] = await Promise.all([
        axiosClient.get('/warehouse/assigned-products'),
        axiosClient.get('/warehouse')
      ]);
      
      // Filter out products that are already stored
      const storedProductIds = new Set(storedResponse.data.map(entry => 
        entry.product?._id || entry.product
      ));
      
      const unstored = productsResponse.data.filter(product => 
        !storedProductIds.has(product._id)
      );
      
      setAssignedProducts(unstored || []);
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

  const loadStoredProducts = async () => {
    try {
      const response = await axiosClient.get('/warehouse');
      setStoredProducts(response.data || []);
    } catch (err) {
      console.error('Load stored products error:', err);
    }
  };

  const handleStoreProduct = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/warehouse', {
        product: selectedProduct._id,
        ...storeForm
      });
      
      setSuccess('Product stored in warehouse successfully!');
      setShowStoreForm(false);
      setSelectedProduct(null);
      setStoreForm({
        storage_location: '',
        temperature: 'Normal',
        stored_date: new Date().toISOString().split('T')[0]
      });
      loadAssignedProducts();
      loadStoredProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to store product');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDispatchToRetail = async (warehouseEntryId, productId) => {
    const retailerId = selectedRetailers[productId];
    if (!retailerId) {
      setError('Please select a retailer before dispatching');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await axiosClient.put(`/warehouse/${warehouseEntryId}/dispatch`, {
        assignedRetailer: retailerId
      });
      
      setSuccess('Product dispatched to retailer successfully!');
      setSelectedRetailers(prev => {
        const newState = {...prev};
        delete newState[productId];
        return newState;
      });
      loadStoredProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Dispatch error:', err);
      setError(err.response?.data?.message || 'Failed to dispatch product');
      setTimeout(() => setError(''), 3000);
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
            Welcome back, {user?.name}! Manage your warehouse inventory.
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

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products to Store */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available for Storage ({assignedProducts.length})
            </h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : assignedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products available for storage
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {assignedProducts.map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.product_name}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStoreForm(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        Store
                      </button>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div><span className="font-medium">Code:</span> {product.productCode}</div>
                      <div><span className="font-medium">Farmer:</span> {product.farmer?.name}</div>
                      <div><span className="font-medium">Quantity:</span> {product.quantity} units</div>
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
              Stored Products ({storedProducts.length})
            </h2>

            {storedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products stored yet
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {(showAllStored ? storedProducts : storedProducts.slice(0, 5)).map((entry) => (
                    <div key={entry._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {entry.product?.product_name || 'Product'}
                        </h4>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <div><span className="font-medium">Location:</span> {entry.storage_location}</div>
                        <div><span className="font-medium">Temperature:</span> {entry.temperature}</div>
                        <div><span className="font-medium">Stored Date:</span> {formatDate(entry.stored_date)}</div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Select Retailer:
                        </label>
                        <select
                          value={selectedRetailers[entry.product?._id] || ''}
                          onChange={(e) => setSelectedRetailers(prev => ({
                            ...prev,
                            [entry.product?._id]: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                        >
                          <option value="">Select Retailer</option>
                          {availableRetailers.map((retailer) => (
                            <option key={retailer._id} value={retailer._id}>
                              {retailer.name} ({retailer.email})
                            </option>
                          ))}
                        </select>
                        
                        <button
                          onClick={() => handleDispatchToRetail(entry._id, entry.product?._id)}
                          disabled={!selectedRetailers[entry.product?._id]}
                          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Dispatch to Retailer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show More/Show Less Button */}
                {storedProducts.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowAllStored(!showAllStored)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {showAllStored ? 'Show Less' : `Show More (${storedProducts.length - 5} more)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Store Product Modal */}
        {showStoreForm && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Store Product: {selectedProduct.product_name}
              </h3>
              
              <form onSubmit={handleStoreProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={storeForm.storage_location}
                    onChange={(e) => setStoreForm(prev => ({
                      ...prev,
                      storage_location: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Section A, Shelf 3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Temperature
                  </label>
                  <select
                    value={storeForm.temperature}
                    onChange={(e) => setStoreForm(prev => ({
                      ...prev,
                      temperature: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                    value={storeForm.stored_date}
                    onChange={(e) => setStoreForm(prev => ({
                      ...prev,
                      stored_date: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-medium"
                  >
                    Store Product
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStoreForm(false);
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
