import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../store';
import { ReviewModal } from './ReviewModal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useStore((state) => state.addToCart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const cart = useStore((state) => state.cart);
  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const selectedVariant = product.variants?.find(v => v.weight === selectedWeight);

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
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative h-36 sm:h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        {product.image.startsWith('http') || product.image.startsWith('/') ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          />
        ) : (
          <span className="text-6xl sm:text-8xl group-hover:scale-110 transition-transform">{product.image}</span>
        )}
        {product.bestSeller && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
            Best Seller
          </span>
        )}
        {totalInCart > 0 && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center">
            {totalInCart}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2 sm:p-4">
        <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1 leading-tight">{product.name}</h3>

        {/* Rating - Clickable to open reviews */}
        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="flex items-center gap-1 mb-1 sm:mb-2 hover:bg-gray-50 px-1 rounded transition-colors group/rating"
        >
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 group-hover/rating:text-yellow-200'}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium">({product.reviews})</span>
        </button>

        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 hidden sm:block">{product.description}</p>

        {/* Weight Options - Horizontal Line */}
        <div className="mb-2 sm:mb-3">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2 text-nowrap">Weight:</p>
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(product.variants || []).map((variant) => {
              const variantInCart = cart.find(
                item => item.product.id === product.id && item.variant.weight === variant.weight
              );

              return (
                <button
                  key={variant.weight}
                  onClick={() => handleWeightSelect(variant.weight)}
                  className={`relative flex-shrink-0 min-w-[50px] sm:flex-1 py-1 sm:py-2 px-1 text-[10px] sm:text-xs font-medium rounded-md sm:rounded-lg border transition-all ${selectedWeight === variant.weight
                    ? 'border-green-600 bg-green-600 text-white'
                    : variantInCart
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-400 text-gray-700'
                    }`}
                >
                  {variant.weight}
                  {variantInCart && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[8px] sm:text-[10px] w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                      {variantInCart.quantity}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Display */}
        <div className="mb-2 sm:mb-3 h-[24px] sm:min-h-[28px] flex items-center">
          {selectedVariant ? (
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="text-lg sm:text-2xl font-bold text-green-600">₹{selectedVariant.price}</span>
              <span className="text-xs sm:text-sm text-gray-400 line-through">₹{selectedVariant.mrp}</span>
              <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                {Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100)}% OFF
              </span>
            </div>
          ) : (
            <p className="text-[10px] sm:text-sm text-gray-500">Select weight</p>
          )}
        </div>

        {/* Add to Cart / Quantity Controls */}
        {selectedWeight && selectedVariant ? (
          <div>
            {cartItem ? (
              /* Show only +/- controls when item is in cart */
              <div className="flex items-center justify-center bg-green-600 rounded-lg sm:rounded-xl overflow-hidden h-8 sm:h-auto">
                <button
                  onClick={handleDecrement}
                  className="flex-1 h-full text-white hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Minus size={16} strokeWidth={3} />
                </button>
                <div className="flex-1 h-full text-white font-bold text-sm sm:text-lg text-center bg-green-600 flex items-center justify-center">
                  {cartItem.quantity}
                </div>
                <button
                  onClick={handleIncrement}
                  className="flex-1 h-full text-white hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
            ) : (
              /* Show Add to Cart button if not in cart */
              <button
                onClick={handleIncrement}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base"
              >
                <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
                Add
              </button>
            )}
          </div>
        ) : (
          /* Disabled state when no weight selected */
          <button
            disabled
            className="w-full bg-gray-200 text-gray-400 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base"
          >
            <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
            Select Wt.
          </button>
        )}
      </div>

      <ReviewModal
        product={product}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}
