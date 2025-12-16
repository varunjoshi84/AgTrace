import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

const TransporterDashboard = () => {
  const { user } = useAuth();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [myTransports, setMyTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAllTransports, setShowAllTransports] = useState(false);
  const [displayLimit] = useState(10);

  // Transport form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [transportForm, setTransportForm] = useState({
    from_location: '',
    to_location: '',
    status: 'Picked Up'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, transportsResponse] = await Promise.all([
        axiosClient.get('/transport/available-products'),
        axiosClient.get('/transport')
      ]);
      
      setAvailableProducts(productsResponse.data || []);
      // Sort transports by date (newest first)
      const transports = (transportsResponse.data || []).sort((a, b) => 
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );
      setMyTransports(transports);
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransport = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    try {
      setError('');
      
      await axiosClient.post('/transport', {
        product: selectedProduct._id,
        ...transportForm
      });

      setSuccess('Transport created successfully!');
      setShowCreateForm(false);
      setSelectedProduct(null);
      setTransportForm({
        from_location: '',
        to_location: '',
        status: 'Picked Up'
      });
      
      // Reload data
      loadData();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transport');
    }
  };

  const handleCompleteTransport = async (transportId) => {
    try {
      await axiosClient.put(`/transport/${transportId}/complete`);
      setSuccess('Transport completed successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete transport');
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
            Welcome back, {user?.name}! Manage pickups and deliveries.
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

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Available Products for Pickup */}
          <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Available for Pickup ({availableProducts.length})
              </h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Stage: Harvested
              </span>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : availableProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products available for pickup
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
                          // Auto-populate pickup location from farm profile
                          const farmLocation = product.pickup_location?.full_address || product.farmer?.address || product.farmer?.location || 'Farm location not specified';
                          setTransportForm({
                            from_location: farmLocation,
                            to_location: '',
                            status: 'Picked Up'
                          });
                          setShowCreateForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Pickup
                      </button>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div><span className="font-medium">Product Code:</span> {product.productCode}</div>
                      <div><span className="font-medium">Farmer:</span> {product.farmer?.name}</div>
                      <div><span className="font-medium">Quantity:</span> {product.quantity} units</div>
                      <div><span className="font-medium">Quality:</span> {product.quality}</div>
                      <div><span className="font-medium">Harvest Date:</span> {formatDate(product.harvest_date)}</div>
                      
                      {/* Farm Location Information */}
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="text-xs font-medium text-blue-700 mb-1">📍 PICKUP LOCATION</div>
                        <div className="bg-blue-50 rounded-md p-2 space-y-1">
                          <div><span className="font-medium text-blue-800">Farm:</span> {product.pickup_location?.farm_name || product.farmer?.name || 'Farm name not set'}</div>
                          <div><span className="font-medium text-blue-800">Location:</span> {product.pickup_location?.location || product.farmer?.location || 'Location not set'}</div>
                          <div><span className="font-medium text-blue-800">Address:</span> {product.pickup_location?.full_address || product.farmer?.address || 'Address not set'}</div>
                          <div><span className="font-medium text-blue-800">Pincode:</span> {product.pickup_location?.pincode || product.farmer?.pincode || 'Not set'}</div>
                          <div><span className="font-medium text-blue-800">Contact:</span> {product.pickup_location?.contact_phone || product.farmer?.phone || 'Phone not set'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Transports */}
          <div className="xl:col-span-3 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                My Transports ({myTransports.length})
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : myTransports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transports yet
              </div>
            ) : (
              <div className="space-y-4">
                {(showAllTransports ? myTransports : myTransports.slice(0, displayLimit)).map((transport) => (
                  <div key={transport._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><span className="font-medium text-gray-800">From:</span> {transport.from_location}</div>
                          <div><span className="font-medium text-gray-800">To:</span> {transport.to_location}</div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">Status:</span> 
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transport.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              transport.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {transport.status}
                            </span>
                          </div>
                          <div><span className="font-medium text-gray-800">Date:</span> {formatDate(transport.date)}</div>
                        </div>
                      </div>
                      
                      {transport.status !== 'Delivered' && (
                        <button
                          onClick={() => handleCompleteTransport(transport._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    {transport.product && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Product:</span> {transport.product?.product_name || 'N/A'} |
                          <span className="font-medium"> Code:</span> {transport.product?.productCode || 'N/A'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Show more button at the bottom */}
                {myTransports.length > displayLimit && (
                  <div className="text-center pt-4 border-t border-gray-200">
                    {!showAllTransports ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-500">
                          Showing {displayLimit} of {myTransports.length} transports
                        </div>
                        <button
                          onClick={() => setShowAllTransports(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Show More ({myTransports.length - displayLimit} remaining)
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAllTransports(false)}
                        className="text-blue-600 hover:text-blue-800 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        Show Less (Last {displayLimit} only)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Transport Form Modal */}
        {showCreateForm && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create Transport for: {selectedProduct.product_name}
              </h3>
              
              {/* Farm Information Display */}
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">📍 Pickup Details</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><span className="font-medium">Farm:</span> {selectedProduct.pickup_location?.farm_name || selectedProduct.farmer?.name}</div>
                  <div><span className="font-medium">Contact:</span> {selectedProduct.pickup_location?.contact_phone || selectedProduct.farmer?.phone}</div>
                  <div><span className="font-medium">Complete Address:</span> {selectedProduct.pickup_location?.full_address || selectedProduct.farmer?.address || selectedProduct.farmer?.location}</div>
                </div>
              </div>
              
              <form onSubmit={handleCreateTransport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup From Location (Auto-filled)
                  </label>
                  <input
                    type="text"
                    value={transportForm.from_location}
                    onChange={(e) => setTransportForm(prev => ({
                      ...prev,
                      from_location: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-50"
                    placeholder="Farm pickup location"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-filled from farm profile. You can edit if needed.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Location
                  </label>
                  <input
                    type="text"
                    value={transportForm.to_location}
                    onChange={(e) => setTransportForm(prev => ({
                      ...prev,
                      to_location: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Central Warehouse"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={transportForm.status}
                    onChange={(e) => setTransportForm(prev => ({
                      ...prev,
                      status: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Picked Up">Picked Up</option>
                    <option value="In Transit">In Transit</option>
                    <option value="On Route">On Route</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
                  >
                    Create Transport
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

export default TransporterDashboard;