import { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, Share2, Check, ArrowRight, Plus, Minus, Trash2 } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useStore } from '../store';
import { ProductShareModal } from './ProductShareModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ProductDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  initialWeight?: string;
  initialNoGarlic?: boolean;
}

export function ProductDetailsModal({ 
  product, 
  isOpen, 
  onClose,
  initialWeight,
  initialNoGarlic
}: ProductDetailsModalProps) {
  const navigate = useNavigate();
  const addToCart = useStore((state) => state.addToCart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const cart = useStore((state) => state.cart);

  const [selectedWeight, setSelectedWeight] = useState<string>(
    initialWeight || (product.variants && product.variants.length > 0 ? product.variants[0].weight : '')
  );
  const [noGarlic, setNoGarlic] = useState<boolean>(initialNoGarlic ?? false);
  const [quantity, setQuantity] = useState<number>(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Sync state when modal opens or initial props change
  useEffect(() => {
    if (isOpen) {
      // Find if this product (matching initialWeight if provided, or any variant) is in cart
      const matchingCartItem =
        cart.find(
          (i) =>
            String(i.product.id) === String(product.id) &&
            Boolean(initialWeight && i.variant.weight === initialWeight)
        ) || cart.find((i) => String(i.product.id) === String(product.id));

      if (matchingCartItem) {
        setSelectedWeight(matchingCartItem.variant.weight);
        setNoGarlic(Boolean(matchingCartItem.noGarlic));
        setQuantity(matchingCartItem.quantity);
      } else {
        if (initialWeight) {
          setSelectedWeight(initialWeight);
        } else if (product.variants && product.variants.length > 0) {
          setSelectedWeight(product.variants[0].weight);
        }
        if (initialNoGarlic !== undefined) {
          setNoGarlic(initialNoGarlic);
        }
        setQuantity(1);
      }
    }
  }, [isOpen, initialWeight, initialNoGarlic, product.id]);

  if (!isOpen) return null;

  const selectedVariant: ProductVariant | undefined = product.variants?.find(
    (v) => v.weight === selectedWeight
  ) || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);

  const currentWeight = selectedVariant?.weight || selectedWeight;

  const cartItem = cart.find(
    (item) =>
      String(item.product.id) === String(product.id) &&
      item.variant.weight === currentWeight &&
      Boolean(item.noGarlic) === Boolean(noGarlic)
  );

  const totalStock = (product.variants || []).reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = !product.inStock || totalStock <= 0 || (selectedVariant && selectedVariant.stock <= 0);

  const handleWeightSelect = (weight: string) => {
    setSelectedWeight(weight);
    const existing = cart.find(
      (item) =>
        String(item.product.id) === String(product.id) &&
        item.variant.weight === weight &&
        Boolean(item.noGarlic) === Boolean(noGarlic)
    );
    setQuantity(existing ? existing.quantity : 1);
  };

  const handleGarlicToggle = (checked: boolean) => {
    setNoGarlic(checked);
    const existing = cart.find(
      (item) =>
        String(item.product.id) === String(product.id) &&
        item.variant.weight === currentWeight &&
        Boolean(item.noGarlic) === Boolean(checked)
    );
    setQuantity(existing ? existing.quantity : 1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select a weight');
      return;
    }
    const qtyToAdd = quantity > 0 ? quantity : 1;
    addToCart(product, selectedVariant, qtyToAdd, noGarlic);
    toast.success(`${product.name} (${selectedVariant.weight}) added to cart! 🥒`);
    setQuantity(qtyToAdd);
    onClose();
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error('Please select a weight');
      return;
    }
    const qtyToAdd = quantity > 0 ? quantity : 1;
    if (!cartItem) {
      addToCart(product, selectedVariant, qtyToAdd, noGarlic);
    }
    onClose();
    navigate('/cart');
  };

  const handleIncrement = () => {
    if (!selectedVariant) return;
    const maxStock = selectedVariant.stock;
    if (cartItem) {
      if (cartItem.quantity >= maxStock) {
        toast.error(`Maximum available stock (${maxStock}) reached`);
        return;
      }
      updateQuantity(product.id, selectedVariant.weight, cartItem.quantity + 1, noGarlic);
      setQuantity(cartItem.quantity + 1);
    } else {
      if (quantity >= maxStock) {
        toast.error(`Maximum available stock (${maxStock}) reached`);
        return;
      }
      setQuantity((q) => Math.max(1, q + 1));
    }
  };

  const handleDecrement = () => {
    if (!selectedVariant) return;
    if (cartItem) {
      if (cartItem.quantity <= 1) {
        removeFromCart(product.id, selectedVariant.weight, noGarlic);
        toast.success(`${product.name} (${selectedVariant.weight}) removed from cart 🛒`);
        setQuantity(0);
      } else {
        updateQuantity(product.id, selectedVariant.weight, cartItem.quantity - 1, noGarlic);
        setQuantity(cartItem.quantity - 1);
      }
    } else {
      if (quantity <= 1) {
        // Also ensure any matching cart items for this product are cleanly removed
        const itemsToRemove = cart.filter((i) => String(i.product.id) === String(product.id));
        if (itemsToRemove.length > 0) {
          itemsToRemove.forEach((i) => removeFromCart(product.id, i.variant.weight, i.noGarlic));
          toast.success(`${product.name} removed from cart 🛒`);
        }
        setQuantity(0);
      } else {
        setQuantity((q) => q - 1);
      }
    }
  };

  const handleRemoveFromCart = () => {
    if (!selectedVariant) return;
    removeFromCart(product.id, selectedVariant.weight, noGarlic);
    const otherItems = cart.filter((i) => String(i.product.id) === String(product.id));
    otherItems.forEach((i) => removeFromCart(product.id, i.variant.weight, i.noGarlic));
    toast.success(`${product.name} (${selectedVariant.weight}) removed from cart 🛒`);
    setQuantity(0);
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
                    const variantInCart = cart.find(
                      (item) =>
                        String(item.product.id) === String(product.id) &&
                        item.variant.weight === variant.weight &&
                        Boolean(item.noGarlic) === Boolean(noGarlic)
                    );

                    return (
                      <button
                        key={variant.weight}
                        onClick={() => !isVariantOut && handleWeightSelect(variant.weight)}
                        disabled={isVariantOut}
                        className={`relative py-2 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center gap-1.5 ${
                          isVariantOut
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : isSelected
                            ? 'border-green-600 bg-green-600 text-white shadow-sm ring-2 ring-green-600/20'
                            : variantInCart
                            ? 'border-green-300 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-400 bg-white text-gray-700'
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                        {variant.weight}
                        <span className={`text-[11px] ml-0.5 ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>
                          - ₹{variant.price}
                        </span>
                        {variantInCart && !isVariantOut && (
                          <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected ? 'bg-white text-green-700' : 'bg-green-600 text-white'
                          }`}>
                            {variantInCart.quantity}
                          </span>
                        )}
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
                    onChange={(e) => handleGarlicToggle(e.target.checked)}
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
                  <div className="flex flex-col items-end gap-1">
                    {cartItem && (
                      <span className="text-[10px] sm:text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        In Cart ({cartItem.quantity})
                      </span>
                    )}
                    <div className={`flex items-center border rounded-xl overflow-hidden ${
                      cartItem ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <button
                        onClick={handleDecrement}
                        disabled={!cartItem && quantity <= 0}
                        className={`px-3 py-1.5 font-bold text-base transition-colors flex items-center justify-center ${
                          (cartItem && cartItem.quantity === 1) || (!cartItem && quantity === 1)
                            ? 'text-red-500 hover:bg-red-50 hover:text-red-700'
                            : cartItem
                            ? 'text-green-700 hover:bg-green-100'
                            : 'text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent'
                        }`}
                        title={
                          (cartItem && cartItem.quantity === 1) || (!cartItem && quantity === 1)
                            ? 'Remove'
                            : 'Decrease quantity'
                        }
                        aria-label="Decrease quantity"
                      >
                        {(cartItem && cartItem.quantity === 1) || (!cartItem && quantity === 1) ? (
                          <Trash2 size={16} className="text-red-500" />
                        ) : (
                          <Minus size={16} />
                        )}
                      </button>
                      <span className={`px-3 py-1.5 text-sm font-bold min-w-[32px] text-center ${
                        cartItem ? 'text-green-800' : quantity > 0 ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                        {cartItem ? cartItem.quantity : quantity}
                      </span>
                      <button
                        onClick={handleIncrement}
                        disabled={Boolean(selectedVariant && (cartItem ? cartItem.quantity >= selectedVariant.stock : quantity >= selectedVariant.stock))}
                        className={`px-3 py-1.5 font-bold text-base transition-colors flex items-center justify-center ${
                          cartItem
                            ? 'text-green-700 hover:bg-green-100 disabled:opacity-40 disabled:hover:bg-transparent'
                            : 'text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent'
                        }`}
                        title="Increase quantity"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
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
            ) : cartItem ? (
              <>
                <button
                  onClick={handleRemoveFromCart}
                  className="py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  title="Remove from Cart"
                >
                  <Trash2 size={16} />
                  <span>Remove</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/cart');
                  }}
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <ShoppingCart size={18} />
                  <span>View in Cart ({cartItem.quantity})</span>
                  <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingCart size={18} />
                  Add to Cart {quantity > 1 ? `(${quantity})` : ''}
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
