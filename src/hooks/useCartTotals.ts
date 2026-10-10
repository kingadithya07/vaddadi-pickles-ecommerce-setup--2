import { useStore } from '../store';
import { REFERRAL_DISCOUNT_PERCENT, isReferralDiscountValid } from '../data/festiveOffer';

export function useCartTotals() {
    const cart = useStore((state) => state.cart);
    const appliedCoupon = useStore((state) => state.appliedCoupon);
    const appliedReferralCode = useStore((state) => state.appliedReferralCode);

    const subtotal = cart.reduce((sum, item) => sum + (item?.variant?.price ?? 0) * (item?.quantity ?? 1), 0);

    // 1. Regular coupon discount
    let couponDiscount = 0;
    if (appliedCoupon) {
        couponDiscount = appliedCoupon.type === 'percentage'
            ? (subtotal * appliedCoupon.discount) / 100
            : appliedCoupon.discount;
    }

    // 2. Referral partner discount (0.5%, valid till 21st October only)
    let referralDiscount = 0;
    const isRefDiscountActive = Boolean(appliedReferralCode) && isReferralDiscountValid();
    if (isRefDiscountActive) {
        referralDiscount = (subtotal * REFERRAL_DISCOUNT_PERCENT) / 100;
    }

    const discount = couponDiscount + referralDiscount;
    const shipping = subtotal >= 1000 ? 0 : 50;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const totalRaw = discountedSubtotal + shipping;
    const total = Math.round(totalRaw * 100) / 100;

    return {
        subtotal,
        discount,
        couponDiscount,
        referralDiscount,
        isRefDiscountActive,
        appliedReferralCode,
        appliedCoupon,
        shipping,
        total,
        displayAmount: total.toFixed(2),
        displayAmountWhole: Math.round(total)
    };
}

