import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

const RetailerDashboard = () => {
  const { user } = useAuth();
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customerPhones, setCustomerPhones] = useState({});
  const [saleQuantities, setSaleQuantities] = useState({});
  const [salePrices, setSalePrices] = useState({});
  const [showSoldProducts, setShowSoldProducts] = useState(false);
  const [customerReceipt, setCustomerReceipt] = useState(null);

  useEffect(() => {
    loadAssignedProducts();
  }, []);

  const loadAssignedProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/retail/assigned-products');
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

  const handleSellProduct = async (productId) => {
    const phone = customerPhones[productId];
    const quantity = parseInt(saleQuantities[productId]) || 1;
    const salePrice = parseFloat(salePrices[productId]) || 0;
    
    // Find the product to check available quantity
    const product = assignedProducts.find(p => p._id === productId);
    if (!product) {
      setError('Product not found');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Validate quantity against available stock
    if (quantity > product.quantity) {
      setError(`Cannot sell ${quantity} units. Only ${product.quantity} units available in stock.`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    const phoneDigits = phone?.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (quantity <= 0) {
      setError('Please enter a valid quantity');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (salePrice <= 0) {
      setError('Please enter a valid sale price');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // Find the retail entry for this product
      const retailResponse = await axiosClient.get('/retail');
      const retailEntry = retailResponse.data.find(r => r.product?._id === productId || r.product === productId);
      
      if (!retailEntry) {
        // Create retail entry first if it doesn't exist
        await axiosClient.post('/retail', {
          product: productId,
          shop_name: user.name + "'s Shop",
          selling_price: salePrice,
          stock: quantity
        });
        
        // Fetch again to get the new entry
        const newRetailResponse = await axiosClient.get('/retail');
        const newRetailEntry = newRetailResponse.data.find(r => r.product?._id === productId || r.product === productId);
        
        if (!newRetailEntry) {
          setError('Failed to create retail entry');
          return;
        }

        await axiosClient.put(`/retail/${newRetailEntry._id}/sell-out`, {
          customerPhone: phone
        });
      } else {
        await axiosClient.put(`/retail/${retailEntry._id}/sell-out`, {
          customerPhone: phone
        });
      }
      
      // Generate customer receipt
      const receipt = {
        receiptId: `RCP${Date.now()}`,
        productCode: product.productCode,
        productName: product.product_name,
        customerPhone: phone,
        quantitySold: quantity,
        pricePerUnit: salePrice,
        totalAmount: quantity * salePrice,
        shopName: user.name + "'s Shop",
        saleDate: new Date().toISOString(),
        farmerName: product.farmer?.name || 'N/A',
        trackingMessage: `Use Product Code "${product.productCode}" to track your product journey at our website.`
      };
      
      setCustomerReceipt(receipt);
      setSuccess(`Product sold successfully! Quantity: ${quantity}, Price: ₹${salePrice}, Total: ₹${quantity * salePrice}`);
      setCustomerPhones(prev => {
        const newState = {...prev};
        delete newState[productId];
        return newState;
      });
      setSaleQuantities(prev => {
        const newState = {...prev};
        delete newState[productId];
        return newState;
      });
      setSalePrices(prev => {
        const newState = {...prev};
        delete newState[productId];
        return newState;
      });
      loadAssignedProducts();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sell product');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN');
  };

  const availableProducts = assignedProducts.filter(p => p.currentStage === 'in_retail');
  const soldProducts = assignedProducts.filter(p => p.currentStage === 'sold');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Retailer Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Manage your retail inventory and sales.
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Available for Sale</p>
                <p className="text-3xl font-bold text-blue-600">{availableProducts.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Sold Products</p>
                <p className="text-3xl font-bold text-green-600">{soldProducts.length}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowSoldProducts(!showSoldProducts)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {showSoldProducts ? 'Show Available Products' : 'Show Sold Products'}
          </button>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {showSoldProducts ? `Sold Products (${soldProducts.length})` : `Products Available for Sale (${availableProducts.length})`}
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (showSoldProducts ? soldProducts : availableProducts).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {showSoldProducts ? 'No products sold yet' : 'No products available in your store yet'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(showSoldProducts ? soldProducts : availableProducts).map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.product_name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.currentStage === 'in_retail' ? 'bg-indigo-100 text-indigo-800' :
                      product.currentStage === 'sold' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.currentStage === 'in_retail' ? 'In Store' :
                       product.currentStage === 'sold' ? 'Sold' : product.currentStage}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <div><span className="font-medium">Code:</span> {product.productCode}</div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(product.productCode);
                          setSuccess('Product code copied to clipboard!');
                          setTimeout(() => setSuccess(''), 2000);
                        }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                        title="Copy product code"
                      >
                        Copy
                      </button>
                    </div>
                    <div><span className="font-medium">Farmer:</span> {product.farmer?.name}</div>
                    <div><span className="font-medium">Origin:</span> {product.farmer?.location || 'Not specified'}</div>
                    <div><span className="font-medium">Warehouse:</span> {product.assignedWarehouse?.name || 'Not specified'}</div>
                    <div><span className="font-medium">Available:</span> <span className="text-green-600 font-semibold">{product.quantity} units</span></div>
                    <div><span className="font-medium">Price:</span> ₹{product.price || 0}</div>
                    <div><span className="font-medium">Harvest Date:</span> {formatDate(product.harvest_date)}</div>
                    {product.customerPhone && (
                      <div><span className="font-medium">Customer:</span> {product.customerPhone}</div>
                    )}
                  </div>

                  {!showSoldProducts && product.currentStage === 'in_retail' && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity to Sell: <span className="text-xs text-gray-500">(Max: {product.quantity})</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={saleQuantities[product._id] || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (val <= product.quantity) {
                            setSaleQuantities(prev => ({
                              ...prev,
                              [product._id]: e.target.value
                            }));
                          }
                        }}
                        placeholder={`Max ${product.quantity} units`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      {saleQuantities[product._id] && parseInt(saleQuantities[product._id]) > product.quantity && (
                        <p className="text-xs text-red-600">Cannot exceed available stock of {product.quantity} units</p>
                      )}

                      <label className="block text-sm font-medium text-gray-700 mt-2">
                        Selling Price (₹):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={salePrices[product._id] || ''}
                        onChange={(e) => setSalePrices(prev => ({
                          ...prev,
                          [product._id]: e.target.value
                        }))}
                        placeholder="Enter price per unit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />

                      {saleQuantities[product._id] && salePrices[product._id] && (
                        <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm">
                          <span className="font-medium">Total Amount:</span> ₹{(parseFloat(saleQuantities[product._id] || 0) * parseFloat(salePrices[product._id] || 0)).toFixed(2)}
                        </div>
                      )}

                      <label className="block text-sm font-medium text-gray-700 mt-2">
                        Customer Phone Number:
                      </label>
                      <input
                        type="tel"
                        value={customerPhones[product._id] || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 10) {
                            setCustomerPhones(prev => ({
                              ...prev,
                              [product._id]: value
                            }));
                          }
                        }}
                        placeholder="9876543210"
                        minLength={10}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      <p className="text-xs text-gray-500">Enter 10-digit mobile number</p>
                      
                      <button
                        onClick={() => handleSellProduct(product._id)}
                        disabled={!customerPhones[product._id] || !saleQuantities[product._id] || !salePrices[product._id]}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Sell to Customer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Receipt Modal */}
        {customerReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Sale Receipt</h3>
                <p className="text-sm text-gray-500">Receipt ID: {customerReceipt.receiptId}</p>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Shop:</span>
                  <span className="font-medium">{customerReceipt.shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(customerReceipt.saleDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{customerReceipt.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{customerReceipt.productCode}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(customerReceipt.productCode);
                        setSuccess('Product code copied!');
                        setTimeout(() => setSuccess(''), 2000);
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Farmer:</span>
                  <span className="font-medium">{customerReceipt.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Phone:</span>
                  <span className="font-medium">{customerReceipt.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{customerReceipt.quantitySold} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per unit:</span>
                  <span className="font-medium">₹{customerReceipt.pricePerUnit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total Amount:</span>
                  <span className="text-green-600">₹{customerReceipt.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 text-center">{customerReceipt.trackingMessage}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    const receiptText = `
SALE RECEIPT
${customerReceipt.shopName}
Receipt ID: ${customerReceipt.receiptId}
Date: ${new Date(customerReceipt.saleDate).toLocaleString()}

Product: ${customerReceipt.productName}
Product Code: ${customerReceipt.productCode}
Farmer: ${customerReceipt.farmerName}
Customer: ${customerReceipt.customerPhone}
Quantity: ${customerReceipt.quantitySold} units
Price: ₹${customerReceipt.pricePerUnit.toFixed(2)} per unit
Total: ₹${customerReceipt.totalAmount.toFixed(2)}

${customerReceipt.trackingMessage}
                    `.trim();
                    navigator.clipboard.writeText(receiptText);
                    setSuccess('Receipt copied to clipboard!');
                    setTimeout(() => setSuccess(''), 2000);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Copy Receipt
                </button>
                <button
                  onClick={() => setCustomerReceipt(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerDashboard;
