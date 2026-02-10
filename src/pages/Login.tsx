import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store';
import { User } from '../types';
import { supabase } from '../lib/supabase';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');

  const loginInStore = useStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as any)?.redirect || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    try {
      if (isSignUp) {
        if (!formData.name || !formData.phone) {
          setError('Please fill all required fields');
          return;
        }

        // Check if this is the first user
        const { count, error: _countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const isFirstUser = count === 0;
        const role = isFirstUser ? 'admin' : 'customer';

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              name: formData.name,
              phone: formData.phone,
              role: role,
              address: {}
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // If session is returned, it means email verification is disabled in Supabase
          if (data.session) {
            const metadata = data.user.user_metadata;
            const user: User = {
              id: data.user.id,
              name: metadata.name || data.user.email?.split('@')[0],
              email: data.user.email || '',
              phone: metadata.phone || '',
              address: metadata.address || {},
              addresses: metadata.addresses || [],
              role: metadata.role || 'customer',
            };
            loginInStore(user);
            navigate(user.role === 'admin' ? '/admin' : redirect);
          } else {
            // email verification is enabled
            navigate('/auth-success', { state: { type: 'registration' } });
          }
        }
      } else {
        // Sign In
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          const metadata = data.user.user_metadata;
          const user: User = {
            id: data.user.id,
            name: metadata.name || data.user.email?.split('@')[0],
            email: data.user.email || '',
            phone: metadata.phone || '',
            address: metadata.address || {},
            addresses: metadata.addresses || [],
            role: metadata.role || 'customer',
          };
          loginInStore(user);
          navigate(user.role === 'admin' ? '/admin' : redirect);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-600 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
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
