import React from 'react';

export default function MetricsCard({ title, value, icon: Icon, subtext }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold text-gray-900">
          {value}
        </div>
        <div className="font-semibold text-gray-700">
          {title}
        </div>
        <div className="text-sm text-gray-500">
          {subtext}
        </div>
      </div>
    </div>
  );
}