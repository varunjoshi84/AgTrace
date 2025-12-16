import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import axiosClient from '../../api/axiosClient';
import { Truck, Package, MapPin, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeShipments: 0,
    deliveredToday: 0,
    totalDistance: 0,
    onTimeDelivery: 0
  });
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransporterData();
  }, []);

  const loadTransporterData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/transporter/shipments');
      const transporterShipments = response.data.shipments || [];
      setShipments(transporterShipments);
      
      // Calculate stats from real data
      const activeShipments = transporterShipments.filter(s => 
        s.status === 'In Transit' || s.status === 'Loading'
      ).length;
      const deliveredToday = transporterShipments.filter(s => {
        const today = new Date().toDateString();
        const deliveryDate = new Date(s.date).toDateString();
        return s.status === 'Delivered' && deliveryDate === today;
      }).length;
      const totalDistance = transporterShipments.reduce((sum, s) => sum + (s.distance || 0), 0);
      const onTimeShipments = transporterShipments.filter(s => s.onTime).length;
      const onTimeDelivery = transporterShipments.length > 0 ? 
        (onTimeShipments / transporterShipments.length * 100) : 0;
      
      setStats({
        activeShipments,
        deliveredToday,
        totalDistance,
        onTimeDelivery: onTimeDelivery.toFixed(1)
      });
    } catch (err) {
      setError('Failed to load transporter data');
      console.error('Load transporter data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit':
        return 'text-blue-600 bg-blue-50';
      case 'Loading':
        return 'text-yellow-600 bg-yellow-50';
      case 'Ready for Pickup':
        return 'text-green-600 bg-green-50';
      case 'Delivered':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Transit':
        return <Truck className="w-4 h-4" />;
      case 'Loading':
        return <Package className="w-4 h-4" />;
      case 'Ready for Pickup':
        return <Clock className="w-4 h-4" />;
      case 'Delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeShipments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.deliveredToday}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Distance (km)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDistance.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onTimeDelivery}%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">Create Shipment</div>
            <div className="text-sm text-gray-500 mt-1">Schedule new delivery</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">Update Location</div>
            <div className="text-sm text-gray-500 mt-1">Report current position</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">View Routes</div>
            <div className="text-sm text-gray-500 mt-1">Check delivery routes</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="font-medium text-gray-900">Generate Reports</div>
            <div className="text-sm text-gray-500 mt-1">Performance analytics</div>
          </button>
        </div>
      </div>

      {/* Active Shipments */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Active Shipments</h3>
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No shipments found. Your shipments will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.filter(s => s.status === 'In Transit' || s.status === 'Loading').slice(0, 3).map((shipment) => (
              <div key={shipment._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{shipment.product?.product_name || 'Product'}</h4>
                    <p className="text-sm text-gray-500">Shipment ID: {shipment._id}</p>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                    {getStatusIcon(shipment.status)}
                    <span className="ml-1">{shipment.status}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">From:</span> {shipment.from_location}
                  </div>
                  <div>
                    <span className="font-medium">To:</span> {shipment.to_location}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(shipment.date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {shipment.status}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Update Status
                  </button>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Performance Summary</h3>
        <p className="text-blue-700 mb-4">
          Your logistics performance has been excellent this month with high on-time delivery rates.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            97.5% On-time delivery rate
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Zero damage incidents this month
          </div>
        </div>
      </div>
    </div>
  );
}