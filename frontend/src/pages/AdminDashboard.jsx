import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [transports, setTransports] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [retails, setRetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, productsResponse, transportsResponse, warehousesResponse, retailsResponse] = await Promise.all([
        axiosClient.get('/admin/users'),
        axiosClient.get('/products'),
        axiosClient.get('/transport'),
        axiosClient.get('/warehouse'),
        axiosClient.get('/retail')
      ]);
      
      setUsers(usersResponse.data || []);
      setProducts(productsResponse.data || []);
      setTransports(transportsResponse.data || []);
      setWarehouses(warehousesResponse.data || []);
      setRetails(retailsResponse.data || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      // For new systems with no data, don't show error - just set empty state
      if (err.response?.status === 404) {
        setUsers([]);
        setProducts([]);
        setTransports([]);
        setWarehouses([]);
        setRetails([]);
      } else {
        // Only show error for actual failures
        setError('Failed to load admin data');
        console.error('Load admin data error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosClient.delete(`/admin/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN');
  };

  const getStageStats = () => {
    const stats = {
      harvested: 0,
      in_transport: 0,
      in_warehouse: 0,
      in_retail: 0,
      sold: 0
    };

    products.forEach(product => {
      if (stats[product.currentStage] !== undefined) {
        stats[product.currentStage]++;
      }
    });

    return stats;
  };

  const getUserRoleStats = () => {
    const stats = {};
    users.forEach(user => {
      stats[user.role] = (stats[user.role] || 0) + 1;
    });
    return stats;
  };

  const stageStats = getStageStats();
  const userRoleStats = getUserRoleStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! System overview and management.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'users', name: 'Users' },
                { id: 'products', name: 'Products' },
                { id: 'supply-chain', name: 'Supply Chain' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">{users.length}</div>
                        <div className="text-blue-600">Total Users</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{products.length}</div>
                        <div className="text-green-600">Total Products</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700">{transports.length}</div>
                        <div className="text-yellow-600">Total Transports</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-700">{stageStats.sold}</div>
                        <div className="text-purple-600">Products Sold</div>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Product Stages */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Stages</h3>
                        <div className="space-y-2">
                          {Object.entries(stageStats).map(([stage, count]) => (
                            <div key={stage} className="flex justify-between items-center">
                              <span className="capitalize text-gray-700">{stage.replace('_', ' ')}</span>
                              <span className="font-semibold">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* User Roles */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Roles</h3>
                        <div className="space-y-2">
                          {Object.entries(userRoleStats).map(([role, count]) => (
                            <div key={role} className="flex justify-between items-center">
                              <span className="text-gray-700">{role}</span>
                              <span className="font-semibold">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Users ({users.length})</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Role</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Created</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-4 py-2">{user.name}</td>
                              <td className="border border-gray-200 px-4 py-2">{user.email}</td>
                              <td className="border border-gray-200 px-4 py-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  {user.role}
                                </span>
                              </td>
                              <td className="border border-gray-200 px-4 py-2">{formatDate(user.createdAt)}</td>
                              <td className="border border-gray-200 px-4 py-2">
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Products ({products.length})</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-4 py-2 text-left">Product Name</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Product Code</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Farmer</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Current Stage</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Quantity</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-4 py-2">{product.product_name}</td>
                              <td className="border border-gray-200 px-4 py-2 font-mono text-xs">{product.productCode}</td>
                              <td className="border border-gray-200 px-4 py-2">{product.farmer?.name || 'N/A'}</td>
                              <td className="border border-gray-200 px-4 py-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  product.currentStage === 'sold' ? 'bg-gray-100 text-gray-700' :
                                  product.currentStage === 'harvested' ? 'bg-blue-100 text-blue-700' :
                                  product.currentStage === 'in_transport' ? 'bg-yellow-100 text-yellow-700' :
                                  product.currentStage === 'in_warehouse' ? 'bg-purple-100 text-purple-700' :
                                  product.currentStage === 'in_retail' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {product.currentStage?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="border border-gray-200 px-4 py-2">{product.quantity} units</td>
                              <td className="border border-gray-200 px-4 py-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Supply Chain Tab */}
                {activeTab === 'supply-chain' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Transports */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Transports</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {transports.slice(0, 5).map((transport) => (
                            <div key={transport._id} className="bg-gray-50 p-3 rounded">
                              <div className="text-sm">
                                <div className="font-medium">{transport.from_location} → {transport.to_location}</div>
                                <div className="text-gray-600">Status: {transport.status}</div>
                                <div className="text-gray-500">{formatDate(transport.date)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Warehouses */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Warehouse Storage</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {warehouses.slice(0, 5).map((warehouse) => (
                            <div key={warehouse._id} className="bg-gray-50 p-3 rounded">
                              <div className="text-sm">
                                <div className="font-medium">{warehouse.storage_location}</div>
                                <div className="text-gray-600">Temp: {warehouse.temperature}</div>
                                <div className="text-gray-500">{formatDate(warehouse.stored_date)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Retails */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Retail Sales</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {retails.slice(0, 5).map((retail) => (
                            <div key={retail._id} className="bg-gray-50 p-3 rounded">
                              <div className="text-sm">
                                <div className="font-medium">{retail.shop_name}</div>
                                <div className="text-gray-600">Price: ₹{retail.selling_price}</div>
                                <div className="text-gray-600">Stock: {retail.stock}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;