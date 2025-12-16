import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <Leaf size={32} className="text-green-500 mr-3" />
              <h3 className="text-2xl font-bold text-white">AgriChain</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Transforming agriculture through transparency. Track your food from farm to table, 
              ensuring quality, sustainability, and trust in every step of the supply chain.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="hover:text-green-400 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-green-400 transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-green-400 transition-colors duration-200">
                  Track Product
                </Link>
              </li>
            
           
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail size={16} className="mr-3 text-green-500" />
                <span className="text-sm">support@agrichain.com</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-3 text-green-500" />
                <span className="text-sm">+91 9876543210</span>
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="mr-3 text-green-500 mt-1" />
                <span className="text-sm">
                  123 Lpu<br />
                  Jalandhar Punjab, India 144401
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 AgriChain. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                to="/privacy" 
                className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link 
                to="/contact" 
                className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;