import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, MapPin } from 'lucide-react';
import { useStore } from '../store';
import { User, Address } from '../types';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [error, setError] = useState('');

  const { login } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as any)?.redirect || '/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin Login
    if (isAdminLogin) {
      if (formData.email === 'admin@vaddadi.com' && formData.password === 'admin123') {
        const adminUser: User = {
          id: 'admin-1',
          name: 'Admin',
          email: 'admin@vaddadi.com',
          phone: '+91 98765 43210',
          address: {
            street: 'SUJATHANAGAR',
            city: 'VISAKHAPATNAM',
            state: 'ANDHRA PRADESH',
            pincode: '530051',
            country: 'India',
          },
          addresses: [],
          role: 'admin',
        };
        login(adminUser);
        navigate('/admin');
      } else {
        setError('Invalid admin credentials. Use: admin@vaddadi.com / admin123');
      }
      return;
    }

    // Customer Sign Up
    if (isSignUp) {
      if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.pincode) {
        setError('Please fill all required fields');
        return;
      }
      const address: Address = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
      };
      const user: User = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address,
        addresses: [{
          id: `addr-${Date.now()}`,
          label: 'Home',
          name: formData.name,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
          isDefault: true,
        }],
        role: 'customer',
      };
      login(user);
      navigate(redirect);
    } else {
      // Demo Customer Login
      if (formData.email && formData.password) {
        const user: User = {
          id: `user-${Date.now()}`,
          name: formData.email.split('@')[0],
          email: formData.email,
          phone: '+91 99999 99999',
          address: {
            street: '123 Demo Street',
            city: 'VISAKHAPATNAM',
            state: 'ANDHRA PRADESH',
            pincode: '530051',
            country: 'India',
          },
          addresses: [{
            id: `addr-${Date.now()}`,
            label: 'Home',
            name: formData.email.split('@')[0],
            phone: '+91 99999 99999',
            street: '123 Demo Street',
            city: 'VISAKHAPATNAM',
            state: 'ANDHRA PRADESH',
            pincode: '530051',
            country: 'India',
            isDefault: true,
          }],
          role: 'customer',
        };
        login(user);
        navigate(redirect);
      } else {
        setError('Please enter email and password');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img
              src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg"
              alt="Vaddadi Pickles"
              className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-green-500 shadow-lg"
            />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">
              {isAdminLogin ? 'Admin Login' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isAdminLogin
                ? 'Access the admin dashboard'
                : isSignUp
                  ? 'Join Vaddadi Pickles family'
                  : 'Sign in to your account'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {isAdminLogin && (
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg mb-4 text-sm border border-yellow-200">
              <strong>⚠️ Security Warning:</strong> This is a demo admin login. Authentication is handled client-side. Do not use for production with real data.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {isSignUp && (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                    <MapPin size={16} /> Delivery Address
                  </p>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mt-3"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {isAdminLogin ? 'Login as Admin' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            {!isAdminLogin && (
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  className="text-green-600 font-semibold hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            )}
            <p>
              <button
                onClick={() => { setIsAdminLogin(!isAdminLogin); setError(''); setIsSignUp(false); }}
                className="text-sm text-gray-500 hover:text-green-600"
              >
                {isAdminLogin ? '← Back to Customer Login' : 'Admin Login →'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
