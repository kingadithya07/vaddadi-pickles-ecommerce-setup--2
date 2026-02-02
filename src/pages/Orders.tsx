import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, XCircle, FileText, MessageCircle, Printer } from 'lucide-react';
import { useStore } from '../store';
import { Order } from '../types';
import { getTrackingUrl } from '../utils/tracking';

const statusConfig: Record<Order['status'], { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock },
  payment_pending: { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  payment_approved: { label: 'Payment Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export function Orders() {
  const { orders, user } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const userOrders = orders.filter((o) => o.userId === user?.id).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
              <th>Item</th>
              <th>Weight</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="total">
          <p>Subtotal: ₹${order.total}</p>
          ${order.discount > 0 ? `<p style="color: green;">Discount (${order.couponCode}): -₹${order.discount}</p>` : ''}
          <p>Shipping: ${order.total >= 500 ? 'FREE' : '₹50'}</p>
          <p style="font-size: 1.3em; color: #16a34a;">Grand Total: ₹${order.finalAmount}</p>
        </div>
        
        <div class="footer">
          <p>Thank you for shopping with Vaddadi Pickles!</p>
          <p>Contact: +91 98765 43210 | info@vaddadipickles.com</p>
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

  if (userOrders.length === 0) {
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

      <div className="space-y-4">
        {userOrders.map((order) => {
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono font-bold text-gray-800">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-800">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-bold text-gray-800">₹{order.finalAmount}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.color}`}>
                    <StatusIcon size={18} />
                    <span className="font-medium">{status.label}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={`${item.product.id}-${item.variant.weight}-${index}`} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-sm">
                      <span>{item.product.image}</span>
                      <span>{item.product.name} ({item.variant.weight})</span>
                      <span className="text-gray-500">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Order Progress */}
                <div className="relative mb-6">
                  <div className="flex justify-between">
                    {['Ordered', 'Payment', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                      const stepIndex = ['payment_pending', 'payment_approved', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                      const isCompleted = i <= stepIndex;
                      const isCurrent = i === stepIndex;

                      return (
                        <div key={step} className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                            } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                            {isCompleted ? <CheckCircle size={16} /> : i + 1}
                          </div>
                          <p className="text-xs mt-1 text-center">{step}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    <FileText size={16} />
                    {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                  </button>
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
                  {order.trackingId && order.carrier && (
                    <div className="flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                      <div>
                        <p className="text-xs text-blue-600 font-semibold uppercase">{order.carrier} Tracking</p>
                        <p className="font-mono font-medium text-blue-800 text-sm tracking-wide">{order.trackingId}</p>
                      </div>
                      <a
                        href={getTrackingUrl(order.carrier, order.trackingId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm ml-auto"
                      >
                        <Truck size={16} />
                        Track Package
                      </a>
                    </div>
                  )}
                </div>

                {/* Order Details */}
                {selectedOrder?.id === order.id && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Delivery Address</h4>
                        <p className="text-gray-600">
                          {order.address.street}<br />
                          {order.address.city}, {order.address.state}<br />
                          {order.address.pincode}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Payment Details</h4>
                        <p className="text-gray-600">
                          Method: {order.paymentMethod.toUpperCase()}<br />
                          Transaction ID: {order.transactionId}<br />
                          Status: <span className={order.paymentStatus === 'approved' ? 'text-green-600' : 'text-yellow-600'}>
                            {order.paymentStatus.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
