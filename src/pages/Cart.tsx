import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Tag, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';

import { useCartTotals } from '../hooks/useCartTotals';

export function Cart() {
  const { cart, user, coupons, appliedCoupon, updateQuantity, removeFromCart, applyCoupon, removeCoupon } = useStore();
  const { subtotal, discount, total, shipping } = useCartTotals();
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponCode);
    setCouponMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) setCouponCode('');
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { redirect: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto text-gray-300 mb-4" size={80} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Looks like you haven't added any pickles yet!</p>
        <Link
          to="/products"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={`${item.product.id}-${item.variant.weight}`} className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-green-50 rounded-lg flex items-center justify-center text-4xl overflow-hidden">
                {item.product.image.startsWith('http') || item.product.image.startsWith('/') ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  item.product.image
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                <p className="text-sm text-gray-500">{item.variant.weight}</p>
                <p className="text-green-700 font-semibold">₹{item.variant.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.variant.weight, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.variant.weight, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">₹{item.variant.price * item.quantity}</p>
                <button
                  onClick={() => removeFromCart(item.product.id, item.variant.weight)}
                  className="text-red-500 hover:text-red-700 transition mt-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>

          {/* Coupon Code */}
          <div className="mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p className={`text-sm mt-2 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {couponMessage.text}
              </p>
            )}
            {appliedCoupon && (
              <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded-lg">
                <span className="text-green-700 text-sm font-medium">{appliedCoupon.code} applied</span>
                <button onClick={removeCoupon} className="text-red-500 text-sm hover:underline">Remove</button>
              </div>
            )}
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{discount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${shipping}`}</span>
            </div>
            {subtotal < 1000 && (
              <p className="text-xs text-green-600">Add ₹{1000 - subtotal} more for FREE shipping!</p>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-800 border-t pt-3">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mt-6"
          >
            Proceed to Checkout
          </button>

          {coupons.length > 0 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Available coupons: {coupons.map(c => c.code).join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
