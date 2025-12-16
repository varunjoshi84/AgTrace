import React, { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrackingCard() {
  const [productCode, setProductCode] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (productCode.trim()) {
      // Navigate to track page with the product code
      navigate(`/track?code=${productCode.trim()}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Your Product</h2>
        <p className="text-gray-600">
          Enter your product code to see its complete journey from farm to table
        </p>
      </div>

      <form onSubmit={handleTrack} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder="Enter product code (e.g., PC1734590123ABCDE)"
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        
        <button
          type="submit"
          disabled={!productCode.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          Track Product Journey
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-sm text-gray-600">
          <strong>Don't have a product code?</strong>
          <div className="mt-2 space-y-1">
            <div>• Check your purchase receipt or confirmation email</div>
            <div>• Product codes start with "PC" followed by numbers and letters</div>
            <div>• Contact the retailer if you can't find your code</div>
          </div>
        </div>
      </div>
    </div>
  );
}