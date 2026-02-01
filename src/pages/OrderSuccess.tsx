import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, MessageCircle, Package, ArrowRight } from 'lucide-react';
import { useStore } from '../store';

export function OrderSuccess() {
  const location = useLocation();
  const orderId = (location.state as any)?.orderId;
  const { orders } = useStore();
  const order = orders.find((o) => o.id === orderId);

  const generateWhatsAppMessage = () => {
    if (!order) return '';
    const itemsList = order.items.map((item) => `${item.product.name} (${item.variant.weight}) x${item.quantity}`).join(', ');
    const message = `🥒 *New Order from Vaddadi Pickles*\n\n📦 Order ID: ${order.id}\n👤 Customer: ${order.userName}\n📱 Phone: ${order.userPhone}\n📧 Email: ${order.userEmail}\n\n🛒 Items: ${itemsList}\n\n💰 Amount: ₹${order.finalAmount}\n💳 Payment: ${order.paymentMethod.toUpperCase()}\n🧾 Transaction ID: ${order.transactionId}\n\n📍 Delivery Address:\n${order.address.street}\n${order.address.city}, ${order.address.state}\n${order.address.pincode}\n\n⏳ Status: Payment Verification Pending\n\nThank you for ordering from Vaddadi Pickles!`;

    return encodeURIComponent(message);
  };

  const whatsappLink = `https://wa.me/919876543210?text=${generateWhatsAppMessage()}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <img 
            src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg" 
            alt="Vaddadi Pickles" 
            className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
          />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="text-white" size={24} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">Thank you for ordering from Vaddadi Pickles</p>

        {order && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono font-bold text-green-700">{order.id}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-gray-800">₹{order.finalAmount}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Payment Status:</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Awaiting Approval
              </span>
            </div>
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-500">
                ⏳ Your order will be processed once the admin verifies your payment. 
                You will receive updates on WhatsApp.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            <MessageCircle size={20} />
            Send Order Details on WhatsApp
          </a>

          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 w-full border border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            <Package size={20} />
            Track Your Order
          </Link>

          <Link
            to="/products"
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-green-600 transition"
          >
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
