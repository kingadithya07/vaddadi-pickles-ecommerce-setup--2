import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Truck, CheckCircle, Clock, XCircle,
  MessageCircle, Printer, ChevronDown, ChevronUp
} from 'lucide-react';
import { useStore } from '../store';
import { Order } from '../types';
import { getTrackingUrl } from '../utils/tracking';
import { supabase } from '../lib/supabase';

const statusConfig: Record<Order['status'], { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock },
  payment_pending: { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  payment_approved: { label: 'Payment Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

/** Renders a product image — shows <img> if URL, otherwise renders emoji as text */
function ProductImage({ image, name }: { image: string; name: string }) {
  if (image && (image.startsWith('http') || image.startsWith('/'))) {
    return (
      <img
        src={image}
        alt={name}
        className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return <span className="text-2xl">{image}</span>;
}

export function Orders() {
  const { user, orders: globalOrders, isLoading } = useStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // The global store fetches the orders. Filter them to only show the current user's orders,
  // and sort them by date descending.
  const orders = globalOrders
    .filter(o => o.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const generateWhatsAppMessage = (order: Order) => {
    const message = `Hi! I want to check the status of my order.\n\nOrder ID: ${order.id}\nName: ${order.userName}\nAmount: ₹${order.finalAmount}\n\nThank you!`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
  };

  const printInvoice = (order: Order) => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;

    const itemsHtml = order.items.map(item => `
      <tr>
        <td>${item.product.name}</td>
        <td>${item.variant.weight}</td>
        <td>${item.quantity}</td>
        <td>₹${item.variant.price}</td>
        <td>₹${item.variant.price * item.quantity}</td>
      </tr>
    `).join('');

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 20px; }
          .header img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #16a34a; }
          .header h1 { color: #16a34a; margin: 10px 0 0 0; }
          .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .details div { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #f3f4f6; }
          .total { text-align: right; font-size: 1.2em; font-weight: bold; }
          .footer { text-align: center; margin-top: 40px; color: #666; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg" alt="Vaddadi Pickles" />
          <h1>Vaddadi Pickles</h1>
          <p>Authentic Homemade Pickles</p>
        </div>
        <h2>INVOICE</h2>
        <div class="details">
          <div>
            <strong>Invoice To:</strong><br>
            ${order.userName}<br>
            ${order.userEmail}<br>
            ${order.userPhone}<br><br>
            <strong>Delivery Address:</strong><br>
            ${order.address.street}<br>
            ${order.address.city}, ${order.address.state}<br>
            ${order.address.pincode}
          </div>
          <div style="text-align: right;">
            <strong>Invoice No:</strong> INV-${order.id}<br>
            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
            <strong>Order ID:</strong> ${order.id}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th><th>Weight</th><th>Qty</th><th>Price</th><th>Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="total">
          <p>Subtotal: ₹${order.total}</p>
          ${order.discount > 0 ? `<p style="color: green;">Discount (${order.couponCode}): -₹${order.discount}</p>` : ''}
          <p>Shipping: ${order.total >= 500 ? 'FREE' : '₹50'}</p>
          <p style="font-size: 1.3em; color: #16a34a;">Grand Total: ₹${order.finalAmount}</p>
        </div>
        <div class="footer">
          <p>Thank you for shopping with Vaddadi Pickles!</p>
          <p>Contact: 8008129309 (WhatsApp)</p>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceHtml);
    invoiceWindow.document.close();
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package className="mx-auto text-gray-300 mb-4" size={80} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Please Sign In</h2>
        <p className="text-gray-600 mb-6">Sign in to view your orders</p>
        <Link to="/login" className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package className="mx-auto text-gray-300 mb-4" size={80} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Yet</h2>
        <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
        <Link to="/products" className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
      <p className="text-gray-500 mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

      <div className="space-y-3">
        {orders.map((order) => {
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;
          const isExpanded = expandedOrderId === order.id;

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md">

              {/* ── Collapsed Header (always visible) ── */}
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 group"
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
              >
                {/* Left: order preview images + name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center overflow-hidden flex-shrink-0"
                      >
                        <ProductImage image={item.product.image} name={item.product.name} />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-semibold flex-shrink-0">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-mono truncate">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {order.items.map(i => i.product.name).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Middle: date */}
                <div className="hidden sm:block text-center flex-shrink-0">
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Right: amount + status + chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total Paid</p>
                    <p className="text-base font-bold text-gray-800">₹{order.finalAmount}</p>
                  </div>
                  <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
                    <StatusIcon size={14} />
                    {status.label}
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-400 group-hover:text-gray-600 transition-transform" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-600 transition-transform" />
                  )}
                </div>
              </button>

              {/* ── Expanded Details ── */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-5 space-y-5">

                  {/* Status badge (mobile) */}
                  <div className={`md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
                    <StatusIcon size={14} />
                    {status.label}
                  </div>

                  {/* Items list */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Items Ordered</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.product.id}-${item.variant.weight}-${index}`}
                          className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <ProductImage image={item.product.image} name={item.product.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-500">{item.variant.weight} × {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm flex-shrink-0">₹{item.variant.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    {/* Price summary */}
                    <div className="mt-3 border-t pt-3 space-y-1 text-sm text-right">
                      {order.discount > 0 && (
                        <p className="text-green-600">Discount ({order.couponCode}): -₹{order.discount}</p>
                      )}
                      <p className="font-bold text-base text-gray-800">Total Paid: ₹{order.finalAmount}</p>
                    </div>
                  </div>

                  {/* Order Progress */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Progress</h4>
                    <div className="relative">
                      <div className="flex justify-between">
                        {['Ordered', 'Payment', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                          const stepIndex = ['payment_pending', 'payment_approved', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                          const isCompleted = i <= stepIndex;
                          const isCurrent = i === stepIndex;
                          return (
                            <div key={step} className="flex flex-col items-center flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                                ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                                ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                                {isCompleted ? <CheckCircle size={16} /> : i + 1}
                              </div>
                              <p className="text-xs mt-1 text-center text-gray-500">{step}</p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
                    </div>
                  </div>

                  {/* Tracking */}
                  {order.trackingId && order.carrier && (
                    <div className="flex items-center gap-4 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100">
                      <div>
                        <p className="text-xs text-blue-600 font-semibold uppercase">{order.carrier} Tracking</p>
                        <p className="font-mono font-medium text-blue-800 text-sm tracking-wide">{order.trackingId}</p>
                      </div>
                      <a
                        href={getTrackingUrl(order.carrier, order.trackingId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        <Truck size={16} />
                        Track
                      </a>
                    </div>
                  )}

                  {/* Delivery + Payment info */}
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-1">Delivery Address</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {order.address.street}<br />
                        {order.address.city}, {order.address.state}<br />
                        {order.address.pincode}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-1">Payment</h4>
                      <p className="text-gray-600 leading-relaxed">
                        Method: {order.paymentMethod?.toUpperCase()}<br />
                        Txn ID: {order.transactionId || '—'}<br />
                        Status: <span className={order.paymentStatus === 'approved' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                          {order.paymentStatus?.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={() => printInvoice(order)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      <Printer size={16} />
                      Invoice
                    </button>
                    <a
                      href={generateWhatsAppMessage(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                    >
                      <MessageCircle size={16} />
                      WhatsApp Support
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
