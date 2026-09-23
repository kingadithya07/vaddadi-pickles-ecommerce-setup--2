import { ShoppingCart, User, Menu, X, LogOut, Package } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cart = useStore((state) => state.cart);
  const user = useStore((state) => state.user);
  const isAdmin = useStore((state) => state.isAdmin);
  const logout = useStore((state) => state.logout);
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg"
              alt="Vaddadi Pickles"
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div>
              <h1 className="text-xl font-bold">Vaddadi Pickles</h1>
              <p className="text-xs text-green-200">Authentic Homemade Taste</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-green-200 transition">Home</Link>
            <Link to="/products" className="hover:text-green-200 transition">Products</Link>
            {user && (
              <Link to="/orders" className="hover:text-green-200 transition flex items-center gap-1">
                <Package size={18} />
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold hover:bg-yellow-400 transition">
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative hover:text-green-200 transition">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)} 
                  className="flex items-center gap-2 hover:text-green-200 transition focus:outline-none"
                >
                  <User size={20} />
                  <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-2 z-50 text-gray-800 border border-gray-100 divide-y divide-gray-100">
                    <div className="px-4 py-2 mb-1">
                      <p className="text-sm font-semibold truncate text-green-700">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div>
                      <Link 
                        to="/profile" 
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition"
                      >
                        Profile Settings
                      </Link>
                      <Link 
                        to="/orders" 
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition md:hidden" 
                      >
                        My Orders
                      </Link>
                    </div>
                    <div>
                      <button 
                        onClick={() => {
                          handleLogout();
                          setUserMenuOpen(false);
                        }} 
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 hover:text-green-200 transition">
                <User size={20} />
                <span className="text-sm hidden sm:inline">Sign In</span>
              </Link>
            )}

            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-green-600">
            <nav className="flex flex-col gap-3">
              <Link to="/" className="hover:text-green-200" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/products" className="hover:text-green-200" onClick={() => setMenuOpen(false)}>Products</Link>
              {user && (
                <Link to="/orders" className="hover:text-green-200" onClick={() => setMenuOpen(false)}>My Orders</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="hover:text-green-200" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
              {user && (
                <>
                  <Link to="/profile" className="hover:text-green-200" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-left hover:text-green-200">Logout</button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
