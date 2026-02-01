import { ArrowRight, Truck, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store';

export function Home() {
  const products = useStore((state) => state.products);
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Authentic Homemade
                <span className="block text-yellow-300">Pickles</span>
              </h1>
              <p className="text-xl text-green-100 mb-8">
                Experience the taste of tradition with Vaddadi Pickles. Made with love, 
                natural ingredients, and recipes passed down through generations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/products"
                  className="bg-yellow-400 text-green-900 px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition flex items-center justify-center gap-2"
                >
                  Shop Now <ArrowRight size={20} />
                </Link>
                <Link
                  to="/orders"
                  className="border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-green-800 transition text-center"
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
                  className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover border-8 border-yellow-400 shadow-2xl"
                />
                <div className="absolute -top-4 -right-4 text-5xl animate-bounce">🥭</div>
                <div className="absolute -bottom-4 -left-4 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌶️</div>
                <div className="absolute top-1/2 -left-8 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🍋</div>
                <div className="absolute top-1/2 -right-8 text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>🧄</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Free Delivery</h3>
              <p className="text-gray-600">Free shipping on orders above ₹1000</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">100% Natural</h3>
              <p className="text-gray-600">No preservatives or artificial colors</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Traditional Recipes</h3>
              <p className="text-gray-600">Authentic taste from Andhra Pradesh</p>
            </div>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Testimonials */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Priya Sharma', text: 'Best mango pickle I have ever tasted! Reminds me of my grandmother\'s pickle.', rating: 5 },
              { name: 'Rajesh Kumar', text: 'Authentic Andhra taste. The gongura pickle is absolutely amazing!', rating: 5 },
              { name: 'Anitha Reddy', text: 'Great quality and fast delivery. Will definitely order again!', rating: 5 },
            ].map((review, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{review.text}"</p>
                <p className="font-semibold text-gray-800">- {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
