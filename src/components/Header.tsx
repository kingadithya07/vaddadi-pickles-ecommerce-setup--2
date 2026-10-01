import { ShoppingCart, User, Menu, X, LogOut, Package, Search, Heart } from 'lucide-react';
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
  const wishlist = useStore((state) => state.wishlist) || [];
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div className="bg-yellow-500 text-black text-xs md:text-sm font-semibold py-1.5 px-4 text-center">
        <p className="hidden md:block">
          🎉 Free Delivery all over India on orders above ₹1000! | 🏍️ Visakhapatnam: Uber/Rapido Parcel | 🚚 Rest of India: Courier Partner
        </p>
        <div className="md:hidden flex flex-col gap-0.5">
          <span>🎉 Free Delivery all over India above ₹1000!</span>
          <span className="text-[10px] opacity-90">Visakhapatnam: Uber/Rapido | Rest of India: Courier</span>
        </div>
      </div>
      <div className="bg-orange-100 text-orange-900 text-xs md:text-sm font-medium py-1.5 px-4 text-center border-b border-orange-200">
        <p>
          <span className="font-bold">Note:</span> For bulk orders / Pelli Saare food items contact no: <a href="tel:8008129309" className="font-bold hover:underline">8008129309</a> / <a href="tel:9885192948" className="font-bold hover:underline">9885192948</a>
        </p>
      </div>

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
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('q');
                if (query) navigate(`/products?search=${encodeURIComponent(query as string)}`);
              }}
              className="relative hidden lg:flex items-center"
            >
              <input 
                type="text" 
                name="q"
                placeholder="Search pickles..." 
                className="pl-3 pr-8 py-1 rounded-full text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-48 transition-all" 
              />
              <button type="submit" className="absolute right-2 text-gray-500 hover:text-green-600">
                <Search size={16} />
              </button>
            </form>
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
            <Link to="/wishlist" className="relative hover:text-green-200 transition hidden md:block">
              <Heart size={24} />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            
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
                        to="/affiliate" 
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition"
                      >
                        Affiliate Dashboard
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
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const query = formData.get('q');
                  if (query) {
                    navigate(`/products?search=${encodeURIComponent(query as string)}`);
                    setMenuOpen(false);
                  }
                }}
                className="relative flex items-center px-2 mb-2"
              >
                <input 
                  type="text" 
                  name="q"
                  placeholder="Search pickles..." 
                  className="pl-3 pr-8 py-2 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full transition-all" 
                />
                <button type="submit" className="absolute right-4 text-gray-500 hover:text-green-600">
                  <Search size={18} />
                </button>
              </form>
              <Link to="/" className="hover:text-green-200 px-2" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/products" className="hover:text-green-200 px-2" onClick={() => setMenuOpen(false)}>Products</Link>
              <Link to="/wishlist" className="hover:text-green-200 px-2 flex items-center justify-between" onClick={() => setMenuOpen(false)}>
                My Wishlist {wishlist.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlist.length}</span>}
              </Link>
              {user ? (
                <>
                  <Link to="/orders" className="hover:text-green-200 px-2" onClick={() => setMenuOpen(false)}>My Orders</Link>
                  <Link to="/profile" className="hover:text-green-200 px-2" onClick={() => setMenuOpen(false)}>Profile Settings</Link>
                  <Link to="/profile#support-tickets" className="hover:text-green-200 px-2 flex items-center justify-between" onClick={() => { setMenuOpen(false); setTimeout(() => { document.getElementById('support-tickets')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>
                    Support Tickets
                  </Link>
                  <Link to="/affiliate" className="hover:text-green-200 px-2" onClick={() => setMenuOpen(false)}>Affiliate Dashboard</Link>
                  {isAdmin && (
                    <Link to="/admin" className="hover:text-green-200 px-2" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-left hover:text-red-300 text-red-200 px-2 mt-2">Logout</button>
                </>
              ) : (
                <Link to="/login" className="hover:text-green-200 px-2 flex items-center gap-2 mt-2 font-semibold bg-white/10 py-2 rounded-lg" onClick={() => setMenuOpen(false)}>
                  <User size={18} /> Login / Sign Up
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
      </header>
    </>
  );
}

