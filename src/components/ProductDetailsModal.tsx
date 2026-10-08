import { useState } from 'react';
import { X, Star, ShoppingCart, Share2, Check, ArrowRight } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useStore } from '../store';
import { ProductShareModal } from './ProductShareModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ProductDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  const navigate = useNavigate();
  const addToCart = useStore((state) => state.addToCart);
  const cart = useStore((state) => state.cart);

  const [selectedWeight, setSelectedWeight] = useState<string>(
    product.variants && product.variants.length > 0 ? product.variants[0].weight : ''
  );
  const [noGarlic, setNoGarlic] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedVariant: ProductVariant | undefined = product.variants?.find(
    (v) => v.weight === selectedWeight
  ) || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);

  const cartItem = cart.find(
    (item) => item.product.id === product.id && item.variant.weight === selectedWeight && !!item.noGarlic === !!noGarlic
  );

  const totalStock = (product.variants || []).reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = !product.inStock || totalStock <= 0 || (selectedVariant && selectedVariant.stock <= 0);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a weight');
      return;
    }
    addToCart(product, selectedVariant, quantity, noGarlic);
    toast.success(`${product.name} (${selectedVariant.weight}) added to cart! 🥒`);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error('Please select a weight');
      return;
    }
    addToCart(product, selectedVariant, quantity, noGarlic);
    onClose();
    navigate('/cart');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col relative shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Controls */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-green-600 rounded-full transition-colors shadow-md"
              title="Share this product"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full transition-colors shadow-md"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {/* Product Image */}
            <div className="relative h-56 sm:h-72 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
              {product.image.startsWith('http') || product.image.startsWith('/') ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl">{product.image}</span>
              )}

              {product.bestSeller && (
                <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  Best Seller
                </span>
              )}

              {/* Rating */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
                </span>
                {product.reviews > 0 && (
                  <span className="text-[11px] text-gray-500">({product.reviews})</span>
                )}
              </div>
            </div>

            {/* Product Info Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                  {product.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5 leading-tight">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Weight Variants */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Select Weight:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(product.variants || []).map((variant) => {
                    const isSelected = selectedWeight === variant.weight;
                    const isVariantOut = variant.stock <= 0;

                    return (
                      <button
                        key={variant.weight}
                        onClick={() => !isVariantOut && setSelectedWeight(variant.weight)}
                        disabled={isVariantOut}
                        className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-1.5 ${
                          isVariantOut
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : isSelected
                            ? 'border-green-600 bg-green-600 text-white shadow-sm ring-2 ring-green-600/20'
                            : 'border-gray-200 hover:border-green-400 bg-white text-gray-700'
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                        {variant.weight}
                        <span className={`text-[11px] ml-0.5 ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>
                          - ₹{variant.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Garlic Toggle */}
              {product.hasNoGarlicOption && (
                <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`modal-no-garlic-${product.id}`}
                    checked={noGarlic}
                    onChange={(e) => setNoGarlic(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
                  />
                  <label 
                    htmlFor={`modal-no-garlic-${product.id}`}
                    className="text-xs sm:text-sm text-gray-800 font-medium cursor-pointer select-none"
                  >
                    Without Garlic (Pure Vegetarian / No Garlic Recipe)
                  </label>
                </div>
              )}

              {/* Pricing & Stock Status */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  {selectedVariant ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-green-700">
                        ₹{selectedVariant.price}
                      </span>
                      {selectedVariant.mrp > selectedVariant.price && (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{selectedVariant.mrp}
                          </span>
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            {Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-lg text-gray-400">Select weight</span>
                  )}
                </div>

                {/* Quantity Controls */}
                {!isOutOfStock && (
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 font-bold text-base transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-sm font-bold text-gray-800 min-w-[28px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 font-bold text-base transition-colors"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed uppercase text-sm"
              >
                Out of Stock
              </button>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingCart size={18} />
                  {cartItem ? `Add More (${cartItem.quantity} in cart)` : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  Buy Now <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ProductShareModal
        product={product}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
}
