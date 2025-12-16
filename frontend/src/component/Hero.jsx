import React from 'react';
import { Search } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-green-50 to-blue-50 pt-20 pb-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 text-gray-900 leading-tight">
            Track Your Food's
            <span className="text-green-600"> Journey</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            From farm to fork, follow every step of your food's path with blockchain-verified transparency. 
            Know your food, trust your choices.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a 
              href="/track"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors text-lg shadow-lg hover:shadow-xl"
            >
              Start Tracking
            </a>
            <a 
              href="/about"
              className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-xl font-semibold transition-colors text-lg"
            >
              Learn More
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">1200+</div>
              <div className="text-gray-600">Products Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">120+</div>
              <div className="text-gray-600">Partner Farms</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">15+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-200 rounded-full opacity-20 animate-pulse delay-500"></div>
    </div>
  );
}