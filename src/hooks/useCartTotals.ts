import { useStore } from '../store';

export function useCartTotals() {
    const cart = useStore((state) => state.cart);
    const appliedCoupon = useStore((state) => state.appliedCoupon);

    const subtotal = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

    let discount = 0;
    if (appliedCoupon) {
        discount = appliedCoupon.type === 'percentage'
            ? (subtotal * appliedCoupon.discount) / 100
            : appliedCoupon.discount;
    }

    const shipping = subtotal >= 1000 ? 0 : 50;
    const totalRaw = subtotal - discount + shipping;
    const total = Math.round(totalRaw * 100) / 100;

    return {
        subtotal,
        discount,
        shipping,
        total,
        displayAmount: total.toFixed(2),
        displayAmountWhole: Math.round(total)
    };
}
