import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Banknote, Smartphone, MapPin, User, Phone, Mail, QrCode, ExternalLink, Copy, Check, Wallet, HelpCircle, X, Edit2, ChevronDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/store';
import { Order, Address, UserAddress } from '@/types';
import { statesAndCities } from '@/data/locations';

import { useCartTotals } from '@/hooks';
import { lookupPincode, PostOfficeBranch } from '@/utils';
import { sendTelegramNotification } from '@/lib';
import { formatPhoneNumber } from '@/utils';
import toast from 'react-hot-toast';
import { supabase } from '@/lib';
import { FestiveGiftSelector, SelectedFreeGift } from '@/components';
import { getFestiveTierStatus } from '@/data/festiveOffer';

export function Checkout() {
  const { cart, user, isAdmin, appliedCoupon, createOrder, clearCart, settings, addUserAddress, updateUserAddress } = useStore();
  const navigate = useNavigate();
  const { subtotal, discount, total, shipping, displayAmount, displayAmountWhole } = useCartTotals();

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const [adminAdditionalAmount, setAdminAdditionalAmount] = useState<number>(0);
  const [adminAdditionalWeight, setAdminAdditionalWeight] = useState<number>(0);
  const [selectedFreeGifts, setSelectedFreeGifts] = useState<SelectedFreeGift[]>([]);
  const [showMobileOrderSummary, setShowMobileOrderSummary] = useState(false);

  const cartWeightGrams = useMemo(() => {
    return cart.reduce((totalGrams, item) => {
      let w = 0;
      const weightStr = item.variant?.weight?.toLowerCase() || '250g';
      if (weightStr.includes('kg')) {
        w = parseFloat(weightStr) * 1000;
      } else if (weightStr.includes('g')) {
        w = parseFloat(weightStr);
      } else {
        w = 250;
      }
      return totalGrams + (w * item.quantity);
    }, 0);
  }, [cart]);

  const giftsWeightGrams = useMemo(() => {
    return selectedFreeGifts.reduce((acc, g) => {
      const w = g.weight.toLowerCase();
      if (w.includes('100g')) return acc + 100;
      if (w.includes('50g')) return acc + 50;
      return acc + 100;
    }, 0);
  }, [selectedFreeGifts]);

  // Track timeouts to prevent state updates on unmounted components
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Address selection state
  const userAddresses = user?.addresses || [];
  const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddress?.id || 'new');
  const [useNewAddress, setUseNewAddress] = useState(!defaultAddress);
  const [editingSavedAddress, setEditingSavedAddress] = useState<UserAddress | null>(null);
  const [newAddress, setNewAddress] = useState<Address & { street2?: string }>(user?.address ? {
    ...user.address,
    street: user.address.street.split(',')[0]?.trim() || '',
    street2: user.address.street.split(',').slice(1).join(',').trim() || ''
  } : {
    street: '',
    street2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [isManualCity, setIsManualCity] = useState(() => {
    const city = user?.address?.city;
    const state = user?.address?.state;
    if (!city || !state) return false;
    const hasCities = statesAndCities[state];
    return !hasCities || !hasCities.includes(city);
  });
  const [deliveryName, setDeliveryName] = useState(user?.name || '');
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || '');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [pincodeBranches, setPincodeBranches] = useState<PostOfficeBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [savedAddrBranch, setSavedAddrBranch] = useState<Record<string, string>>({});
  const [addrBranches, setAddrBranches] = useState<Record<string, PostOfficeBranch[]>>({});
  const [isCustomBranch, setIsCustomBranch] = useState(false);
  const [customBranchName, setCustomBranchName] = useState('');

  const lastLookedUpPinRef = useRef<string>(user?.address?.pincode || '');

  const handleEditSavedAddress = (addr: UserAddress) => {
    const hasCities = statesAndCities[addr.state];
    const isManual = !hasCities || !hasCities.includes(addr.city);
    const parts = addr.street.split(',');

    lastLookedUpPinRef.current = addr.pincode;
    setEditingSavedAddress(addr);
    setSelectedAddressId(addr.id);
    setDeliveryName(addr.name);
    setDeliveryPhone(addr.phone);
    setNewAddress({
      street: parts[0]?.trim() || '',
      street2: parts.slice(1).join(',').trim() || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || 'India',
      postOffice: addr.postOffice,
    });
    setSelectedBranch(addr.postOffice || '');
    setIsManualCity(isManual);
    setUseNewAddress(true);
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
      setShowQR(!isMobileDevice); // Show QR on desktop, hide on mobile by default
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle pincode change for auto-fill
  useEffect(() => {
    const fetchLocation = async () => {
      const pin = newAddress.pincode.trim();
      if (pin.length === 6) {
        if (pin === lastLookedUpPinRef.current && newAddress.state && newAddress.city) {
          return;
        }

        const info = await lookupPincode(pin);
        if (info) {
          lastLookedUpPinRef.current = pin;

          // Match state name against available keys in statesAndCities (case-insensitive & handle '&' vs 'and')
          const stateMatch = Object.keys(statesAndCities).find(s =>
            s.toLowerCase() === info.state.trim().toLowerCase() ||
            s.toLowerCase().replace(/&/g, 'and') === info.state.trim().toLowerCase().replace(/&/g, 'and')
          ) || info.state.trim();

          // Match city name in that state's list
          const citiesInState = statesAndCities[stateMatch] || [];
          const cityMatch = citiesInState.find(c =>
            c.toLowerCase() === info.city.trim().toLowerCase()
          ) || info.city.trim();

          const isManual = !citiesInState.some(c => c.toLowerCase() === cityMatch.toLowerCase());
          setIsManualCity(isManual);

          setPincodeBranches(info.branches || []);
          const chosenBranch = info.branches && info.branches.length === 1 ? info.branches[0].name : '';
          setSelectedBranch(chosenBranch);

          setNewAddress(prev => ({
            ...prev,
            state: stateMatch,
            city: cityMatch,
            country: info.country || 'India',
            postOffice: chosenBranch
          }));
        }
      } else {
        lastLookedUpPinRef.current = '';
        setPincodeBranches([]);
        setSelectedBranch('');
      }
    };
    fetchLocation();
  }, [newAddress.pincode]);

  // Pre-load branches for selected saved address
  useEffect(() => {
    if (!useNewAddress && selectedAddressId && selectedAddressId !== 'new') {
      const addr = userAddresses.find(a => a.id === selectedAddressId);
      if (addr && addr.pincode && addr.pincode.length === 6 && !addrBranches[addr.id]) {
        lookupPincode(addr.pincode).then(info => {
          if (info && info.branches) {
            setAddrBranches(prev => ({ ...prev, [addr.id]: info.branches }));
            if (!savedAddrBranch[addr.id]) {
              const defaultB = addr.postOffice || (info.branches.length === 1 ? info.branches[0].name : '');
              setSavedAddrBranch(prev => ({ ...prev, [addr.id]: defaultB }));
            }
          }
        }).catch(() => {});
      }
    }
  }, [selectedAddressId, useNewAddress, userAddresses]);

  // UPI Payment details
  const upiId = settings.upiId;
  const merchantName = settings.businessAddress.name;
  const orderId = useMemo(() => `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, []);

  // IMPORTANT: Use exact same amount format for QR code and display
  // UPI spec requires amount with 2 decimal places
  const finalOrderTotal = total + (isAdmin ? Number(adminAdditionalAmount) || 0 : 0);
  const paymentAmount = finalOrderTotal.toFixed(2);

  // Generate UPI payment URL for QR code and deep links
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}&tr=${orderId}`;

  // App-specific deep links - using same paymentAmount for consistency
  const gpayUrl = `gpay://upi/pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
  const phonepeUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
  const paytmUrl = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    const t = setTimeout(() => setCopied(false), 2000);
    timeoutsRef.current.push(t);
  };

  const openPaymentApp = (appUrl: string, fallbackUrl: string) => {
    const startTime = Date.now();
    window.location.href = appUrl;

    // If app doesn't open within 2 seconds, try fallback
    const t2 = setTimeout(() => {
      if (Date.now() - startTime < 2500) {
        window.location.href = fallbackUrl;
      }
    }, 2000);
    timeoutsRef.current.push(t2);
  };

  const handlePlaceOrder = async () => {
    if (!user) return toast.error('You must be logged in to place an order.');
    if (paymentMethod !== 'cod') {
      if (!transactionId) {
        toast.error('Please enter transaction ID');
        return;
      }
      if (!/^[A-Za-z0-9]{12,22}$/.test(transactionId)) {
        toast.error('Transaction ID (UTR) must be between 12 and 22 characters');
        return;
      }
    }

    // Get the selected address
    let finalAddress: Address;
    let finalName: string;
    let finalPhone: string;

    if (useNewAddress || selectedAddressId === 'new') {
      if (!newAddress.pincode) {
        toast.error('Please enter your pincode for delivery.');
        return;
      }
      if (newAddress.pincode.length !== 6) {
        toast.error('Please enter a valid 6-digit pincode.');
        return;
      }
      if (!deliveryName || !deliveryPhone || !newAddress.street || !newAddress.city || !newAddress.state) {
        toast.error('Please fill all delivery address fields');
        return;
      }
      
      finalAddress = { 
        ...newAddress, 
        street: newAddress.street2 ? `${newAddress.street.trim()}, ${newAddress.street2.trim()}` : newAddress.street.trim(),
        postOffice: (isCustomBranch ? customBranchName.trim() : selectedBranch) || newAddress.postOffice || undefined,
        isOffline: isAdmin,
        adminAdditionalAmount: isAdmin ? (Number(adminAdditionalAmount) || 0) : 0,
        adminAdditionalWeight: isAdmin ? (Number(adminAdditionalWeight) || 0) : 0
      };
      finalName = deliveryName;
      finalPhone = formatPhoneNumber(deliveryPhone);

      // Auto-save the new address or update the existing address in profile
      if (editingSavedAddress) {
        updateUserAddress({
          id: editingSavedAddress.id,
          label: editingSavedAddress.label,
          name: finalName,
          phone: finalPhone,
          street: finalAddress.street,
          city: finalAddress.city,
          state: finalAddress.state,
          pincode: finalAddress.pincode,
          country: finalAddress.country || 'India',
          postOffice: finalAddress.postOffice,
          isDefault: editingSavedAddress.isDefault,
        });
      } else {
        addUserAddress({
          id: `addr-${Date.now()}`,
          label: 'Other',
          name: finalName,
          phone: finalPhone,
          street: finalAddress.street,
          city: finalAddress.city,
          state: finalAddress.state,
          pincode: finalAddress.pincode,
          country: finalAddress.country || 'India',
          postOffice: finalAddress.postOffice,
          isDefault: userAddresses.length === 0, // Make it default if it's their first address
        });
      }
    } else {
      const selectedAddr = userAddresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddr) {
        toast.error('Please select a valid address');
        return;
      }
      finalAddress = {
        street: selectedAddr.street,
        city: selectedAddr.city,
        state: selectedAddr.state,
        pincode: selectedAddr.pincode,
        country: selectedAddr.country,
        postOffice: savedAddrBranch[selectedAddr.id] || selectedAddr.postOffice || undefined,
        isOffline: isAdmin,
        adminAdditionalAmount: isAdmin ? (Number(adminAdditionalAmount) || 0) : 0,
        adminAdditionalWeight: isAdmin ? (Number(adminAdditionalWeight) || 0) : 0
      };
      finalName = selectedAddr.name;
      finalPhone = formatPhoneNumber(selectedAddr.phone);
    }

    let validatedAffiliateCode = undefined;
    const rawAffiliateCode = localStorage.getItem('affiliate_ref');
    if (rawAffiliateCode) {
      try {
        const { data, error } = await supabase
          .from('affiliates')
          .select('status, user_id')
          .eq('referral_code', rawAffiliateCode)
          .single();
        if (!error && data && data.status === 'active' && data.user_id !== user.id) {
          validatedAffiliateCode = rawAffiliateCode;
        } else {
          localStorage.removeItem('affiliate_ref');
        }
      } catch (err) {
        console.error('Affiliate validation error', err);
      }
    }

    // Check if customer qualifies for free gifts but hasn't picked any
    const tierStatus = getFestiveTierStatus(subtotal);
    if (tierStatus.eligibleCount > 0 && selectedFreeGifts.length === 0) {
      const chooseGiftsNow = window.confirm(
        `🪔 Dussehra/Durga Pooja And Diwali/Deepavali Offer: You are eligible to choose ${tierStatus.eligibleCount} FREE Festive Gift${tierStatus.eligibleCount > 1 ? 's' : ''}! Would you like to pick your free gift(s) before placing order? Click OK to pick your gifts now, or Cancel to proceed without them.`
      );
      if (chooseGiftsNow) {
        const giftSection = document.getElementById('festive-gift-selector');
        if (giftSection) giftSection.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    const freeGiftCartItems = selectedFreeGifts.map((gift) => ({
      product: {
        id: gift.id,
        name: `${gift.name} (Festive Gift)`,
        description: `Dussehra/Durga Pooja And Diwali/Deepavali Free Festive Gift (${gift.weight})`,
        image: gift.image,
        category: gift.category,
        variants: [{ weight: gift.weight, price: 0, mrp: 0, stock: 999 }],
        inStock: true,
        rating: 5,
        reviews: 0,
      },
      variant: {
        weight: gift.weight,
        price: 0,
        mrp: 0,
        stock: 999,
      },
      quantity: 1,
      noGarlic: gift.noGarlic,
      isFreeGift: true,
      freeGiftOffer: 'Dussehra/Durga Pooja And Diwali/Deepavali',
    }));

    const finalOrderItems = [...cart, ...freeGiftCartItems];

    const order: Order = {
      id: orderId,
      userId: user.id,
      userName: finalName,
      userEmail: user.email,
      userPhone: finalPhone,
      items: finalOrderItems,
      freeGifts: freeGiftCartItems,
      total: subtotal,
      discount,
      finalAmount: finalOrderTotal,
      couponCode: appliedCoupon?.code,
      affiliateCode: validatedAffiliateCode,
      address: finalAddress,
      adminAdditionalAmount: isAdmin ? (Number(adminAdditionalAmount) || 0) : 0,
      adminAdditionalWeight: isAdmin ? (Number(adminAdditionalWeight) || 0) : 0,
      status: 'payment_pending',
      paymentStatus: 'awaiting_approval',
      paymentMethod,
      transactionId: paymentMethod === 'cod' ? 'COD' : transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await createOrder(order);
      // Fire and forget Telegram notification
      sendTelegramNotification(order).catch(console.error);
      clearCart();
      navigate('/order-success', { state: { orderId: order.id } });
    } catch (error: any) {
      toast.error(`Failed to place order. Error: ${error?.message || JSON.stringify(error)}`);
      console.error(error);
    }
  };

  if (!user) {
    navigate('/login', { state: { redirect: '/checkout' } });
    return null;
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-32 md:pb-12">
      {/* Top Navigation & Stepper Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <Link
            to="/cart"
            className="text-xs sm:text-sm font-bold text-gray-500 hover:text-green-700 flex items-center gap-1 transition"
          >
            <span>← Back to Cart</span>
          </Link>
          <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 flex items-center gap-1">
            <ShieldCheck size={13} />
            <span>256-bit Secure Checkout</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>

        {/* 3-Step Checkout Flow Indicator for Mobile & Desktop */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="p-2 rounded-xl bg-green-50 border border-green-300 text-green-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
            <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
            <span className="truncate">Address</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
            <span className="truncate">Free Gifts 🎁</span>
          </div>
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-300 text-blue-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
            <span className="truncate">Payment</span>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Quick Order Summary Strip */}
      <div className="lg:hidden mb-6 bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowMobileOrderSummary(!showMobileOrderSummary)}
          className="w-full p-4 flex items-center justify-between text-left transition hover:bg-gray-50 active:bg-gray-100"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold text-sm">
              🛒
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                Order Total: <span className="text-green-700 font-extrabold text-sm">₹{displayAmount}</span>
              </p>
              <p className="text-[11px] text-gray-500">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items {selectedFreeGifts.length > 0 && `• ${selectedFreeGifts.length} Free Gifts Included`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-green-700">
            <span>{showMobileOrderSummary ? 'Hide Items' : 'View Items'}</span>
            <ChevronDown size={15} className={`transition-transform duration-200 ${showMobileOrderSummary ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showMobileOrderSummary && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/60 space-y-3">
            {/* Items Mini List */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.variant.weight}${item.noGarlic ? '-nogarlic' : ''}`} className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <img src={item.product.image} alt={item.product.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-200" />
                    <span className="truncate text-gray-800 font-medium">{item.product.name} ({item.variant.weight} × {item.quantity})</span>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">₹{item.variant.price * item.quantity}</span>
                </div>
              ))}
              {selectedFreeGifts.map((gift) => (
                <div key={gift.id} className="flex items-center justify-between text-xs gap-2 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                  <span className="truncate text-amber-950 font-medium">🎁 {gift.name} ({gift.weight})</span>
                  <span className="font-bold text-green-700 shrink-0">FREE (₹0)</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 text-xs space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Discount:</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}.00`}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Left Column */}
        <div className="space-y-5 sm:space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User size={18} className="text-green-600" /> Customer Information
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-gray-600">
              <p className="flex items-center gap-2"><User size={15} className="text-gray-400" /> {user.name}</p>
              <p className="flex items-center gap-2"><Mail size={15} className="text-gray-400" /> {user.email}</p>
              <p className="flex items-center gap-2"><Phone size={15} className="text-gray-400" /> {formatPhoneNumber(user.phone)}</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-green-600" /> Delivery Address
            </h2>

            {/* Saved Addresses Selection */}
            {userAddresses.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-xs sm:text-sm text-gray-600 font-semibold">Select a saved address:</p>
                {userAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3.5 sm:p-4 border-2 rounded-xl cursor-pointer transition active:scale-[0.99] ${selectedAddressId === addr.id && !useNewAddress
                      ? 'border-green-500 bg-green-50/60 shadow-xs'
                      : 'border-gray-200 hover:border-green-300 bg-white'
                      }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id && !useNewAddress}
                      onChange={() => {
                        setSelectedAddressId(addr.id);
                        setUseNewAddress(false);
                      }}
                      className="mt-1 text-green-600 w-4 h-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 text-sm sm:text-base">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full">
                            Default
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditSavedAddress(addr);
                          }}
                          className="ml-auto p-1 px-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1 text-xs font-semibold"
                          title="Edit this address"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      </div>
                      <p className="text-gray-800 font-medium text-xs sm:text-sm">{addr.name}</p>
                      <p className="text-gray-600 text-xs sm:text-sm">{formatPhoneNumber(addr.phone)}</p>
                      <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
                        {addr.street}, {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                        {(savedAddrBranch[addr.id] || addr.postOffice) && (
                          <span className="font-semibold text-green-700 ml-1">
                            ({savedAddrBranch[addr.id] || addr.postOffice})
                          </span>
                        )}
                      </p>
                      {selectedAddressId === addr.id && !useNewAddress && addrBranches[addr.id] && addrBranches[addr.id].length > 1 && (
                        <div className="mt-3 pt-2.5 border-t border-green-200" onClick={(e) => e.stopPropagation()}>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Select Local Post Office Branch:
                          </label>
                          <select
                            value={savedAddrBranch[addr.id] || addr.postOffice || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSavedAddrBranch(prev => ({ ...prev, [addr.id]: val }));
                            }}
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
                          >
                            <option value="">Select Local Branch</option>
                            {addrBranches[addr.id].map((b, idx) => (
                              <option key={idx} value={b.name}>{b.name} ({b.branchType})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Use New Address Option */}
            <label
              className={`flex items-start gap-3 p-3.5 sm:p-4 border-2 rounded-xl cursor-pointer transition mb-4 active:scale-[0.99] ${useNewAddress
                ? 'border-green-500 bg-green-50/60 shadow-xs'
                : 'border-gray-200 hover:border-green-300 bg-white'
                }`}
            >
              <input
                type="radio"
                name="address"
                checked={useNewAddress}
                onChange={() => setUseNewAddress(true)}
                className="mt-1 text-green-600 w-4 h-4 shrink-0"
              />
              <div className="flex-1">
                <span className="font-bold text-gray-800 text-sm sm:text-base">Use a different address</span>
                <p className="text-xs text-gray-500">Enter delivery details below</p>
              </div>
            </label>

            {/* New Address Form */}
            {useNewAddress && (
              <div className="space-y-3.5 sm:space-y-4 p-3.5 sm:p-4 bg-gray-50/70 border border-gray-200/80 rounded-xl">
                {editingSavedAddress && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-xs sm:text-sm">
                    <span>Editing Saved Address: <strong>{editingSavedAddress.label}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSavedAddress(null);
                        setUseNewAddress(false);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      Cancel Edit
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={deliveryName}
                      onChange={(e) => setDeliveryName(e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    maxLength={40}
                    placeholder="Line 1: Door No / Flat No / Street"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
                  />
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="Line 2: Area / Landmark / Remaining Address (Optional)"
                    value={newAddress.street2 || ''}
                    onChange={(e) => setNewAddress({ ...newAddress, street2: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="6-digit pincode"
                      value={newAddress.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setNewAddress({ ...newAddress, pincode: val });
                      }}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      placeholder="Country"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City</label>
                    {isManualCity ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter City Name"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualCity(false);
                            setNewAddress({ ...newAddress, city: '' });
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap px-2"
                        >
                          Select from list
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={newAddress.city}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Other') {
                              setIsManualCity(true);
                              setNewAddress({ ...newAddress, city: '' });
                            } else {
                              setIsManualCity(false);
                              setNewAddress({ ...newAddress, city: val });
                            }
                          }}
                          disabled={!newAddress.state}
                          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="">Select City</option>
                          {newAddress.state && statesAndCities[newAddress.state]?.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                          <option value="Other">Other (Enter Manually)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">State</label>
                    <div className="relative">
                      <select
                        value={newAddress.state}
                        onChange={(e) => {
                          setNewAddress({ ...newAddress, state: e.target.value, city: '' });
                          setIsManualCity(false);
                        }}
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                      >
                        <option value="">Select State</option>
                        {Object.keys(statesAndCities).sort().map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                {pincodeBranches.length > 0 && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Select Post Office Branch</label>
                    <select
                      value={isCustomBranch ? 'custom' : (selectedBranch || newAddress.postOffice || '')}
                      onChange={(e) => {
                        const branchName = e.target.value;
                        if (branchName === 'custom') {
                          setIsCustomBranch(true);
                        } else {
                          setIsCustomBranch(false);
                          setSelectedBranch(branchName);
                          setNewAddress(prev => ({ ...prev, postOffice: branchName }));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
                    >
                      <option value="">Select Local Branch</option>
                      {pincodeBranches.map((branch, index) => (
                        <option key={index} value={branch.name}>
                          {branch.name} ({branch.branchType})
                        </option>
                      ))}
                      <option value="custom">Other (Enter Manually)</option>
                    </select>
                    {isCustomBranch && (
                      <input
                        type="text"
                        placeholder="Enter local post office branch name"
                        value={customBranchName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomBranchName(val);
                          setSelectedBranch(val);
                          setNewAddress(prev => ({ ...prev, postOffice: val }));
                        }}
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white mt-2 text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dussehra & Durga Pooja Free Gift Selector */}
          <div id="festive-gift-selector">
            <FestiveGiftSelector
              subtotal={subtotal}
              selectedGifts={selectedFreeGifts}
              onChange={setSelectedFreeGifts}
              mode="checkout"
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Smartphone size={20} className="text-green-600" /> Payment Method
            </h2>
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {[
                { id: 'upi', label: 'UPI Payment', icon: Smartphone, desc: 'GPay / PhonePe / Paytm / Any UPI App', recommended: true },
                ...(settings.enableBankTransfer ? [{ id: 'bank', label: 'Bank Transfer', icon: Banknote, desc: 'NEFT / IMPS / RTGS' }] : []),
                ...(settings.enableCOD ? [{ id: 'cod', label: 'Cash on Delivery', icon: CreditCard, desc: 'Pay when you receive' }] : []),
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3.5 p-3.5 sm:p-4 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition active:scale-[0.99] ${paymentMethod === method.id ? 'border-green-500 bg-green-50/60 shadow-xs' : 'border-gray-200 hover:border-green-300 bg-white'
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-green-600 w-4 h-4 shrink-0"
                  />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === method.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    <method.icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{method.label}</p>
                      {method.recommended && (
                        <span className="text-[10px] bg-green-100 text-green-800 font-extrabold px-2 py-0.5 rounded-full">
                          FASTEST
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* UPI Payment Section */}
            {paymentMethod === 'upi' && (
              <div className="mt-5 sm:mt-6 space-y-4">
                {/* Amount Display - Shows exact amount that will be in QR code */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl sm:rounded-2xl text-center shadow-xs">
                  <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Amount to Pay</p>
                  <p className="text-3xl font-extrabold tracking-tight">₹{displayAmount}</p>
                  <p className="text-xs opacity-85 mt-0.5">This exact amount will appear in your payment app</p>
                </div>

                {/* Mobile: Show App Payment Buttons */}
                {isMobile ? (
                  <div className="space-y-3.5">
                    <p className="text-center text-xs sm:text-sm text-gray-700 font-semibold">
                      ⚡ Tap to pay instantly using UPI:
                    </p>

                    {/* Payment App Buttons */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => openPaymentApp(gpayUrl, upiUrl)}
                        className="flex flex-col items-center gap-1.5 p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl hover:border-blue-500 hover:bg-blue-50/40 active:scale-95 transition shadow-xs"
                      >
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center shadow-xs">
                          <span className="text-white font-bold text-base sm:text-lg">G</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-800">GPay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openPaymentApp(phonepeUrl, upiUrl)}
                        className="flex flex-col items-center gap-1.5 p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl hover:border-purple-500 hover:bg-purple-50/40 active:scale-95 transition shadow-xs"
                      >
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-xs">
                          <span className="text-white font-bold text-base sm:text-lg">Pe</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-800">PhonePe</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openPaymentApp(paytmUrl, upiUrl)}
                        className="flex flex-col items-center gap-1.5 p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl hover:border-blue-500 hover:bg-blue-50/40 active:scale-95 transition shadow-xs"
                      >
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-xs">
                          <span className="text-white font-bold text-base sm:text-lg">Pt</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-800">Paytm</span>
                      </button>
                    </div>

                    {/* Other UPI Apps Button */}
                    <a
                      href={upiUrl}
                      className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 bg-gray-100 text-gray-800 font-semibold text-xs sm:text-sm rounded-xl hover:bg-gray-200 active:scale-98 transition border border-gray-200"
                    >
                      <Wallet size={18} />
                      <span>Other UPI Apps (Cred, BHIM, etc.)</span>
                      <ExternalLink size={14} />
                    </a>

                    {/* Toggle QR Code on Mobile */}
                    <button
                      type="button"
                      onClick={() => setShowQR(!showQR)}
                      className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800"
                    >
                      <QrCode size={16} />
                      {showQR ? 'Hide QR Code' : 'Show QR Code for another device'}
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-xs sm:text-sm text-gray-600 font-medium">Scan QR code with any UPI app to pay</p>
                )}

                {/* QR Code Section */}
                {showQR && (
                  <div className="bg-white border-2 border-dashed border-green-300 rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col items-center">
                      {/* Amount Badge on QR */}
                      <div className="bg-green-100 text-green-800 px-3.5 py-1.5 rounded-full mb-3 text-xs sm:text-sm font-bold">
                        Pay Exactly: ₹{paymentAmount}
                      </div>
                      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border-2 border-green-200">
                        <QRCodeSVG
                          value={upiUrl}
                          size={190}
                          level="H"
                          includeMargin={true}
                          imageSettings={{
                            src: "/logo.png",
                            x: undefined,
                            y: undefined,
                            height: 38,
                            width: 38,
                            excavate: true,
                          }}
                        />
                      </div>
                      {/* Amount confirmation below QR */}
                      <div className="mt-3 text-center">
                        <p className="text-base sm:text-lg font-extrabold text-green-700">₹{paymentAmount}</p>
                        <p className="text-xs text-gray-500">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
                      </div>

                      {/* Supported Apps */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-[9px]">G</span>
                        </div>
                        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-[9px]">Pe</span>
                        </div>
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-[9px]">Pt</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">& all UPI apps</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI ID Display */}
                <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-3 sm:p-4">
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">Or pay manually to UPI ID:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded-lg border font-mono text-xs sm:text-sm text-green-700 font-bold truncate">
                      {upiId}
                    </code>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className={`p-2 rounded-lg transition shrink-0 ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                      title="Copy UPI ID"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {/* Transaction ID Input */}
                <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                        <span>⚠️</span> Step 2: Enter UPI UTR / Reference No.
                      </p>
                      <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5">
                        After paying, copy the 12-digit number from your UPI app receipt
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowUtrHelp(true)}
                      className="text-blue-700 hover:text-blue-900 flex items-center gap-1 text-[11px] sm:text-xs font-bold whitespace-nowrap bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs shrink-0"
                      type="button"
                    >
                      <HelpCircle size={13} /> Where to find?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 12-digit UPI REF / UTR"
                      value={transactionId}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setTransactionId(val);
                      }}
                      maxLength={12}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-base sm:text-lg tracking-wider font-mono font-bold border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white text-gray-900 placeholder:font-sans placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                    />
                    <div className="absolute right-3 top-2.5 sm:top-3 flex items-center gap-1.5">
                      {transactionId.length === 12 ? (
                        <span className="text-[11px] sm:text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check size={13} /> 12/12 Digits
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-medium text-gray-400">
                          {transactionId.length}/12
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-700 flex items-center gap-1">
                    <span>🛡️</span> Your order will be confirmed upon payment verification.
                  </p>
                </div>
              </div>
            )}

            {/* Bank Transfer Section */}
            {paymentMethod === 'bank' && (
              <div className="mt-5 sm:mt-6 space-y-4">
                {/* Amount Display - Shows exact amount */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl sm:rounded-2xl text-center shadow-xs">
                  <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">Amount to Pay</p>
                  <p className="text-3xl font-extrabold tracking-tight">₹{displayAmount}</p>
                  <p className="text-xs opacity-85 mt-0.5">Transfer this exact amount</p>
                </div>

                {/* Bank Details */}
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl sm:rounded-2xl p-4 space-y-3">
                  <h3 className="font-bold text-blue-900 text-sm sm:text-base">Bank Account Details</h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank Name:</span>
                      <span className="font-medium text-gray-900">State Bank of India</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium text-gray-900">Vaddadi Pickles</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-mono font-bold text-gray-900">1234567890123456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">IFSC Code:</span>
                      <span className="font-mono font-bold text-gray-900">SBIN0001234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Branch:</span>
                      <span className="font-medium text-gray-900">Hyderabad Main</span>
                    </div>
                  </div>
                </div>

                {/* QR Code for Bank */}
                <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-100 text-blue-800 px-3.5 py-1.5 rounded-full mb-3 text-xs sm:text-sm font-bold">
                      Pay Exactly: ₹{paymentAmount}
                    </div>
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border-2 border-blue-200">
                      <QRCodeSVG
                        value={upiUrl}
                        size={180}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: "/logo.png",
                          x: undefined,
                          y: undefined,
                          height: 36,
                          width: 36,
                          excavate: true,
                        }}
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-base sm:text-lg font-bold text-blue-700">₹{paymentAmount}</p>
                      <p className="text-xs text-gray-500">Scan to pay via UPI (faster)</p>
                    </div>
                  </div>
                </div>

                {/* Transaction ID Input for Bank */}
                <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-amber-950">
                        Step 2: Enter Transaction Reference / UTR
                      </p>
                      <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5">
                        After transferring, enter your bank UTR or Reference number below
                      </p>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Bank UTR / Reference (12 digits)"
                    value={transactionId}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setTransactionId(val);
                    }}
                    maxLength={12}
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white font-mono font-bold"
                  />
                  <p className="text-[11px] text-amber-700">
                    ⚠️ Your order will be processed after payment is verified
                  </p>
                </div>
              </div>
            )}

            {/* COD Section */}
            {paymentMethod === 'cod' && (
              <div className="mt-5 sm:mt-6">
                <div className="bg-orange-50 border border-orange-200 rounded-xl sm:rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="text-orange-600 mt-1 shrink-0" size={24} />
                    <div>
                      <h3 className="font-bold text-orange-900 text-sm sm:text-base">Cash on Delivery</h3>
                      <p className="text-xs sm:text-sm text-orange-800 mt-1">
                        Pay ₹{displayAmountWhole} when you receive your package.
                        Please keep exact cash ready.
                      </p>
                      <p className="text-[11px] text-orange-600 mt-2">
                        Note: COD orders will be verified via phone call before dispatch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6 sticky top-24">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-lg">🧾</span> Order Summary
            </h2>

            <div className="space-y-3.5 max-h-60 overflow-y-auto mb-4 pr-1">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.variant.weight}${item.noGarlic ? '-nogarlic' : ''}`} className="flex items-center gap-3">
                  <div className="w-11 h-11 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-2xl overflow-hidden text-center border border-gray-200/70">
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
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.variant.weight} × {item.quantity}
                      {item.noGarlic && <span className="ml-2 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">No Garlic</span>}
                    </p>
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-gray-900">₹{item.variant.price * item.quantity}</p>
                </div>
              ))}

              {/* Selected Festive Free Gifts */}
              {selectedFreeGifts.length > 0 && (
                <div className="border-t border-dashed border-amber-300 pt-3 pb-1 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span className="flex items-center gap-1">
                      <span>🎁</span> Dussehra & Diwali Free Gifts
                    </span>
                    <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-black">
                      {selectedFreeGifts.length} Included
                    </span>
                  </div>
                  {selectedFreeGifts.map((gift) => (
                    <div
                      key={gift.id}
                      className="flex items-center gap-2.5 bg-amber-50/70 p-2 rounded-xl border border-amber-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white overflow-hidden shrink-0 border border-amber-200">
                        <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-xs truncate">{gift.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {gift.weight} {gift.noGarlic && '• No Garlic'}
                        </p>
                      </div>
                      <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        FREE (₹0)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3.5 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}.00`}</span>
              </div>
              <div className="flex justify-between text-lg sm:text-xl font-black text-gray-900 border-t border-gray-100 pt-2.5">
                <span>Total Payable</span>
                <span className="text-green-700">₹{displayAmount}</span>
              </div>
              <p className="text-[11px] text-center text-gray-400">
                (Amount in UPI QR code: ₹{paymentAmount})
              </p>
            </div>

            {isAdmin && (
              <div className="mt-4 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    🛠️ Offline Order Customization (Admin Only)
                  </span>
                  <span className="text-[11px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                    Offline Customer
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Additional Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm font-medium">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={adminAdditionalAmount || ''}
                        onChange={(e) => setAdminAdditionalAmount(Math.max(0, Number(e.target.value)))}
                        placeholder="e.g. 50"
                        className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Extra charge added to final order total</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Additional Weight (Grams)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={adminAdditionalWeight || ''}
                        onChange={(e) => setAdminAdditionalWeight(Math.max(0, Number(e.target.value)))}
                        placeholder="e.g. 250"
                        className="w-full pl-3 pr-12 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-xs font-medium">grams</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Extra weight counted in shipping labels</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
                  <span>Calculated Package Weight:</span>
                  <span className="font-bold">
                    ~{((cartWeightGrams + giftsWeightGrams + (Number(adminAdditionalWeight) || 0)) / 1000).toFixed(2)} KG
                    {Number(adminAdditionalWeight) > 0 && (
                      <span className="text-[11px] font-normal text-amber-700 ml-1">
                        (Base: {((cartWeightGrams + giftsWeightGrams) / 1000).toFixed(2)} KG + {adminAdditionalWeight}g)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
            <div className="mt-4 mb-4">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <span className="text-xs sm:text-sm text-gray-600">
                  I agree to the <Link to="/terms-and-conditions" target="_blank" className="text-green-600 font-semibold hover:underline">Terms & Conditions</Link> and <Link to="/refund-policy" target="_blank" className="text-green-600 font-semibold hover:underline">Refund Policy</Link>
                </span>
              </label>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={(paymentMethod !== 'cod' && !transactionId) || !agreedToTerms}
              className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-sm transition ${(paymentMethod !== 'cod' && !transactionId) || !agreedToTerms
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.99] shadow-green-600/30'
                }`}
            >
              {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Place Order'}
            </button>

            {paymentMethod !== 'cod' && !transactionId && (
              <p className="text-center text-xs text-amber-700 font-semibold mt-2">
                Please complete payment and enter transaction ID / UTR
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Floating Bottom Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 p-3 sm:p-4 shadow-[0_-4px_25px_rgba(0,0,0,0.12)]">
        <div className="max-w-md mx-auto">
          {/* Quick terms agreement check if not yet checked */}
          {!agreedToTerms && (
            <label className="flex items-center gap-2 mb-2 cursor-pointer text-[11px] text-gray-600 font-medium select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-3.5 h-3.5 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <span className="truncate">
                I agree to <Link to="/terms-and-conditions" target="_blank" className="text-green-600 underline">Terms</Link> & <Link to="/refund-policy" target="_blank" className="text-green-600 underline">Refund Policy</Link>
              </span>
            </label>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Payable</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black text-green-700">₹{displayAmount}</span>
                {shipping === 0 && (
                  <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 truncate">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items {selectedFreeGifts.length > 0 && `• ${selectedFreeGifts.length} Gifts`}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={(paymentMethod !== 'cod' && !transactionId) || !agreedToTerms}
              className={`flex-1 max-w-[210px] py-3 px-4 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-1.5 ${
                (paymentMethod !== 'cod' && !transactionId) || !agreedToTerms
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-green-600 text-white hover:bg-green-700 active:scale-98 shadow-green-600/30'
              }`}
            >
              <span>{paymentMethod === 'cod' ? 'Place COD Order' : 'Place Order'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {paymentMethod !== 'cod' && !transactionId && (
            <p className="text-[10px] text-center text-amber-700 font-semibold mt-1.5">
              ⚠️ Enter 12-digit UPI REF/UTR number above to place order
            </p>
          )}
        </div>
      </div>

      {/* UTR Help Modal */}
      {showUtrHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">How to find UTR / UPI Ref Number?</h3>
              <button onClick={() => setShowUtrHelp(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                The UTR (Unique Transaction Reference) or UPI Reference number is a <strong>12-digit number</strong> that uniquely identifies your transaction.
              </p>
              <div className="space-y-3 mt-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="font-semibold text-blue-800 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs">G</span> Google Pay
                  </p>
                  <p className="text-sm text-gray-700 mt-1">Open transaction details. Look for <strong>UPI Transaction ID</strong>.</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <p className="font-semibold text-purple-800 flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">Pe</span> PhonePe
                  </p>
                  <p className="text-sm text-gray-700 mt-1">Open history, click on the transaction. Look for <strong>UTR</strong> number.</p>
                </div>
                <div className="bg-sky-50 p-3 rounded-lg border border-sky-100">
                  <p className="font-semibold text-sky-800 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">Pt</span> Paytm
                  </p>
                  <p className="text-sm text-gray-700 mt-1">Open payment details. Look for <strong>UPI Ref No</strong>.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUtrHelp(false)}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition mt-6"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
