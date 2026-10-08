import { useState } from 'react';
import { X, Share2, ShoppingCart, ArrowRight, Plus, Minus, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { Product } from '../types';
import { ProductShareModal } from './ProductShareModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ComboDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ComboDetailsModal({ product, isOpen, onClose }: ComboDetailsModalProps) {
  const navigate = useNavigate();
  const combos = useStore((state) => state.combos);
  const allProducts = useStore((state) => state.products);
  const addToCart = useStore((state) => state.addToCart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const cart = useStore((state) => state.cart);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!isOpen) return null;

  const combo = combos.find((c) => c.id === product.id);
  if (!combo) return null;

  const comboVariant = product.variants?.[0] || {
    weight: 'Combo Pack',
    price: combo.comboPrice,
    mrp: combo.originalPrice,
    stock: combo.stock
  };

  const isOutOfStock = combo.stock <= 0;
  const inCart = cart.find((item) => String(item.product.id) === String(product.id));

  const handleAddToCart = () => {
    addToCart(product, comboVariant, 1, false);
    toast.success(`${combo.name} added to cart! 🥒`);
    onClose();
  };

  const handleBuyNow = () => {
    if (!inCart) {
      addToCart(product, comboVariant, 1, false);
    }
    onClose();
    navigate('/cart');
  };

  const handleIncrement = () => {
    if (inCart) {
      if (inCart.quantity >= combo.stock) {
        toast.error(`Maximum available stock (${combo.stock}) reached`);
        return;
      }
      updateQuantity(product.id, comboVariant.weight, inCart.quantity + 1, false);
    } else {
      addToCart(product, comboVariant, 1, false);
    }
  };

  const handleDecrement = () => {
    if (!inCart) return;
    if (inCart.quantity <= 1) {
      removeFromCart(product.id, comboVariant.weight, false);
      toast.success(`${combo.name} removed from cart 🛒`);
    } else {
      updateQuantity(product.id, comboVariant.weight, inCart.quantity - 1, false);
    }
  };

  const handleRemoveFromCart = () => {
    if (!inCart) return;
    removeFromCart(product.id, comboVariant.weight, false);
    toast.success(`${combo.name} removed from cart 🛒`);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-purple-600 rounded-full transition-colors shadow-sm"
              title="Share Combo"
              aria-label="Share Combo"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="p-6 border-b border-gray-100 bg-purple-50">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-md">
              Special Combo Pack
            </span>
            <h2 className="text-2xl font-bold text-gray-800 pr-20 mt-1">{combo.name}</h2>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{combo.description}</p>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">Items in this Combo:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {combo.products.map((item, index) => {
                const itemProduct = allProducts.find((p) => p.id === item.productId);
                if (!itemProduct) return null;

                return (
                  <div key={`${item.productId}-${index}`} className="flex items-center gap-3.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                      {itemProduct.image.startsWith('http') || itemProduct.image.startsWith('/') ? (
                        <img src={itemProduct.image} alt={itemProduct.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{itemProduct.image}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm leading-tight truncate">{itemProduct.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Weight: <span className="font-medium text-gray-700">{item.variantWeight}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex items-center justify-between sm:block">
              <div>
                <p className="text-xs text-gray-500">Combo Price</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">₹{combo.comboPrice}</span>
                  <span className="text-sm text-gray-400 line-through">₹{combo.originalPrice}</span>
                  {combo.originalPrice > combo.comboPrice && (
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Save ₹{combo.originalPrice - combo.comboPrice}
                    </span>
                  )}
                </div>
              </div>

              {inCart && (
                <div className="sm:hidden flex items-center border border-green-600 bg-green-50 rounded-xl overflow-hidden">
                  <button
                    onClick={handleDecrement}
                    className="px-2.5 py-1 text-green-700 hover:bg-green-100 font-bold"
                    aria-label="Decrease quantity"
                  >
                    {inCart.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
                  </button>
                  <span className="px-2 py-1 text-xs font-bold text-green-800 min-w-[24px] text-center">
                    {inCart.quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={inCart.quantity >= combo.stock}
                    className="px-2.5 py-1 text-green-700 hover:bg-green-100 disabled:opacity-40 font-bold"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="p-2.5 sm:px-4 sm:py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 text-sm"
                title="Share Combo"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Share</span>
              </button>

              {isOutOfStock ? (
                <button
                  disabled
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-gray-300 text-gray-500 rounded-xl font-bold text-sm cursor-not-allowed uppercase"
                >
                  Out of Stock
                </button>
              ) : inCart ? (
                <>
                  <div className="hidden sm:flex items-center border border-green-600 bg-green-50 rounded-xl overflow-hidden">
                    <button
                      onClick={handleDecrement}
                      className="px-3 py-2 text-green-700 hover:bg-green-100 font-bold transition-colors"
                      title={inCart.quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                      aria-label="Decrease quantity"
                    >
                      {inCart.quantity === 1 ? <Trash2 size={16} className="text-red-500" /> : <Minus size={16} />}
                    </button>
                    <span className="px-3 py-2 text-sm font-bold text-green-800 min-w-[32px] text-center">
                      {inCart.quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={inCart.quantity >= combo.stock}
                      className="px-3 py-2 text-green-700 hover:bg-green-100 disabled:opacity-40 font-bold transition-colors"
                      title="Increase quantity"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={handleRemoveFromCart}
                    className="p-2.5 sm:px-3 sm:py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 text-sm"
                    title="Remove from Cart"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/cart');
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 text-sm shadow-md"
                  >
                    <ShoppingCart size={16} />
                    <span>View in Cart ({inCart.quantity})</span>
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 text-sm shadow-sm"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 text-sm shadow-md"
                  >
                    Buy Now <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>
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
