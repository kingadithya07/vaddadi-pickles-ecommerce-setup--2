import { useState } from 'react';
import { X, Tag, Check, Sparkles, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Coupon } from '@/types';
import toast from 'react-hot-toast';
import { isReferralDiscountValid, REFERRAL_DISCOUNT_PERCENT, REFERRAL_DISCOUNT_EXPIRY_LABEL } from '@/data/festiveOffer';

interface CouponSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  appliedCoupon: Coupon | null;
  coupons: Coupon[];
  onApplyCoupon: (code: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  onRemoveCoupon: () => void;
  referralCode?: string;
  appliedReferralCode?: string | null;
  onRemoveReferralCode?: () => void;
}

export function CouponSelectionModal({
  isOpen,
  onClose,
  subtotal,
  appliedCoupon,
  coupons,
  onApplyCoupon,
  onRemoveCoupon,
  referralCode,
  appliedReferralCode,
  onRemoveReferralCode,
}: CouponSelectionModalProps) {
  const [inputCode, setInputCode] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const storedRef = referralCode || (typeof window !== 'undefined' ? localStorage.getItem('affiliate_ref') : null);
  const activeCoupons = coupons.filter((c) => c.active);
  const isReferralActive = isReferralDiscountValid();

  const handleManualApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const codeToApply = inputCode.trim().toUpperCase();
    if (!codeToApply) {
      setInputError('Please enter a coupon code or referral code');
      return;
    }

    try {
      setIsApplying(true);
      const result = await onApplyCoupon(codeToApply);
      if (result.success) {
        toast.success(result.message);
        setInputCode('');
        onClose();
      } else {
        setInputError(result.message);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleSelectCoupon = async (code: string) => {
    try {
      setIsApplying(true);
      const result = await onApplyCoupon(code);
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = () => {
    onRemoveCoupon();
    toast.success('Coupon removed');
  };

  const handleRemoveReferral = () => {
    if (onRemoveReferralCode) {
      onRemoveReferralCode();
    } else {
      localStorage.removeItem('affiliate_ref');
    }
    toast.success('Referral code removed');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center shadow-sm">
              <Tag size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                Coupons & Festive Offers
              </h3>
              <p className="text-xs text-gray-500">
                Cart Subtotal: <strong className="text-gray-800">₹{subtotal.toFixed(0)}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition"
            aria-label="Close coupons modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Manual Input Field */}
          <form onSubmit={handleManualApply} className="space-y-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter coupon or affiliate referral code"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value.toUpperCase());
                    if (inputError) setInputError(null);
                  }}
                  className="w-full uppercase font-mono px-4 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-gray-50/50"
                />
              </div>
              <button
                type="submit"
                disabled={isApplying}
                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isApplying ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {inputError && (
              <p className="text-xs text-red-600 flex items-center gap-1 font-medium pl-1">
                <AlertCircle size={12} /> {inputError}
              </p>
            )}
          </form>

          {/* Stacking Offer Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
            <span className="text-base shrink-0">✨</span>
            <div className="flex-1">
              <p className="font-bold text-blue-900">
                Festive Double Offer: Referral + Coupon Stacking!
              </p>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Apply a partner referral code to enjoy a <strong className="text-blue-950">{REFERRAL_DISCOUNT_PERCENT}% discount</strong> (eligible till {REFERRAL_DISCOUNT_EXPIRY_LABEL} only) <strong className="text-blue-950">AND</strong> apply any normal coupon below as usual!
              </p>
            </div>
          </div>

          {/* Applied Partner Referral Code Card (if any) */}
          {appliedReferralCode && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs text-base">
                  🤝
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-extrabold text-amber-950 text-sm sm:text-base">
                      {appliedReferralCode}
                    </span>
                    <span className="text-[10px] bg-yellow-400 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase">
                      {REFERRAL_DISCOUNT_PERCENT}% Partner Off
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 font-medium">
                    {isReferralActive
                      ? `${REFERRAL_DISCOUNT_PERCENT}% Referral Discount applied (Eligible till ${REFERRAL_DISCOUNT_EXPIRY_LABEL})`
                      : `Referral linked (${REFERRAL_DISCOUNT_PERCENT}% discount eligible till ${REFERRAL_DISCOUNT_EXPIRY_LABEL} only)`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveReferral}
                className="text-xs font-bold text-red-600 hover:text-red-800 bg-white hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          {/* Applied Normal Coupon Card (if any) */}
          {appliedCoupon && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xs">
                  <Check size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-extrabold text-green-900 text-sm sm:text-base">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[10px] bg-green-200 text-green-900 font-black px-2 py-0.5 rounded-full uppercase">
                      Coupon Applied
                    </span>
                  </div>
                  <p className="text-xs text-green-700 font-medium">
                    Saving {appliedCoupon.type === 'percentage' ? `${appliedCoupon.discount}%` : `₹${appliedCoupon.discount}`} on this order!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-bold text-red-600 hover:text-red-800 bg-white hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          {/* Featured Festive Referral Partner Coupon (if came through referral link or code saved) */}
          {storedRef && !appliedReferralCode && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-yellow-400 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🪔</span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                    Festive Referral Partner Code
                  </span>
                </div>
                <span className="text-[10px] bg-yellow-400 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase">
                  {isReferralActive ? `${REFERRAL_DISCOUNT_PERCENT}% Off till ${REFERRAL_DISCOUNT_EXPIRY_LABEL}` : 'Partner Link'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-yellow-200/90 text-amber-950 border border-yellow-400">
                      {storedRef.toUpperCase()}
                    </span>
                    <span className="text-xs font-black text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                      {REFERRAL_DISCOUNT_PERCENT}% OFF
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 font-medium">
                    {isReferralActive
                      ? `Claim ${REFERRAL_DISCOUNT_PERCENT}% referral discount! You can also apply normal coupons as usual.`
                      : `Affiliate referral code linked. (${REFERRAL_DISCOUNT_PERCENT}% discount eligible till ${REFERRAL_DISCOUNT_EXPIRY_LABEL} only).`}
                  </p>
                </div>

                <div className="shrink-0 sm:self-center">
                  <button
                    type="button"
                    disabled={isApplying}
                    onClick={() => handleSelectCoupon(storedRef.toUpperCase())}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Claim {REFERRAL_DISCOUNT_PERCENT}% Discount</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Standard Available Coupons List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Available Coupons ({activeCoupons.length})
              </h4>
              <span className="text-[11px] text-gray-500">Tap to apply</span>
            </div>

            {activeCoupons.length === 0 && !storedRef ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <ShoppingBag className="mx-auto text-gray-300 mb-2" size={36} />
                <p className="text-xs sm:text-sm text-gray-600 font-medium">No coupons active right now.</p>
                <p className="text-xs text-gray-400 mt-0.5">Check back soon for festive discount codes!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCoupons.map((coupon) => {
                  const isApplied = appliedCoupon?.code === coupon.code;
                  const isEligible = subtotal >= coupon.minOrder;
                  const amountNeeded = coupon.minOrder - subtotal;
                  const discountDisplay = coupon.type === 'fixed' ? `₹${coupon.discount}` : `${coupon.discount}%`;
                  
                  const estimatedSaving = coupon.type === 'fixed'
                    ? coupon.discount
                    : Math.round((subtotal * coupon.discount) / 100);

                  return (
                    <div
                      key={coupon.code}
                      className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isApplied
                          ? 'border-green-500 bg-green-50/70 shadow-sm'
                          : isEligible
                          ? 'border-gray-200 hover:border-green-400 bg-white hover:shadow-md'
                          : 'border-gray-200/80 bg-gray-50/70 opacity-80'
                      }`}
                    >
                      {/* Left: Code badge and description */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg border tracking-wider ${
                            isEligible
                              ? 'bg-amber-50 border-amber-300 text-amber-950'
                              : 'bg-gray-100 border-gray-200 text-gray-600'
                          }`}>
                            {coupon.code}
                          </span>
                          <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            Save {discountDisplay}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 font-medium">
                          {coupon.minOrder > 0
                            ? `Valid on minimum order value of ₹${coupon.minOrder}`
                            : 'Valid on all order values'}
                        </p>

                        {!isEligible ? (
                          <div className="pt-1">
                            <p className="text-[11px] text-orange-600 font-bold">
                              Add ₹{amountNeeded.toFixed(0)} more to unlock this offer
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className="bg-orange-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (subtotal / coupon.minOrder) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                            <span>✨</span> Saves approx. ₹{estimatedSaving} on your order!
                          </p>
                        )}
                      </div>

                      {/* Right: Apply / Applied action button */}
                      <div className="sm:self-center shrink-0">
                        {isApplied ? (
                          <button
                            type="button"
                            onClick={handleRemove}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-red-600 border border-gray-200 text-xs font-bold transition"
                          >
                            Remove
                          </button>
                        ) : isEligible ? (
                          <button
                            type="button"
                            disabled={isApplying}
                            onClick={() => handleSelectCoupon(coupon.code)}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-black shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <span>Apply</span>
                            <ArrowRight size={14} />
                          </button>
                        ) : (
                          <span className="inline-block text-center w-full sm:w-auto px-3 py-1.5 rounded-lg bg-gray-200/80 text-gray-500 text-[11px] font-bold">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
          Affiliate referral codes and festive coupons are active till the end of the festival season (Dussehra & Diwali)!
        </div>
      </div>
    </div>
  );
}
