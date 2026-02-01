import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useStore } from '../store';

export function Footer() {
  const { settings } = useStore();
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg"
                alt="Vaddadi Pickles"
                className="w-14 h-14 rounded-full object-cover border-2 border-green-500"
              />
              <h3 className="text-xl font-bold text-white">Vaddadi Pickles</h3>
            </div>
            <p className="text-sm">Authentic homemade pickles made with love and traditional recipes passed down through generations.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-green-400 transition">Home</a></li>
              <li><a href="/products" className="hover:text-green-400 transition">Products</a></li>
              <li><Link to="/orders" className="hover:text-green-500 transition">Track Order</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-green-500 transition">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-green-500 transition">Refund Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-green-500 transition">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>{settings.businessAddress.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>info@vaddadipickles.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>{settings.businessAddress.street}, {settings.businessAddress.city}, {settings.businessAddress.state} - {settings.businessAddress.pincode}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition">
                <span>📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition">
                <span>📸</span>
              </a>
              <a href="#" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition">
                <span>💬</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 Vaddadi Pickles. All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}
