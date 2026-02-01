import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Banknote, Smartphone, MapPin, User, Phone, Mail, QrCode, ExternalLink, Copy, Check, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../store';
import { Order, Address } from '../types';
import { statesAndCities } from '../data/locations';

export function Checkout() {
  const { cart, user, appliedCoupon, createOrder, clearCart, settings } = useStore();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showQR, setShowQR] = useState(true);

  // Address selection state
  const userAddresses = user?.addresses || [];
  const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddress?.id || 'new');
  const [useNewAddress, setUseNewAddress] = useState(!defaultAddress);
  const [newAddress, setNewAddress] = useState<Address>(user?.address || {
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [isManualCity, setIsManualCity] = useState(false);
  const [deliveryName, setDeliveryName] = useState(user?.name || '');
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || '');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

  const subtotal = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.type === 'percentage'
      ? (subtotal * appliedCoupon.discount) / 100
      : appliedCoupon.discount;
  }
  const shipping = subtotal >= 1000 ? 0 : 50;

  // Calculate total and round to 2 decimal places to avoid floating point issues
  const totalRaw = subtotal - discount + shipping;
  const total = Math.round(totalRaw * 100) / 100; // Ensures exact 2 decimal precision

  // Format amount for display (always show 2 decimal places for consistency)
  const displayAmount = total.toFixed(2);
  const displayAmountWhole = Math.round(total); // For display without decimals

  // UPI Payment details
  const upiId = settings.upiId;
  const merchantName = settings.businessAddress.name;
  const orderId = `ORD-${Date.now()}`;

  // IMPORTANT: Use exact same amount format for QR code and display
  // UPI spec requires amount with 2 decimal places
  const paymentAmount = total.toFixed(2);

  // Generate UPI payment URL for QR code and deep links
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}&tr=${orderId}`;

  // App-specific deep links - using same paymentAmount for consistency
  const gpayUrl = `gpay://upi/pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
  const phonepeUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
  const paytmUrl = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPaymentApp = (appUrl: string, fallbackUrl: string) => {
    const startTime = Date.now();
    window.location.href = appUrl;

    // If app doesn't open within 2 seconds, try fallback
    setTimeout(() => {
      if (Date.now() - startTime < 2500) {
        window.location.href = fallbackUrl;
      }
    }, 2000);
  };

  const handlePlaceOrder = () => {
    if (!transactionId && paymentMethod !== 'cod') {
      alert('Please enter transaction ID');
      return;
    }

    // Get the selected address
    let finalAddress: Address;
    let finalName: string;
    let finalPhone: string;

    if (useNewAddress || selectedAddressId === 'new') {
      finalAddress = newAddress;
      finalName = deliveryName;
      finalPhone = deliveryPhone;
    } else {
      const selectedAddr = userAddresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddr) {
        alert('Please select a valid address');
        return;
      }
      finalAddress = {
        street: selectedAddr.street,
        city: selectedAddr.city,
        state: selectedAddr.state,
        pincode: selectedAddr.pincode,
        country: selectedAddr.country,
      };
      finalName = selectedAddr.name;
      finalPhone = selectedAddr.phone;
    }

    const order: Order = {
      id: orderId,
      userId: user!.id,
      userName: finalName,
      userEmail: user!.email,
      userPhone: finalPhone,
      items: cart,
      total: subtotal,
      discount,
      finalAmount: total,
      couponCode: appliedCoupon?.code,
      address: finalAddress,
      status: 'payment_pending',
      paymentStatus: 'awaiting_approval',
      paymentMethod,
      transactionId: paymentMethod === 'cod' ? 'COD' : transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createOrder(order);
    clearCart();
    navigate('/order-success', { state: { orderId: order.id } });
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} /> Customer Information
            </h2>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-center gap-2"><User size={16} /> {user.name}</p>
              <p className="flex items-center gap-2"><Mail size={16} /> {user.email}</p>
              <p className="flex items-center gap-2"><Phone size={16} /> {user.phone}</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={20} /> Delivery Address
            </h2>

            {/* Saved Addresses Selection */}
            {userAddresses.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-600 font-medium">Select a saved address:</p>
                {userAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${selectedAddressId === addr.id && !useNewAddress
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
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
                      className="mt-1 text-green-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 font-medium">{addr.name}</p>
                      <p className="text-gray-600 text-sm">{addr.phone}</p>
                      <p className="text-gray-600 text-sm">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Use New Address Option */}
            <label
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition mb-4 ${useNewAddress
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
                }`}
            >
              <input
                type="radio"
                name="address"
                checked={useNewAddress}
                onChange={() => setUseNewAddress(true)}
                className="mt-1 text-green-600"
              />
              <div className="flex-1">
                <span className="font-semibold text-gray-800">Use a different address</span>
                <p className="text-sm text-gray-500">Enter delivery details below</p>
              </div>
            </label>

            {/* New Address Form */}
            {useNewAddress && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={deliveryName}
                      onChange={(e) => setDeliveryName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      value={newAddress.state}
                      onChange={(e) => {
                        setNewAddress({ ...newAddress, state: e.target.value, city: '' });
                        setIsManualCity(false);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                    >
                      <option value="">Select State</option>
                      {Object.keys(statesAndCities).sort().map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    {isManualCity ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter City Name"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        <button
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          <option value="">Select City</option>
                          {newAddress.state && statesAndCities[newAddress.state]?.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                          <option value="Other">Other (Enter Manually)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[
                { id: 'upi', label: 'UPI Payment', icon: Smartphone, desc: 'GPay / PhonePe / Paytm' },
                { id: 'bank', label: 'Bank Transfer', icon: Banknote, desc: 'NEFT / IMPS / RTGS' },
                { id: 'cod', label: 'Cash on Delivery', icon: CreditCard, desc: 'Pay when you receive' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${paymentMethod === method.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-green-600"
                  />
                  <method.icon className="text-gray-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-800">{method.label}</p>
                    <p className="text-sm text-gray-500">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* UPI Payment Section */}
            {paymentMethod === 'upi' && (
              <div className="mt-6 space-y-4">
                {/* Amount Display - Shows exact amount that will be in QR code */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-lg text-center">
                  <p className="text-sm opacity-90">Amount to Pay</p>
                  <p className="text-3xl font-bold">₹{displayAmount}</p>
                  <p className="text-xs opacity-75 mt-1">This exact amount will appear in your payment app</p>
                </div>

                {/* Mobile: Show App Payment Buttons */}
                {isMobile ? (
                  <div className="space-y-4">
                    <p className="text-center text-gray-600 font-medium">Pay using your favorite UPI app</p>

                    {/* Payment App Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => openPaymentApp(gpayUrl, upiUrl)}
                        className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">G</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">GPay</span>
                      </button>

                      <button
                        onClick={() => openPaymentApp(phonepeUrl, upiUrl)}
                        className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition"
                      >
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Pe</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">PhonePe</span>
                      </button>

                      <button
                        onClick={() => openPaymentApp(paytmUrl, upiUrl)}
                        className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition"
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Pt</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Paytm</span>
                      </button>
                    </div>

                    {/* Other UPI Apps Button */}
                    <a
                      href={upiUrl}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Wallet size={20} />
                      <span>Other UPI Apps</span>
                      <ExternalLink size={16} />
                    </a>

                    {/* Toggle QR Code on Mobile */}
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="w-full flex items-center justify-center gap-2 text-green-600 hover:text-green-700"
                    >
                      <QrCode size={18} />
                      {showQR ? 'Hide QR Code' : 'Show QR Code'}
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-gray-600">Scan QR code with any UPI app to pay</p>
                )}

                {/* QR Code Section */}
                {showQR && (
                  <div className="bg-white border-2 border-dashed border-green-300 rounded-xl p-6">
                    <div className="flex flex-col items-center">
                      {/* Amount Badge on QR */}
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full mb-3 font-semibold">
                        Pay Exactly: ₹{paymentAmount}
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-green-200">
                        <QRCodeSVG
                          value={upiUrl}
                          size={200}
                          level="H"
                          includeMargin={true}
                          imageSettings={{
                            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2316a34a'%3E%3Ccircle cx='12' cy='12' r='12'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='white' font-size='10' font-weight='bold'%3EV%3C/text%3E%3C/svg%3E",
                            x: undefined,
                            y: undefined,
                            height: 40,
                            width: 40,
                            excavate: true,
                          }}
                        />
                      </div>
                      {/* Amount confirmation below QR */}
                      <div className="mt-3 text-center">
                        <p className="text-lg font-bold text-green-700">₹{paymentAmount}</p>
                        <p className="text-sm text-gray-500">Scan with any UPI app</p>
                      </div>

                      {/* Supported Apps */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">G</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">Pe</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">Pt</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">& more</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI ID Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Or pay manually to UPI ID:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-4 py-2 rounded border font-mono text-green-700">
                      {upiId}
                    </code>
                    <button
                      onClick={copyUpiId}
                      className={`p-2 rounded-lg transition ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                {/* Transaction ID Input */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    After payment, enter the Transaction ID below
                  </p>
                  <input
                    type="text"
                    placeholder="Enter UPI Transaction ID / UTR Number"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
                  />
                  <p className="text-xs text-yellow-700 mt-2">
                    Your order will be processed after admin verifies the payment
                  </p>
                </div>
              </div>
            )}

            {/* Bank Transfer Section */}
            {paymentMethod === 'bank' && (
              <div className="mt-6 space-y-4">
                {/* Amount Display - Shows exact amount */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg text-center">
                  <p className="text-sm opacity-90">Amount to Pay</p>
                  <p className="text-3xl font-bold">₹{displayAmount}</p>
                  <p className="text-xs opacity-75 mt-1">Transfer this exact amount</p>
                </div>

                {/* Bank Details */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-blue-800">Bank Account Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank Name:</span>
                      <span className="font-medium">State Bank of India</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium">Vaddadi Pickles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-mono font-medium">1234567890123456</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IFSC Code:</span>
                      <span className="font-mono font-medium">SBIN0001234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Branch:</span>
                      <span className="font-medium">Hyderabad Main</span>
                    </div>
                  </div>
                </div>

                {/* QR Code for Bank */}
                <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl p-6">
                  <div className="flex flex-col items-center">
                    {/* Amount Badge */}
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-3 font-semibold">
                      Pay Exactly: ₹{paymentAmount}
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-blue-200">
                      <QRCodeSVG
                        value={upiUrl}
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-lg font-bold text-blue-700">₹{paymentAmount}</p>
                      <p className="text-sm text-gray-500">Scan to pay via UPI (faster)</p>
                    </div>
                  </div>
                </div>

                {/* Transaction ID Input */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <input
                    type="text"
                    placeholder="Enter Transaction Reference Number"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
                  />
                  <p className="text-xs text-yellow-700 mt-2">
                    ⚠️ Your order will be processed after admin verifies the payment
                  </p>
                </div>
              </div>
            )}

            {/* COD Section */}
            {paymentMethod === 'cod' && (
              <div className="mt-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="text-orange-600 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-orange-800">Cash on Delivery</h3>
                      <p className="text-sm text-orange-700 mt-1">
                        Pay ₹{displayAmountWhole} when you receive your order.
                        Please keep exact change ready.
                      </p>
                      <p className="text-xs text-orange-600 mt-2">
                        Note: COD orders may take additional time for verification
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
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.variant.weight}`} className="flex items-center gap-3">
                  <span className="text-2xl">{item.product.image}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.product.name}</p>
                    <p className="text-sm text-gray-500">{item.variant.weight} × {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{item.variant.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}.00`}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 border-t pt-2">
                <span>Total</span>
                <span className="text-green-700">₹{displayAmount}</span>
              </div>
              <p className="text-xs text-center text-gray-500">
                (Amount in QR code: ₹{paymentAmount})
              </p>
            </div>

            <div className="mt-4 mb-4">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the <Link to="/terms-and-conditions" target="_blank" className="text-green-600 hover:underline">Terms & Conditions</Link> and <Link to="/refund-policy" target="_blank" className="text-green-600 hover:underline">Refund Policy</Link>
                </span>
              </label>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={(paymentMethod !== 'cod' && !transactionId) || !agreedToTerms}
              className={`w-full py-4 rounded-lg font-semibold transition ${(paymentMethod !== 'cod' && !transactionId) || !agreedToTerms
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Place Order'}
            </button>

            {paymentMethod !== 'cod' && !transactionId && (
              <p className="text-center text-xs text-orange-500 mt-2">
                Please complete payment and enter transaction ID
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
