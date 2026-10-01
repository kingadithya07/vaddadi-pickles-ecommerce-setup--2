import React from 'react';
import { useStore } from '../store';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';

export function Wishlist() {
  const products = useStore((state) => state.products);
  const wishlistIds = useStore((state) => state.wishlist) || [];
  
  const wishlistedProducts = products.filter(product => wishlistIds.includes(product.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <Heart size={32} className="text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Looks like you haven't saved any pickles yet. Browse our collection and heart your favorites!
          </p>
          <Link 
            to="/products"
            className="inline-flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <ShoppingBag size={20} />
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
