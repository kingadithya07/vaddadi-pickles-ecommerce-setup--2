import { ShoppingCart, User, Menu, X, LogOut, Package } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, user, isAdmin, logout } = useStore();
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
              <div className="hidden md:flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 hover:text-green-200 transition">
                  <User size={20} />
                  <span className="text-sm">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="hover:text-green-200 transition">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-1 hover:text-green-200 transition">
                <User size={20} />
                <span>Sign In</span>
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
              {user ? (
                <>
                  <Link to="/profile" className="hover:text-green-200" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-left hover:text-green-200">Logout</button>
                </>
              ) : (
                <Link to="/login" className="hover:text-green-200" onClick={() => setMenuOpen(false)}>Sign In</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
