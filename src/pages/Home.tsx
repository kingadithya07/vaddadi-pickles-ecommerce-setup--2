import { ArrowRight, Truck, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store';

export function Home() {
  const products = useStore((state) => state.products);
  const combos = useStore((state) => state.combos);
  
  const sortedProducts = [...products].sort((a, b) => {
    const aTotalStock = (a.variants || []).reduce((sum, v) => sum + v.stock, 0);
    const bTotalStock = (b.variants || []).reduce((sum, v) => sum + v.stock, 0);
    const aIsOutOfStock = !a.inStock || aTotalStock <= 0;
    const bIsOutOfStock = !b.inStock || bTotalStock <= 0;
    
    if (aIsOutOfStock === bIsOutOfStock) return 0;
    return aIsOutOfStock ? 1 : -1;
  });

  const featuredProducts = sortedProducts.slice(0, 4);

  const calculateComboWeight = (comboProducts: { variantWeight: string }[]) => {
    const totalGrams = comboProducts.reduce((sum, p) => {
      const weight = p.variantWeight.toLowerCase();
      if (weight.includes('kg')) {
        return sum + parseFloat(weight) * 1000;
      }
      return sum + parseFloat(weight);
    }, 0);

    return totalGrams >= 1000
      ? `${totalGrams / 1000} kg`
      : `${totalGrams} g`;
  };

  return (
    <div>
      <Helmet>
        <title>Vaddadi Pickles - Authentic Homemade Pickles</title>
        <meta name="description" content="Discover authentic, homemade pickles made with traditional recipes passed down through generations. Shop Vaddadi Pickles online now!" />
      </Helmet>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Authentic Homemade <span className="inline md:block text-yellow-300">Pickles</span>
              </h1>
              <p className="text-lg md:text-xl text-green-100 mb-8">
                Experience the taste of tradition with Vaddadi Pickles. Made with love,
                natural ingredients, and recipes passed down through generations.
              </p>
              <div className="flex flex-row gap-3 sm:gap-4 justify-center md:justify-start w-full">
                <Link
                  to="/products"
                  className="flex-1 sm:flex-none bg-yellow-400 text-green-900 px-4 sm:px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  Shop Now <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                </Link>
                <Link
                  to="/orders"
                  className="flex-1 sm:flex-none border-2 border-white px-4 sm:px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-green-800 transition flex items-center justify-center text-sm sm:text-base whitespace-nowrap"
                >
                  Track Order
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <img
                  src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg"
                  alt="Vaddadi Pickles"
                  className="w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 rounded-full object-cover border-4 sm:border-8 border-yellow-400 shadow-2xl"
                />
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 text-3xl sm:text-4xl md:text-5xl animate-bounce">🥭</div>
                <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 text-3xl sm:text-4xl md:text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌶️</div>
                <div className="absolute top-1/2 -left-6 sm:-left-8 text-2xl sm:text-3xl md:text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🍋</div>
                <div className="absolute top-1/2 -right-6 sm:-right-8 text-2xl sm:text-3xl md:text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>🧄</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Shop by Category</h2>
            <p className="text-gray-600">Find exactly what you're craving</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { name: 'Pickles', id: 'pickles', icon: '🥭', color: 'from-orange-400 to-orange-500' },
              { name: 'Fryums', id: 'fryums', icon: '🥨', color: 'from-yellow-400 to-yellow-500' },
              { name: 'Powders', id: 'powders', icon: '🌶️', color: 'from-red-400 to-red-500' },
              { name: 'Combos', id: 'combo', icon: '🎁', color: 'from-purple-400 to-purple-500' }
            ].map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`}
                className="group relative flex flex-col items-center justify-center p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center text-4xl sm:text-5xl shadow-inner mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Bestsellers</h2>
            <p className="text-gray-600">Most loved pickles by our customers</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition"
            >
              View All Products <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md text-center flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0">
              <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-green-100 rounded-full flex items-center justify-center mb-0 md:mb-4">
                <div className="scale-75 md:scale-100"><Truck className="text-green-600" size={32} /></div>
              </div>
              <div>
                <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">Free Delivery</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Free shipping on orders above ₹1000</p>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md text-center flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0">
              <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-green-100 rounded-full flex items-center justify-center mb-0 md:mb-4">
                <div className="scale-75 md:scale-100"><Shield className="text-green-600" size={32} /></div>
              </div>
              <div>
                <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">100% Natural</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">No preservatives or artificial colors</p>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md text-center flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0">
              <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-green-100 rounded-full flex items-center justify-center mb-0 md:mb-4">
                <div className="scale-75 md:scale-100"><Award className="text-green-600" size={32} /></div>
              </div>
              <div>
                <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">Traditional Recipes</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Authentic taste from Andhra Pradesh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Combos */}
      <section className="py-16 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Special Combos</h2>
            <p className="text-gray-600">Great value packs for you and your family</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...(combos || [])].sort((a, b) => {
              const aIsOutOfStock = a.stock <= 0;
              const bIsOutOfStock = b.stock <= 0;
              if (aIsOutOfStock === bIsOutOfStock) return 0;
              return aIsOutOfStock ? 1 : -1;
            }).map((combo) => (
              <ProductCard
                key={combo.id}
                product={{
                  id: combo.id,
                  name: combo.name,
                  description: combo.description,
                  image: combo.image,
                  category: 'Combo',
                  variants: [{
                    weight: `Pack (${calculateComboWeight(combo.products)})`,
                    price: combo.comboPrice,
                    mrp: combo.originalPrice,
                    stock: combo.stock
                  }],
                  inStock: combo.stock > 0,
                  rating: 5,
                  reviews: 0,
                  bestSeller: false,
                }}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/products?category=Combo"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition"
            >
              View All Combos <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Forced update to clear cache on hosting provider */}
    </div>
  );
}
