import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

const RetailerDashboard = () => {
  const { user } = useAuth();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [myRetailEntries, setMyRetailEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [selectedRetailEntry, setSelectedRetailEntry] = useState(null);
  
  const [retailForm, setRetailForm] = useState({
    shop_name: '',
    selling_price: '',
    stock: ''
  });

  const [saleForm, setSaleForm] = useState({
    customer_name: '',
    customer_phone: '',
    quantity_sold: '',
    sale_price: ''
  });

  const [customerReceipt, setCustomerReceipt] = useState(null);
  const [showMoreRetail, setShowMoreRetail] = useState(false);
  const RETAIL_ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, retailResponse] = await Promise.all([
        axiosClient.get('/retail/available-products'),
        axiosClient.get('/retail')
      ]);
      
      setAvailableProducts(productsResponse.data || []);
      setMyRetailEntries(retailResponse.data || []);
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRetailEntry = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    try {
      setError('');
      
      await axiosClient.post('/retail', {
        product: selectedProduct._id,
        ...retailForm,
        selling_price: parseFloat(retailForm.selling_price),
        stock: parseInt(retailForm.stock)
      });

      setSuccess('Product listed for retail successfully!');
      setShowCreateForm(false);
      setSelectedProduct(null);
      setRetailForm({
        shop_name: '',
        selling_price: '',
        stock: ''
      });
      
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list product');
    }
  };

  const handleSaleToCustomer = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      
      const quantitySold = parseInt(saleForm.quantity_sold);
      
      // Check if enough stock is available
      if (quantitySold > selectedRetailEntry.stock) {
        setError('Not enough stock available');
        return;
      }

      // If selling all stock, mark as sold out
      if (quantitySold === selectedRetailEntry.stock) {
        await axiosClient.put(`/retail/${selectedRetailEntry._id}/sell-out`);
      } else {
        // Otherwise, just update the stock
        await axiosClient.put(`/retail/${selectedRetailEntry._id}`, {
          stock: selectedRetailEntry.stock - quantitySold
        });
      }

      // Generate customer receipt
      console.log('Selected retail entry for receipt:', selectedRetailEntry);
      console.log('Product data:', selectedRetailEntry.product);
      
      const receipt = {
        receiptId: `RCP${Date.now()}`,
        productCode: selectedRetailEntry.product?.productCode || 'N/A',
        productName: selectedRetailEntry.product?.product_name || 'N/A',
        customerName: saleForm.customer_name,
        customerPhone: saleForm.customer_phone,
        quantitySold: quantitySold,
        pricePerUnit: parseFloat(saleForm.sale_price),
        totalAmount: quantitySold * parseFloat(saleForm.sale_price),
        shopName: selectedRetailEntry.shop_name,
        saleDate: new Date().toISOString(),
        trackingMessage: `Use Product Code "${selectedRetailEntry.product?.productCode || 'N/A'}" to track your product journey at our website.`
      };

      setCustomerReceipt(receipt);
      setSuccess('Sale completed successfully!');
      setShowSaleForm(false);
      setSelectedRetailEntry(null);
      setSaleForm({
        customer_name: '',
        customer_phone: '',
        quantity_sold: '',
        sale_price: ''
      });
      
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete sale');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN');
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '₹0.00';
    }
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Retailer Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Manage retail inventory and sales.
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
          {/* Products Available for Retail */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Available for Retail ({availableProducts.length})
              </h2>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Stage: In Retail
              </span>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : availableProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products available for retail
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
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        List for Sale
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

          {/* My Retail Inventory */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              My Retail Inventory ({myRetailEntries.length})
            </h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : myRetailEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products in retail inventory
              </div>
            ) : (
              <div className="space-y-4">
                {(showMoreRetail ? myRetailEntries : myRetailEntries.slice(0, RETAIL_ITEMS_PER_PAGE)).map((entry) => (
                  <div key={entry._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {entry.product?.product_name || 'Product'}
                        </h4>
                        <div className="text-sm text-gray-600">
                          <div><span className="font-medium">Shop:</span> {entry.shop_name}</div>
                          <div><span className="font-medium">Price:</span> {formatPrice(entry.selling_price)} per unit</div>
                          <div><span className="font-medium">Stock:</span> {entry.stock} units</div>
                          <div><span className="font-medium">Product Code:</span> {entry.product?.productCode}</div>
                        </div>
                      </div>
                      
                      {entry.stock > 0 && (
                        <button
                          onClick={() => {
                            setSelectedRetailEntry(entry);
                            setShowSaleForm(true);
                            setSaleForm(prev => ({
                              ...prev,
                              sale_price: entry.selling_price
                            }));
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Sell to Customer
                        </button>
                      )}
                    </div>
                    
                    {entry.stock === 0 && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {myRetailEntries.length > RETAIL_ITEMS_PER_PAGE && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setShowMoreRetail(!showMoreRetail)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      {showMoreRetail 
                        ? `Show Less (showing ${myRetailEntries.length} items)` 
                        : `Show More (${myRetailEntries.length - RETAIL_ITEMS_PER_PAGE} more items)`
                      }
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Retail Entry Form Modal */}
        {showCreateForm && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                List for Sale: {selectedProduct.product_name}
              </h3>
              
              <form onSubmit={handleCreateRetailEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={retailForm.shop_name}
                    onChange={(e) => setRetailForm(prev => ({
                      ...prev,
                      shop_name: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Fresh Mart"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price per Unit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={retailForm.selling_price}
                    onChange={(e) => setRetailForm(prev => ({
                      ...prev,
                      selling_price: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 10.50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.quantity}
                    value={retailForm.stock}
                    onChange={(e) => setRetailForm(prev => ({
                      ...prev,
                      stock: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder={`Max: ${selectedProduct.quantity}`}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
                  >
                    List for Sale
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

        {/* Sale to Customer Form Modal */}
        {showSaleForm && selectedRetailEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sell to Customer: {selectedRetailEntry.product?.product_name}
              </h3>
              
              <form onSubmit={handleSaleToCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={saleForm.customer_name}
                    onChange={(e) => setSaleForm(prev => ({
                      ...prev,
                      customer_name: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Customer's full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={saleForm.customer_phone}
                    onChange={(e) => setSaleForm(prev => ({
                      ...prev,
                      customer_phone: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to Sell
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRetailEntry.stock}
                    value={saleForm.quantity_sold}
                    onChange={(e) => setSaleForm(prev => ({
                      ...prev,
                      quantity_sold: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder={`Max: ${selectedRetailEntry.stock}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price per Unit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={saleForm.sale_price}
                    onChange={(e) => setSaleForm(prev => ({
                      ...prev,
                      sale_price: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                {saleForm.quantity_sold && saleForm.sale_price && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Total Amount:</span> {formatPrice(parseFloat(saleForm.quantity_sold || 0) * parseFloat(saleForm.sale_price || 0))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
                  >
                    Complete Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaleForm(false);
                      setSelectedRetailEntry(null);
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

        {/* Customer Receipt Modal */}
        {customerReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Receipt
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
                <div className="text-center mb-4">
                  <div className="font-bold text-lg">{customerReceipt.shopName}</div>
                  <div className="text-gray-600">Sales Receipt</div>
                </div>
                
                <div><span className="font-medium">Receipt ID:</span> {customerReceipt.receiptId}</div>
                <div><span className="font-medium">Date:</span> {formatDate(customerReceipt.saleDate)}</div>
                <hr className="my-2" />
                
                <div><span className="font-medium">Customer:</span> {customerReceipt.customerName}</div>
                <div><span className="font-medium">Phone:</span> {customerReceipt.customerPhone}</div>
                <hr className="my-2" />
                
                <div><span className="font-medium">Product:</span> {customerReceipt.productName}</div>
                <div><span className="font-medium">Product Code:</span> <span className="font-mono text-xs">{customerReceipt.productCode}</span></div>
                <div><span className="font-medium">Quantity:</span> {customerReceipt.quantitySold} units</div>
                <div><span className="font-medium">Price per unit:</span> {formatPrice(customerReceipt.pricePerUnit)}</div>
                <div className="font-bold"><span>Total Amount:</span> {formatPrice(customerReceipt.totalAmount)}</div>
                
                <hr className="my-2" />
                <div className="bg-blue-50 p-2 rounded text-xs">
                  <div className="font-medium text-blue-900 mb-1">🔍 Track Your Product:</div>
                  <div className="text-blue-700">{customerReceipt.trackingMessage}</div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Product Code: ${customerReceipt.productCode}\n\nTrack your product journey at our website using this code.`);
                    alert('Product code copied to clipboard!');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
                >
                  Copy Product Code
                </button>
                <button
                  onClick={() => setCustomerReceipt(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-md font-medium"
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