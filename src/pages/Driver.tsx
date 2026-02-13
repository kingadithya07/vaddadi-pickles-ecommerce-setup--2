import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navigation, Phone, Power, RefreshCw, User, Package, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { DriverLocationMap } from '../components/DriverMap';
import { Order } from '../types';

export function Driver() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const driverId = searchParams.get('driver') || `driver_${Date.now()}`;
  
  const orders = useStore((state) => state.orders);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load order details
  useEffect(() => {
    if (orderId) {
      const foundOrder = orders.find(o => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // Try to fetch from Supabase
        supabase.from('orders').select('*').eq('id', orderId).single().then(({ data }) => {
          if (data) {
            setOrder({
              id: data.id,
              userId: data.user_id,
              userName: data.user_name,
              userEmail: data.user_email,
              userPhone: data.user_phone,
              items: data.items,
              total: Number(data.total),
              discount: Number(data.discount),
              finalAmount: Number(data.final_amount),
              couponCode: data.coupon_code,
              address: data.address,
              status: data.status,
              paymentStatus: data.payment_status,
              paymentMethod: data.payment_method,
              transactionId: data.transaction_id,
              trackingId: data.tracking_id,
              carrier: data.carrier,
              driverId: data.driver_id,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            });
          }
          setIsLoading(false);
        });
      }
    } else {
      setIsLoading(false);
    }
  }, [orderId, orders]);

  // Get initial position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setError('Could not get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  // Update driver location in Supabase
  const updateLocation = useCallback(async () => {
    if (!position || !orderId || !driverName || !driverPhone) return;

    try {
      await supabase.from('driver_locations').upsert({
        order_id: orderId,
        driver_id: driverId,
        driver_name: driverName,
        driver_phone: driverPhone,
        lat: position.lat,
        lng: position.lng,
        timestamp: new Date().toISOString(),
        is_active: true,
      }, {
        onConflict: 'order_id'
      });

      // Update order with driver ID
      await supabase.from('orders').update({
        driver_id: driverId,
        status: 'out_for_delivery',
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);

      // Also update local order status if function available
      if (updateOrderStatus && order?.status !== 'out_for_delivery') {
        updateOrderStatus(orderId, 'out_for_delivery');
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error updating location:', err);
    }
  }, [position, orderId, driverId, driverName, driverPhone, updateOrderStatus, order?.status]);

  // Start tracking
  const startTracking = () => {
    if (!driverName || !driverPhone) {
      setError('Please enter your name and phone number');
      return;
    }
    
    if (!position) {
      setError('Waiting for location... Please enable location services.');
      return;
    }

    setIsTracking(true);
    setError(null);

    // Watch position changes
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
        console.error('Watch position error');
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    // Update location every 10 seconds
    updateLocation();
    intervalRef.current = setInterval(updateLocation, 10000);
  };

  // Stop tracking
  const stopTracking = async () => {
    setIsTracking(false);
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Mark as inactive in Supabase
    if (orderId) {
      await supabase.from('driver_locations').update({
        is_active: false,
        timestamp: new Date().toISOString(),
      }).eq('order_id', orderId);
    }
  };

  // Mark order as delivered
  const markDelivered = async () => {
    if (!orderId) return;
    
    await stopTracking();
    
    await supabase.from('orders').update({
      status: 'delivered',
      updated_at: new Date().toISOString(),
    }).eq('id', orderId);

    if (updateOrderStatus) {
      updateOrderStatus(orderId, 'delivered');
    }

    setOrder(prev => prev ? { ...prev, status: 'delivered' } : null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
          <Package className="mx-auto text-gray-300 mb-4" size={60} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Order Specified</h2>
          <p className="text-gray-600">Please provide an order ID to start tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <TruckIcon size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold">Driver Tracking</h1>
              <p className="text-xs text-green-100">Order: {orderId}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isTracking ? 'bg-green-400 text-green-900' : 'bg-white/20'
          }`}>
            {isTracking ? 'Active' : 'Idle'}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Order Info */}
        {order && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Deliver to</p>
                <p className="font-semibold text-gray-800">{order.userName}</p>
                <p className="text-sm text-gray-600">{order.address.street}</p>
                <p className="text-sm text-gray-600">{order.address.city}, {order.address.state}</p>
              </div>
              <a 
                href={`tel:${order.userPhone}`}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
              >
                <Phone size={18} />
                Call
              </a>
            </div>
          </div>
        )}

        {/* Map */}
        <DriverLocationMap 
          position={position}
          onPositionChange={setPosition}
        />

        {/* Driver Details Form */}
        {!isTracking && order?.status !== 'delivered' && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-green-600" />
              Driver Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Tracking Status */}
        {isTracking && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw size={20} className="text-green-600 animate-spin" />
              <span className="font-medium text-green-800">Location sharing active</span>
            </div>
            <p className="text-sm text-green-600">
              Your location is being shared with the customer. Last updated: {lastUpdated?.toLocaleTimeString() || 'Just now'}
            </p>
          </div>
        )}

        {/* Delivered Success */}
        {order?.status === 'delivered' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <span className="font-medium text-green-800">Order Delivered!</span>
                <p className="text-sm text-green-600">Great job! The order has been marked as delivered.</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {order?.status !== 'delivered' && (
          <div className="space-y-3">
            {!isTracking ? (
              <button
                onClick={startTracking}
                disabled={!position || !driverName || !driverPhone}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Navigation size={20} />
                Start Delivery Tracking
              </button>
            ) : (
              <>
                <button
                  onClick={markDelivered}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  <CheckCircle size={20} />
                  Mark as Delivered
                </button>
                <button
                  onClick={stopTracking}
                  className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
                >
                  <Power size={20} />
                  Stop Tracking
                </button>
              </>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-600">
            <li>Enter your name and phone number</li>
            <li>Click &quot;Start Delivery Tracking&quot; to begin sharing your location</li>
            <li>Your location updates automatically every 10 seconds</li>
            <li>Once delivered, click &quot;Mark as Delivered&quot;</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Truck icon component
function TruckIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
