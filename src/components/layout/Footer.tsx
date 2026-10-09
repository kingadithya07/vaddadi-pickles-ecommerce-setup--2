import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useStore } from '../store';
import toast from 'react-hot-toast';

export function Footer() {
  const { settings } = useStore();
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3 mb-4 hover:opacity-80 transition cursor-pointer">
              <img
                src="/logo.png"
                alt="Vaddadi Pickles"
                className="w-14 h-14 rounded-full object-cover border-2 border-green-500"
              />
              <h3 className="text-xl font-bold text-white">Vaddadi Pickles</h3>
            </Link>
            <p className="text-sm mb-4">Authentic homemade pickles made with love and traditional recipes passed down through generations.</p>
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 mt-4">
              <p className="text-sm text-green-400 font-semibold mb-1">Bulk Orders & Pelli Saare</p>
              <p className="text-xs text-gray-300 mb-1">For bulk orders and Pelli Saare food items, contact us at:</p>
              <p className="text-sm font-bold text-white">
                <a href="tel:8008129309" className="hover:text-green-400 transition">8008129309</a> / <a href="tel:9885192948" className="hover:text-green-400 transition">9885192948</a>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-green-400 transition">Home</Link></li>
              <li><Link to="/about" onClick={() => window.scrollTo(0, 0)} className="hover:text-green-400 transition">About Us</Link></li>
              <li><Link to="/products" onClick={() => window.scrollTo(0, 0)} className="hover:text-green-400 transition">Products</Link></li>
              <li><Link to="/faq" onClick={() => window.scrollTo(0, 0)} className="hover:text-green-400 transition">FAQ</Link></li>
              <li><Link to="/orders" onClick={() => window.scrollTo(0, 0)} className="hover:text-green-500 transition">Track Order</Link></li>
              <li><Link to="/affiliate" onClick={() => window.scrollTo(0, 0)} className="hover:text-green-500 transition">Affiliate Program</Link></li>
              <li><Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)} className="hover:text-green-500 transition">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" onClick={() => window.scrollTo(0, 0)} className="hover:text-green-500 transition">Refund Policy</Link></li>
              <li><Link to="/terms-and-conditions" onClick={() => window.scrollTo(0, 0)} className="hover:text-green-500 transition">Terms & Conditions</Link></li>
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
            <div className="flex gap-4 mb-6">
              <a href="#" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition">
                <span>📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition">
                <span>📸</span>
              </a>
              <a href="https://wa.me/+919963622669?text=Hello!%20I'm%20interested%20in%20your%20pickles.%0A%0A%F0%9F%8C%9F%20P.S.%20I%20want%20to%20learn%20more%20about%20your%20Refer%20%26%20Earn%20program%20to%20get%20a%2010%25%20lifelong%20commission!" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition">
                <span>💬</span>
              </a>
            </div>

            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <form className="flex" onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed successfully!'); }}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-gray-800 text-white px-3 py-2 rounded-l-md w-full text-sm focus:outline-none focus:ring-1 focus:ring-green-500 border border-gray-700" 
                required 
              />
              <button 
                type="submit" 
                className="bg-green-600 px-3 py-2 rounded-r-md hover:bg-green-500 transition font-semibold text-white text-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 Vaddadi Pickles. All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}
