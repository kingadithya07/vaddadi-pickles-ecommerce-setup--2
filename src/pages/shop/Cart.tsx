import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ShoppingBag, 
  Sparkles, 
  Gift, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  Truck
} from 'lucide-react';
import { useStore } from '@/store';
import { useCartTotals } from '@/hooks';
import { getFestiveTierStatus, FESTIVE_OFFER_NAME, FESTIVE_TIERS_CONFIG } from '@/data/festiveOffer';
import { FestiveWelcomeModal, CouponSelectionModal } from '@/components';

export function Cart() {
  const {
    cart,
    user,
    coupons,
    appliedCoupon,
    appliedReferralCode,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    removeReferralCode,
  } = useStore();
  const {
    subtotal,
    discount,
    couponDiscount,
    referralDiscount,
    isRefDiscountActive,
    total,
    shipping,
  } = useCartTotals();
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showFestiveModal, setShowFestiveModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const navigate = useNavigate();

  const festiveStatus = useMemo(() => getFestiveTierStatus(subtotal), [subtotal]);

  const activeCoupons = useMemo(() => coupons.filter((c) => c.active), [coupons]);
  const eligibleCoupons = useMemo(() => activeCoupons.filter((c) => subtotal >= c.minOrder), [activeCoupons, subtotal]);

  const [storedRefCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const urlRef = new URLSearchParams(window.location.search).get('ref');
    if (urlRef) localStorage.setItem('affiliate_ref', urlRef);
    return urlRef || localStorage.getItem('affiliate_ref');
  });

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    const result = await applyCoupon(codeToApply);
    setCouponMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) setCouponCode('');
    return result;
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-sm border border-amber-200">
          <ShoppingBag size={48} className="text-amber-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md">
          Looks like you haven't added any authentic Andhra pickles or powders yet! Explore our products and combos to claim festive free gifts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-full font-bold transition shadow-lg active:scale-95"
          >
            <span>Start Shopping</span>
            <ArrowRight size={18} />
          </Link>
          <button
            type="button"
            onClick={() => setShowFestiveModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-6 py-3.5 rounded-full font-bold transition text-sm"
          >
            <span>🪔 View Festive Offers</span>
          </button>
        </div>

        {showFestiveModal && (
          <FestiveWelcomeModal
            isOpen={showFestiveModal}
            onClose={() => setShowFestiveModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 md:pb-12">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items in your cart
          </p>
        </div>
        <Link
          to="/products"
          className="text-xs sm:text-sm font-bold text-green-700 hover:text-green-800 underline flex items-center gap-1"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Prominent Festive Offer Progress Banner (Mobile & Desktop) */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-900 via-orange-950 to-amber-900 text-white p-4 sm:p-5 shadow-xl border-2 border-yellow-500/80 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🪔</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-300">
                    {FESTIVE_OFFER_NAME} Offer
                  </span>
                  {festiveStatus.isUnlocked && (
                    <span className="text-[10px] bg-yellow-400 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      {festiveStatus.eligibleCount} FREE {festiveStatus.eligibleCount > 1 ? 'GIFTS' : 'GIFT'} UNLOCKED!
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-amber-100/90 font-medium">
                  Valid on all normal products & combos. Choose your free treats at checkout for <strong className="text-yellow-300">₹0</strong>!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFestiveModal(true)}
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/50 text-xs font-bold transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <Gift size={14} />
              <span>View Free Gift Items</span>
            </button>
          </div>

          {/* Tier Milestones Progress Bar */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] sm:text-xs font-bold">
              {FESTIVE_TIERS_CONFIG.map((tier) => {
                const isPassed = subtotal >= tier.minAmount;
                const isCurrent = festiveStatus.currentTierConfig?.tierNumber === tier.tierNumber;

                return (
                  <div
                    key={tier.tierNumber}
                    className={`p-1.5 rounded-lg border transition ${
                      isCurrent
                        ? 'bg-yellow-400 text-amber-950 border-yellow-300 shadow-sm'
                        : isPassed
                        ? 'bg-amber-800/70 text-yellow-200 border-yellow-500/40'
                        : 'bg-black/30 text-amber-200/60 border-white/10'
                    }`}
                  >
                    <div className="truncate">₹{tier.minAmount}+</div>
                    <div className="text-[9px] sm:text-[10px] font-extrabold truncate">
                      {tier.badge}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Progress Indicator */}
            {festiveStatus.isUnlocked ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-amber-100 font-medium gap-1 pt-0.5">
                <span className="text-yellow-300 font-bold flex items-center gap-1">
                  <span>🎉</span> Congratulations! You qualify for {festiveStatus.eligibleCount} complimentary gift{festiveStatus.eligibleCount > 1 ? 's' : ''}!
                </span>
                {festiveStatus.nextTierConfig && (
                  <span className="text-amber-200/90 text-[11px]">
                    Add ₹{festiveStatus.amountNeededForNext.toFixed(0)} more for {festiveStatus.nextTierConfig.badge}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-amber-200 font-medium pt-0.5">
                <span>
                  Add <strong className="text-yellow-300 font-black">₹{festiveStatus.amountNeededForNext.toFixed(0)}</strong> more to get <strong className="text-yellow-300">1 FREE Gift</strong>!
                </span>
                <span className="text-[11px] text-amber-300/80">{festiveStatus.progressPercent}% to Tier 1</span>
              </div>
            )}

            {/* Gradient progress bar line */}
            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-yellow-500/20">
              <div
                className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(5, (subtotal / 5000) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {cart.map((item) => {
            const itemKey = `${item.product.id}-${item.variant.weight}${item.noGarlic ? '-nogarlic' : ''}`;
            const itemTotalPrice = item.variant.price * item.quantity;
            const itemTotalMrp = item.variant.mrp * item.quantity;
            const hasDiscount = item.variant.mrp > item.variant.price;

            return (
              <div
                key={itemKey}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-3 sm:p-4 transition hover:shadow-md hover:border-gray-300 flex gap-3 sm:gap-4 items-center"
              >
                {/* Product Thumbnail */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-amber-50/50 border border-amber-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {item.product.image.startsWith('http') || item.product.image.startsWith('/') ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{item.product.image}</span>
                  )}
                </div>

                {/* Details & Controls */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.variant.weight, item.noGarlic)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition -mr-1"
                        aria-label="Remove item"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Weight & Customization Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="text-[11px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                        {item.variant.weight}
                      </span>
                      {item.noGarlic && (
                        <span className="text-[11px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-md">
                          No Garlic
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">
                        (₹{item.variant.price} / unit)
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price Row */}
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                    {/* Stepper with touch-friendly 36px buttons */}
                    <div className="flex items-center bg-gray-100/90 rounded-xl p-0.5 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.variant.weight, item.quantity - 1, item.noGarlic)}
                        className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 sm:w-7 text-center font-bold text-xs sm:text-sm text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.variant.weight, item.quantity + 1, item.noGarlic)}
                        className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Total item price */}
                    <div className="text-right">
                      <span className="font-extrabold text-gray-900 text-base sm:text-lg">
                        ₹{itemTotalPrice}
                      </span>
                      {hasDiscount && (
                        <span className="block text-[11px] text-gray-400 line-through">
                          ₹{itemTotalMrp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Coupon Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-4 sm:p-6 sticky top-24">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Checkout</span>
            </h2>

            {/* Coupon Code Column with "View All" */}
            <div className="mb-5 bg-gradient-to-r from-gray-50 to-amber-50/30 p-3.5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Tag size={15} className="text-green-600" />
                  <span>Have a Coupon Code?</span>
                </label>
                {activeCoupons.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCouponModal(true)}
                    className="text-xs font-black text-green-700 hover:text-green-800 underline flex items-center gap-0.5 transition"
                  >
                    <span>View All ({activeCoupons.length})</span>
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>

              {/* If customer came through referral link, show instant festive offer claim banner */}
              {storedRefCode && !appliedReferralCode && (
                <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🪔</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-amber-950">
                          Partner Code: <span className="font-mono bg-yellow-200 text-amber-950 px-1.5 py-0.5 rounded font-black">{storedRefCode.toUpperCase()}</span>
                        </span>
                        <span className="text-[10px] bg-yellow-400 text-amber-950 font-black px-1.5 py-0.5 rounded-full uppercase">
                          0.5% Off till 21st Oct
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Claim 0.5% referral discount! You can also apply normal coupons as usual.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(storedRefCode)}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition shadow-sm self-start sm:self-auto flex items-center gap-1 active:scale-95"
                  >
                    <span>Claim 0.5% Discount</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {/* Applied Referral Partner Badge (if active) */}
              {appliedReferralCode && (
                <div className="mb-3 p-3 bg-amber-50/80 border border-amber-300 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🤝</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-950 text-xs sm:text-sm">
                          {appliedReferralCode}
                        </span>
                        <span className="text-[10px] bg-yellow-400 text-amber-950 font-black px-1.5 py-0.5 rounded-full uppercase">
                          Partner 0.5% Off
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 font-medium">
                        {isRefDiscountActive ? '0.5% Referral Discount (Eligible till 21st October)' : 'Partner linked (0.5% discount ended on 21st October)'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeReferralCode}
                    className="text-xs font-bold text-red-600 hover:text-red-800 bg-white hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Normal Coupon Section - Stacks with Referral Code! */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-green-900 text-xs sm:text-sm">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[10px] bg-green-200 text-green-900 font-black px-1.5 py-0.5 rounded">
                          Coupon Applied
                        </span>
                      </div>
                      <p className="text-[11px] text-green-700 font-medium">
                        Saving {appliedCoupon.type === 'fixed' ? `₹${appliedCoupon.discount}` : `${appliedCoupon.discount}%`} on this order!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs font-bold text-red-600 hover:text-red-800 bg-white hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Enter coupon or referral code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full uppercase font-mono px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition shadow-sm active:scale-95"
                    >
                      Apply
                    </button>
                  </div>

                  {activeCoupons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCouponModal(true)}
                      className="w-full text-left text-[11px] text-green-700 hover:text-green-800 bg-white p-2 rounded-lg border border-dashed border-green-300 flex items-center justify-between font-semibold transition hover:bg-green-50/50"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-500" />
                        <span>{eligibleCoupons.length} coupon{eligibleCoupons.length !== 1 ? 's' : ''} eligible right now</span>
                      </span>
                      <span className="underline font-bold flex items-center">
                        Select Coupon <ChevronRight size={12} />
                      </span>
                    </button>
                  )}
                </div>
              )}

              {couponMessage && (
                <p className={`text-xs mt-2 font-medium ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2.5 border-t border-gray-100 pt-3 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag size={13} />
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                  </span>
                  <span className="font-bold">-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}

              {referralDiscount > 0 && (
                <div className="flex justify-between text-amber-800 font-medium">
                  <span className="flex items-center gap-1">
                    <span>🤝</span>
                    <span>Referral Discount ({appliedReferralCode} - 0.5%)</span>
                  </span>
                  <span className="font-bold">-₹{referralDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <Truck size={14} className="text-gray-400" />
                  <span>Delivery Charges</span>
                </span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full text-xs">
                      FREE
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-900">₹{shipping}</span>
                  )}
                </span>
              </div>

              {subtotal < 1000 && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <p className="font-semibold flex items-center gap-1">
                    <span>🚚</span> Add ₹{(1000 - subtotal).toFixed(0)} more for FREE All-India Shipping!
                  </p>
                </div>
              )}

              {/* Festive Free Gifts Included Notice */}
              {festiveStatus.isUnlocked && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>🎁</span>
                    <span>{festiveStatus.eligibleCount} Festive Free Gift{festiveStatus.eligibleCount > 1 ? 's' : ''} Included</span>
                  </div>
                  <span className="font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-[10px]">
                    ₹0 FREE
                  </span>
                </div>
              )}

              {/* Total Row */}
              <div className="flex justify-between items-baseline text-gray-900 border-t border-gray-200 pt-3">
                <div>
                  <span className="text-base sm:text-lg font-black">Total Amount</span>
                  <span className="block text-[10px] text-gray-400">Inclusive of all taxes</span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-gray-900">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Checkout Button */}
            <button
              onClick={handleCheckout}
              className="hidden md:flex w-full mt-6 py-3.5 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-base items-center justify-center gap-2 shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            {/* Guarantee trust note */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-green-600" />
              <span>100% Authentic Homemade Andhra Pickles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Floating Bottom Checkout Bar (Optimized for Small Screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-medium">
            Total Payable
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-gray-900">
              ₹{total.toFixed(2)}
            </span>
            {discount > 0 && (
              <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                Saved ₹{discount.toFixed(0)}
              </span>
            )}
          </div>
          {festiveStatus.isUnlocked && (
            <span className="text-[10px] text-amber-700 font-bold block">
              🎁 +{festiveStatus.eligibleCount} Free Gift{festiveStatus.eligibleCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <button
          onClick={handleCheckout}
          className="flex-1 max-w-[210px] py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Coupon Selection Modal (Mobile & Desktop) */}
      <CouponSelectionModal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        subtotal={subtotal}
        appliedCoupon={appliedCoupon}
        coupons={coupons}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={removeCoupon}
        referralCode={storedRefCode || undefined}
        appliedReferralCode={appliedReferralCode}
        onRemoveReferralCode={removeReferralCode}
      />

      {/* Festive Welcome Modal */}
      {showFestiveModal && (
        <FestiveWelcomeModal
          isOpen={showFestiveModal}
          onClose={() => setShowFestiveModal(false)}
        />
      )}
    </div>
  );
}
