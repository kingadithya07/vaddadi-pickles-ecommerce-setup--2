import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../store';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, removeFromCart, cart } = useStore();
  const [selectedWeight, setSelectedWeight] = useState<string>('');

  const selectedVariant = product.variants.find(v => v.weight === selectedWeight);
  
  // Check if this product with selected weight is in cart
  const cartItem = cart.find(
    item => item.product.id === product.id && item.variant.weight === selectedWeight
  );
  const totalInCart = cart
    .filter(item => item.product.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleWeightSelect = (weight: string) => {
    setSelectedWeight(weight);
  };

  const handleIncrement = () => {
    if (selectedVariant) {
      addToCart(product, selectedVariant, 1);
    }
  };

  const handleDecrement = () => {
    if (cartItem && selectedVariant) {
      if (cartItem.quantity === 1) {
        removeFromCart(product.id, selectedVariant.weight);
      } else {
        addToCart(product, selectedVariant, -1);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <span className="text-8xl group-hover:scale-110 transition-transform">{product.image}</span>
        {product.bestSeller && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Best Seller
          </span>
        )}
        {totalInCart > 0 && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {totalInCart}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Weight Options - Horizontal Line */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Select Weight:</p>
          <div className="flex gap-2">
            {product.variants.map((variant) => {
              const variantInCart = cart.find(
                item => item.product.id === product.id && item.variant.weight === variant.weight
              );
              
              return (
                <button
                  key={variant.weight}
                  onClick={() => handleWeightSelect(variant.weight)}
                  className={`relative flex-1 py-2 px-1 text-xs font-medium rounded-lg border-2 transition-all ${
                    selectedWeight === variant.weight
                      ? 'border-green-600 bg-green-600 text-white'
                      : variantInCart
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-400 text-gray-700'
                  }`}
                >
                  {variant.weight}
                  {variantInCart && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {variantInCart.quantity}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Display */}
        <div className="mb-3 min-h-[28px]">
          {selectedVariant ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">₹{selectedVariant.price}</span>
              <span className="text-sm text-gray-400 line-through">₹{Math.round(selectedVariant.price * 1.2)}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">20% OFF</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">← Select weight to see price</p>
          )}
        </div>

        {/* Add to Cart / Quantity Controls */}
        {selectedWeight && selectedVariant ? (
          <div>
            {cartItem ? (
              /* Show only +/- controls when item is in cart */
              <div className="flex items-center justify-center bg-green-600 rounded-xl overflow-hidden">
                <button
                  onClick={handleDecrement}
                  className="flex-1 py-3 text-white hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Minus size={20} strokeWidth={3} />
                </button>
                <div className="flex-1 py-3 text-white font-bold text-lg text-center bg-green-600">
                  {cartItem.quantity}
                </div>
                <button
                  onClick={handleIncrement}
                  className="flex-1 py-3 text-white hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>
            ) : (
              /* Show Add to Cart button if not in cart */
              <button
                onClick={handleIncrement}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            )}
          </div>
        ) : (
          /* Disabled state when no weight selected */
          <button
            disabled
            className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Select a weight first
          </button>
        )}
      </div>
    </div>
  );
}
