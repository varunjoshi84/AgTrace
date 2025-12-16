import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFarmForm, setShowFarmForm] = useState(false);
  const [farmProfile, setFarmProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New product form data
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    price: '',
    harvestDate: '',
    description: ''
  });

  // Farm profile form data
  const [farmForm, setFarmForm] = useState({
    farmName: '',
    location: '',
    address: '',
    pincode: '',
    farmSize: '',
    phone: ''
  });

  // Load farmer's products and profile on component mount
  useEffect(() => {
    loadProducts();
    loadFarmProfile();
  }, []);

  // Fetch all products created by this farmer
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/farmer/products');
      setProducts(response.data.products || []);
    } catch (err) {
      setError('Failed to load products');
      console.error('Load products error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load farm profile
  const loadFarmProfile = async () => {
    try {
      const response = await axiosClient.get('/farmer/profile');
      const profile = response.data;
      setFarmProfile(profile);
      
      // Populate form with existing data
      setFarmForm({
        farmName: profile.name || '',
        location: profile.location || '',
        address: profile.address || '',
        pincode: profile.pincode || '',
        farmSize: profile.farmSize || '',
        phone: profile.phone || ''
      });
    } catch (err) {
      console.error('Load farm profile error:', err);
      // Don't show error for missing profile - it's optional
    }
  };

  // Handle farm form input changes
  const handleFarmInputChange = (e) => {
    const { name, value } = e.target;
    setFarmForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle farm profile update
  const handleUpdateFarmProfile = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      
      const response = await axiosClient.put('/farmer/profile', farmForm);
      setFarmProfile(response.data.farmer);
      setSuccess('Farm profile updated successfully!');
      setShowFarmForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update farm profile');
      console.error('Update farm profile error:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate product form
  const validateForm = () => {
    if (!productForm.name.trim()) return 'Product name is required';
    if (!productForm.category.trim()) return 'Category is required';
    if (!productForm.quantity || productForm.quantity <= 0) return 'Valid quantity is required';
    if (!productForm.unit.trim()) return 'Unit is required';
    if (!productForm.price || productForm.price <= 0) return 'Valid price is required';
    if (!productForm.harvestDate) return 'Harvest date is required';
    return null;
  };

  // Handle product creation
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      
      // Create product with farmer ID
      const productData = {
        ...productForm,
        quantity: parseInt(productForm.quantity),
        price: parseFloat(productForm.price)
      };

      await axiosClient.post('/farmer/products', productData);
      
      setSuccess('Product created successfully!');
      setShowCreateForm(false);
      
      // Reset form
      setProductForm({
        name: '',
        category: '',
        quantity: '',
        unit: '',
        price: '',
        harvestDate: '',
        description: ''
      });

      // Reload products list
      loadProducts();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
      console.error('Create product error:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN');
  };

  // Format price for display
  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '₹0.00';
    }
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Farmer Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name}!
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFarmForm(!showFarmForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {showFarmForm ? 'Cancel' : 'Manage Farm Profile'}
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {showCreateForm ? 'Cancel' : 'Add New Product'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Farm Profile Form */}
        {showFarmForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Farm Profile Information
            </h2>
            
            {/* Current Farm Profile Display */}
            {farmProfile && !showFarmForm && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Current Farm Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Farm Name:</span>
                    <span className="ml-2">{farmProfile.name || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2">{farmProfile.location || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Address:</span>
                    <span className="ml-2">{farmProfile.address || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Pincode:</span>
                    <span className="ml-2">{farmProfile.pincode || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Farm Size:</span>
                    <span className="ml-2">{farmProfile.farmSize || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Contact:</span>
                    <span className="ml-2">{farmProfile.phone || 'Not set'}</span>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleUpdateFarmProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Farm Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Name
                </label>
                <input
                  type="text"
                  name="farmName"
                  value={farmForm.farmName}
                  onChange={handleFarmInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Green Valley Farm"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={farmForm.location}
                  onChange={handleFarmInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Village Name, District"
                  required
                />
              </div>

              {/* Full Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Farm Address
                </label>
                <textarea
                  name="address"
                  value={farmForm.address}
                  onChange={handleFarmInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Complete address for pickup location..."
                  required
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={farmForm.pincode}
                  onChange={handleFarmInputChange}
                  maxLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 123456"
                  required
                />
              </div>

              {/* Farm Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Size
                </label>
                <input
                  type="text"
                  name="farmSize"
                  value={farmForm.farmSize}
                  onChange={handleFarmInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 5 acres, 2 hectares"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Contact Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={farmForm.phone}
                  onChange={handleFarmInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., +91-9876543210"
                />
              </div>

              {/* Form Actions */}
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Update Farm Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowFarmForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create Product Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Product
            </h2>
            
            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Organic Tomatoes"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Herbs">Herbs</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={productForm.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="100"
                  required
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={productForm.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select Unit</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="tons">Tons</option>
                  <option value="pieces">Pieces</option>
                  <option value="liters">Liters</option>
                  <option value="gallons">Gallons</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Unit (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="5.99"
                  required
                />
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Date
                </label>
                <input
                  type="date"
                  name="harvestDate"
                  value={productForm.harvestDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Optional description of the product..."
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Products
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading your products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No products created yet</div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Create your first product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Product Code:</span> 
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded ml-2">
                        {product.productCode || 'Generating...'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Current Stage:</span> 
                      <span className="capitalize text-blue-600 ml-2">{product.currentStage || 'harvested'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span> {product.quantity} {product.unit}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> {formatPrice(product.price)} per {product.unit}
                    </div>
                    <div>
                      <span className="font-medium">Harvest Date:</span> {formatDate(product.harvest_date)}
                    </div>
                    {product.description && (
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="mt-1 text-gray-500">{product.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(product.createdAt)}
                    </div>
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

export default FarmerDashboard;