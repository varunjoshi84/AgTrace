import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// Animation variants for different elements
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const TrackPage = () => {
  const [productCode, setProductCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [trackingMode, setTrackingMode] = useState('product'); // 'product' or 'phone'
  const [trackingData, setTrackingData] = useState(null);
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  // Success Animation Component
  const SuccessIcon = ({ className }) => (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
      <div className="relative bg-green-500 rounded-full p-3 shadow-lg">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );

  // Get product code from URL parameters if available
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl) {
      setProductCode(codeFromUrl);
      // Auto-track if code is in URL
      handleTrackWithCode(codeFromUrl);
    }
  }, [location.search]);

  // Handle product tracking with a specific code
  const handleTrackWithCode = async (code) => {
    if (!code.trim()) {
      setError('Please enter a Product Code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Try tracking by productCode first, fallback to productId for backward compatibility
      let response;
      try {
        response = await axiosClient.get(`/customer/track-by-code/${code.trim()}`);
      } catch (err) {
        // If productCode fails, try as regular productId
        if (err.response?.status === 404) {
          response = await axiosClient.get(`/customer/track/${code.trim()}`);
        } else {
          throw err;
        }
      }
      
      setTrackingData(response.data);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found or tracking failed');
      setTrackingData(null);
      console.error('Tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle product tracking
  const handleTrack = async (e) => {
    e.preventDefault();
    if (trackingMode === 'product') {
      await handleTrackWithCode(productCode);
    } else {
      await handleTrackWithPhone(phoneNumber);
    }
  };

  // Handle phone number tracking
  const handleTrackWithPhone = async (phone) => {
    if (!phone.trim()) {
      setError('Please enter a Phone Number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axiosClient.get(`/customer/purchases/${phone.trim()}`);
      setPurchaseData(response.data.purchases || []);
      setTrackingData(null); // Clear single product tracking
      
      if (!response.data.purchases || response.data.purchases.length === 0) {
        setError('No purchases found for this phone number');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch purchase history');
      setPurchaseData([]);
      console.error('Phone tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for timeline
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Animated Loading Component
  const AnimatedLoading = () => (
    <div className="space-y-6">
      {/* Loading skeleton for product info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Loading skeleton for timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-6 mt-2"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Get status badge color with animations
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'harvested':
        return 'bg-blue-100 text-blue-800';
      case 'in transport':
        return 'bg-yellow-100 text-yellow-800';
      case 'in warehouse':
        return 'bg-purple-100 text-purple-800';
      case 'in retail':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced Timeline component with animations
  const ProductTimeline = ({ journey }) => {
    if (!journey || journey.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p>No journey information available</p>
        </div>
      );
    }

    // Icons for different stages
    const getStageIcon = (stage, status) => {
      const iconClass = "w-5 h-5 text-white";
      
      if (stage?.toLowerCase().includes('harvest')) {
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
      } else if (stage?.toLowerCase().includes('transport')) {
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>;
      } else if (stage?.toLowerCase().includes('warehouse')) {
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
      } else if (stage?.toLowerCase().includes('retail')) {
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
      } else {
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      }
    };

    const getStageColor = (index, total) => {
      const progress = (index + 1) / total;
      if (progress === 1) return 'bg-green-500';
      if (progress > 0.7) return 'bg-blue-500';
      if (progress > 0.4) return 'bg-yellow-500';
      return 'bg-gray-400';
    };

    return (
      <div className="relative">
        {/* Animated timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 overflow-hidden">
          <div className="w-full bg-gradient-to-b from-green-500 via-blue-500 to-yellow-500 h-full transform transition-transform duration-2000 ease-out animate-pulse" style={{height: `${(100 / journey.length) * journey.length}%`}}></div>
        </div>
        
        {journey.map((step, index) => (
          <div 
            key={index} 
            className="relative flex items-start mb-8 transform transition-all duration-500 ease-out"
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
          >
            {/* Enhanced timeline dot with icon */}
            <div className={`relative z-10 w-16 h-16 ${getStageColor(index, journey.length)} border-4 border-white rounded-full shadow-lg flex items-center justify-center transform transition-transform duration-300 hover:scale-110`}>
              {getStageIcon(step.location || step.stage, step.status)}
            </div>
            
            {/* Enhanced timeline content */}
            <div className="ml-6 flex-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xl font-bold text-gray-900">
                    {step.location || step.stage || 'Unknown Stage'}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(step.status)} transform transition-transform duration-200 hover:scale-105`}>
                    {step.status || 'Unknown Status'}
                  </span>
                </div>
                
                {step.handler && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Handler:</span> 
                    <span className="ml-1 font-semibold">{step.handler}</span>
                  </div>
                )}
                
                {step.timestamp && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Date:</span> 
                    <span className="ml-1">{formatDate(step.timestamp)}</span>
                  </div>
                )}
                
                {step.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mt-0.5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {step.notes}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Display warehouse storage details if available */}
                {(step.storageLocation || step.storageType) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mt-0.5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <div className="text-sm text-blue-800 flex-1">
                        <span className="font-semibold">Storage Details:</span>
                        <div className="mt-1 space-y-1">
                          {step.storageLocation && (
                            <div className="flex items-center">
                              <span className="text-blue-600 mr-2">📦</span>
                              <span className="font-medium">Shelf Number:</span>
                              <span className="ml-1 bg-blue-100 px-2 py-0.5 rounded">{step.storageLocation}</span>
                            </div>
                          )}
                          {step.storageType && (
                            <div className="flex items-center">
                              <span className="text-blue-600 mr-2">❄️</span>
                              <span className="font-medium">Storage Type:</span>
                              <span className="ml-1 bg-blue-100 px-2 py-0.5 rounded">{step.storageType}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-pulse-custom {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Your Products
          </h1>
          <p className="text-gray-600">
            Enter your Product Code or Phone Number to track purchases and product journeys
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Tracking Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                type="button"
                onClick={() => {
                  setTrackingMode('product');
                  setError('');
                  setPurchaseData([]);
                  setTrackingData(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  trackingMode === 'product'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Track by Product Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrackingMode('phone');
                  setError('');
                  setPurchaseData([]);
                  setTrackingData(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  trackingMode === 'phone'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Track by Phone Number
              </button>
            </div>
          </div>

          <form onSubmit={handleTrack} className="flex gap-4">
            <div className="flex-1">
              {trackingMode === 'product' ? (
                <input
                  type="text"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter Product Code"
                />
              ) : (
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setPhoneNumber(value);
                    }
                  }}
                  minLength={10}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter 10-digit Phone Number"
                />
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : trackingMode === 'product' ? 'Track Product' : 'Find Purchases'}
            </button>
          </form>
        </div>

        {/* Enhanced Loading State */}
        {loading && (
          <div className="space-y-6 animate-fadeInUp">
            {/* Loading skeleton for product info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Loading skeleton for timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="animate-pulse space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mr-6 mt-2 animate-pulse-custom"></div>
                    <div className="flex-1 space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Loading message */}
            <div className="text-center py-4">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-blue-700 font-semibold">🔍 Tracking your product journey...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 mb-8 animate-fadeInUp">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-1">Tracking Failed</h3>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Results with animations */}
        {trackingData && (
          <div className="space-y-6">
            {/* Success message with animation */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-center">
                <SuccessIcon className="mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Product Found!</h3>
                  <p className="text-green-600">Track your product's complete journey below.</p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Product Information */}
            <div 
              className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl"
              style={{ animation: 'fadeInUp 0.6s ease-out' }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Product Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Product Name', value: trackingData.product?.name || 'N/A', icon: '🌾' },
                  { label: 'Category', value: trackingData.product?.category || 'N/A', icon: '📦' },
                  { label: 'Farmer', value: trackingData.product?.farmer?.name || 'N/A', icon: '👨‍🌾' },
                  { label: 'Quantity', value: `${trackingData.product?.quantity || 'N/A'} ${trackingData.product?.unit || ''}`, icon: '⚖️' },
                  { label: 'Harvest Date', value: trackingData.product?.harvestDate ? formatDate(trackingData.product.harvestDate) : 'N/A', icon: '📅' },
                  { label: 'Product Code', value: trackingData.product?.productCode || 'N/A', icon: '🔢' }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                    style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{item.icon}</span>
                      <span className="text-sm font-medium text-gray-500">{item.label}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 break-words">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Current Status */}
            <div 
              className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
            >
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Current Status</h2>
              </div>
              <div className="flex items-center gap-6">
                <div className={`px-6 py-3 rounded-full text-lg font-bold shadow-lg transform transition-transform duration-200 hover:scale-105 ${getStatusColor(trackingData.currentStatus)}`}>
                  {trackingData.currentStatus || 'Status Unknown'}
                </div>
                {trackingData.lastUpdated && (
                  <div className="flex items-center text-gray-500">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">
                      Last updated: {formatDate(trackingData.lastUpdated)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Journey Timeline */}
            <div 
              className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
            >
              <div className="flex items-center mb-8">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Product Journey</h2>
              </div>
              <ProductTimeline journey={trackingData.journey} />
            </div>
          </div>
        )}

        {/* Purchase History Results */}
        {purchaseData.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Purchase History</h2>
              <p className="text-gray-600 mb-6">Found {purchaseData.length} purchase(s) for this phone number:</p>
              
              <div className="grid gap-4">
                {purchaseData.map((purchase, index) => (
                  <div key={purchase._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{purchase.product_name || 'Product'}</h3>
                        <p className="text-sm text-gray-500">Product Code: {purchase.productCode || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Quantity: {purchase.quantity || 0} {purchase.unit || ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(purchase.purchase_date || purchase.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Supply Chain Journey Summary */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Supply Chain Journey</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Farmer:</span>
                          <span className="ml-1 font-medium text-gray-900">{purchase.farmer?.name || 'N/A'}</span>
                          <span className="text-gray-500 text-xs ml-1">({purchase.farmer?.location || 'N/A'})</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Transporter:</span>
                          <span className="ml-1 font-medium text-gray-900">{purchase.transporter || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Warehouse:</span>
                          <span className="ml-1 font-medium text-gray-900">{purchase.warehouse || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Retailer:</span>
                          <span className="ml-1 font-medium text-gray-900">{purchase.retailer || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {purchase.currentStage && (
                      <div className="mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchase.currentStage)}`}>
                          {purchase.currentStage.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    
                    {purchase.productCode && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setTrackingMode('product');
                            setProductCode(purchase.productCode);
                            setPurchaseData([]);
                            handleTrackWithCode(purchase.productCode);
                          }}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Track Full Journey →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* How to Track Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Track Your Products</h3>
          <div className="text-blue-700 space-y-2">
            <p><strong>Track by Product Code:</strong></p>
            <p>• Product Codes are provided when you purchase items from retailers</p>
            <p>• Product Codes are unique identifiers starting with 'PC' followed by numbers and letters</p>
            <p className="mt-4"><strong>Track by Phone Number:</strong></p>
            <p>• Enter the phone number used during purchase to view all your bought products</p>
            <p>• Click "Track Journey" on any product to see its detailed supply chain journey</p>
            <p>• This shows your complete purchase history from all registered retailers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackPage;