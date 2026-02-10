import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Users, CreditCard, Tag, LayoutDashboard,
  CheckCircle, XCircle, Clock, FileText, Printer,
  MessageCircle, ChevronDown, ChevronUp, StickyNote,
  Plus, Trash2, ShoppingBag, Image, Settings
} from 'lucide-react';
import { useStore } from '../store';
import { Order, Coupon, Product, ProductVariant } from '../types';
import { TRACKING_CARRIERS } from '../utils/tracking';

type Tab = 'dashboard' | 'products' | 'orders' | 'payments' | 'coupons' | 'labels' | 'settings';

const statusOptions: { value: Order['status']; label: string }[] = [
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'payment_approved', label: 'Payment Approved' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function Admin() {
  const orders = useStore((state) => state.orders);
  const coupons = useStore((state) => state.coupons);
  const products = useStore((state) => state.products);
  const isAdmin = useStore((state) => state.isAdmin);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);
  const updatePaymentStatus = useStore((state) => state.updatePaymentStatus);
  const updateOrderTracking = useStore((state) => state.updateOrderTracking);
  const addCoupon = useStore((state) => state.addCoupon);
  const toggleCoupon = useStore((state) => state.toggleCoupon);
  const addProduct = useStore((state) => state.addProduct);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const addCombo = useStore((state) => state.addCombo);
  const combos = useStore((state) => state.combos);
  const deleteCombo = useStore((state) => state.deleteCombo);
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discount: 10,
    type: 'percentage',
    minOrder: 500,
    active: true,
  });

  // Product Form State
  const [isCombo, setIsCombo] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'mango',
    image: '',
    variants: [
      { weight: '250g', price: 149, stock: 50, enabled: true },
      { weight: '500g', price: 279, stock: 50, enabled: true },
      { weight: '1kg', price: 529, stock: 30, enabled: true },
    ],
    bestSeller: false,
  });

  // Combo Form State
  const [newCombo, setNewCombo] = useState({
    name: '',
    description: '',
    image: '',
    selectedProducts: [] as { productId: string; variantWeight: string }[],
    originalPrice: 0,
    comboPrice: 0,
    stock: 0,
  });

  const handleAddProduct = () => {
    if (isCombo) {
      if (!newCombo.name || !newCombo.image || newCombo.selectedProducts.length < 2) {
        alert('Please fill in name, image, and select at least 2 products with variants');
        return;
      }

      const combo = {
        id: `combo_${Date.now()}`,
        name: newCombo.name,
        description: newCombo.description,
        image: newCombo.image,
        products: newCombo.selectedProducts,
        originalPrice: newCombo.originalPrice,
        comboPrice: newCombo.comboPrice,
        stock: newCombo.stock,
        active: true,
      };

      addCombo(combo);

      setNewCombo({
        name: '',
        description: '',
        image: '',
        selectedProducts: [],
        originalPrice: 0,
        comboPrice: 0,
        stock: 0,
      });

      alert('Combo added successfully!');
      return;
    }

    if (!newProduct.name || !newProduct.image) {
      alert('Please fill in product name and image URL');
      return;
    }

    const enabledVariants: ProductVariant[] = newProduct.variants
      .filter(v => v.enabled)
      .map(v => ({ weight: v.weight, price: v.price, stock: v.stock }));

    if (enabledVariants.length === 0) {
      alert('Please enable at least one weight variant');
      return;
    }

    const product: Product = {
      id: `prod_${Date.now()}`,
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      image: newProduct.image,
      variants: enabledVariants,
      inStock: enabledVariants.some(v => v.stock > 0),
      rating: 4.5,
      reviews: 0,
      bestSeller: newProduct.bestSeller,
    };

    addProduct(product);

    // Reset form
    setNewProduct({
      name: '',
      description: '',
      category: 'mango',
      image: '',
      variants: [
        { weight: '250g', price: 149, stock: 50, enabled: true },
        { weight: '500g', price: 279, stock: 50, enabled: true },
        { weight: '1kg', price: 529, stock: 30, enabled: true },
      ],
      bestSeller: false,
    });

    alert('Product added successfully!');
  };

  if (!isAdmin) {
    navigate('/login');
    return null;
  }

  const sortedOrders = [...orders].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const pendingPayments = orders.filter((o) => o.paymentStatus === 'awaiting_approval').length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'approved')
    .reduce((sum, o) => sum + o.finalAmount, 0);

  const sendWhatsAppUpdate = (order: Order, status: string) => {
    const message = `🥒 *Vaddadi Pickles - Order Update*

Dear ${order.userName},

Your order *${order.id}* status has been updated to: *${status}*

${status === 'shipped' ? '📦 Your order is on the way! Expected delivery in 3-5 business days.' : ''}
${status === 'delivered' ? '✅ Your order has been delivered. Thank you for shopping with us!' : ''}
${status === 'payment_approved' ? '💰 Your payment has been verified. We are processing your order.' : ''}

Track your order: vaddadipickles.com/orders

Thank you for choosing Vaddadi Pickles!`;

    window.open(`https://wa.me/${order.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const printSingleLabel = (order: Order) => {
    const labelWindow = window.open('', '_blank');
    if (!labelWindow) return;

    const codBadge = order.paymentMethod === 'cod'
      ? `<div class="cod-badge">COD ₹${order.finalAmount}</div>`
      : '';

    const paymentInfo = order.paymentMethod === 'cod'
      ? `💵 Collect: ₹${order.finalAmount}`
      : '✅ PREPAID';

    const singleLabelHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Label - ${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; }
          .label { width: 100mm; background: white; border: 3px solid #000; position: relative; }
          .label-header { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 15px; text-align: center; }
          .label-header .logo { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid white; margin-bottom: 8px; }
          .label-header h1 { font-size: 22px; margin-bottom: 4px; }
          .label-header p { font-size: 11px; opacity: 0.9; }
          .content { padding: 15px; }
          .from-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 15px; }
          .from-box .title { font-size: 10px; font-weight: bold; color: #6b7280; margin-bottom: 5px; }
          .from-box .text { font-size: 11px; color: #374151; }
          .to-box { border: 2px solid #16a34a; border-radius: 8px; padding: 15px; }
          .to-box .title { font-size: 12px; font-weight: bold; color: #16a34a; margin-bottom: 10px; display: flex; align-items: center; gap: 5px; }
          .to-box .name { font-size: 20px; font-weight: bold; color: #111827; margin-bottom: 8px; }
          .to-box .address { font-size: 14px; color: #374151; line-height: 1.6; }
          .to-box .pincode { font-size: 18px; font-weight: bold; color: #111827; margin-top: 8px; background: #fef3c7; padding: 5px 10px; display: inline-block; border-radius: 4px; }
          .to-box .phone { font-size: 14px; margin-top: 10px; color: #111827; font-weight: 500; }
          .order-section { border-top: 2px dashed #d1d5db; margin-top: 15px; padding-top: 15px; }
          .order-id { font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; text-align: center; letter-spacing: 3px; margin-bottom: 10px; padding: 8px; background: #f3f4f6; border-radius: 4px; }
          .order-details { display: flex; justify-content: space-between; font-size: 11px; color: #6b7280; }
          .cod-badge { position: absolute; top: 70px; right: -5px; background: #dc2626; color: white; padding: 6px 15px; font-size: 14px; font-weight: bold; transform: rotate(15deg); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
          .handle-care { text-align: center; margin-top: 15px; padding: 8px; background: #fef2f2; border-radius: 4px; font-size: 12px; color: #991b1b; }
          @media print { 
            body { background: white; }
            .label { border: 2px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="label-header">
            <img src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg" alt="Vaddadi Pickles" class="logo" />
            <h1>VADDADI PICKLES</h1>
            <p>Premium Handmade Pickles | Est. 1985</p>
          </div>
          
          ${codBadge}
          
          <div class="content">
            <div class="from-box">
              <div class="title">FROM:</div>
              <div class="text">
                ${settings.businessAddress.name}, ${settings.businessAddress.street}<br>
                ${settings.businessAddress.city}, ${settings.businessAddress.state} - ${settings.businessAddress.pincode} | Ph: ${settings.businessAddress.phone}
              </div>
            </div>
            
            <div class="to-box">
              <div class="title">📦 DELIVER TO:</div>
              <div class="name">${order.userName}</div>
              <div class="address">
                ${order.address.street}<br>
                ${order.address.city}, ${order.address.state}
              </div>
              <div class="pincode">📍 ${order.address.pincode}</div>
              <div class="phone">📱 ${order.userPhone}</div>
            </div>
            
            <div class="order-section">
              <div class="order-id">${order.id}</div>
              <div class="order-details">
                <span>📦 ${order.items.length} Items</span>
                <span>⚖️ ~${order.items.reduce((sum, i) => sum + i.quantity, 0) * 250}g</span>
                <span>${paymentInfo}</span>
              </div>
            </div>
            
            <div class="handle-care">
              🫙 HANDLE WITH CARE - GLASS JARS INSIDE
            </div>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    labelWindow.document.write(singleLabelHtml);
    labelWindow.document.close();
  };

  const printSmallLabel = (order: Order) => {
    const labelWindow = window.open('', '_blank');
    if (!labelWindow) return;

    const codBadge = order.paymentMethod === 'cod'
      ? '<div class="cod">COD</div>'
      : '';

    const smallLabelHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Small Label - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; }
          .label { width: 62mm; height: 40mm; background: white; border: 2px solid #000; padding: 8px; position: relative; }
          .header { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #ccc; }
          .header .small-logo { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; }
          .header strong { font-size: 10px; }
          .name { font-size: 12px; font-weight: bold; margin-bottom: 3px; }
          .address { font-size: 9px; line-height: 1.4; color: #333; }
          .pin { font-weight: bold; font-size: 11px; margin-top: 3px; }
          .order-id { position: absolute; bottom: 5px; left: 8px; right: 8px; text-align: center; font-family: monospace; font-size: 10px; border-top: 1px dashed #ccc; padding-top: 3px; }
          .cod { position: absolute; top: 5px; right: 5px; background: red; color: white; font-size: 8px; padding: 2px 5px; font-weight: bold; }
          @media print { body { background: white; } }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">
            <img src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg" alt="VP" class="small-logo" />
            <strong>VADDADI PICKLES</strong>
          </div>
          ${codBadge}
          <div class="name">${order.userName}</div>
          <div class="address">
            ${order.address.street}, ${order.address.city}<br>
            ${order.address.state}
          </div>
          <div class="pin">PIN: ${order.address.pincode} | 📱 ${order.userPhone}</div>
          <div class="order-id">${order.id}</div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    labelWindow.document.write(smallLabelHtml);
    labelWindow.document.close();
  };

  const printBulkLabels = () => {
    const readyOrders = orders.filter(o => o.paymentStatus === 'approved' && (o.status === 'processing' || o.status === 'payment_approved'));
    if (readyOrders.length === 0) return;

    const labelWindow = window.open('', '_blank');
    if (!labelWindow) return;

    const labelsContent = readyOrders.map(order => {
      const codBadge = order.paymentMethod === 'cod'
        ? `<div class="cod-badge">COD ₹${order.finalAmount}</div>`
        : '';
      const paymentText = order.paymentMethod === 'cod'
        ? `COLLECT: ₹${order.finalAmount}`
        : 'PAID ✓';

      return `
        <div class="label">
          <div class="label-header">
            <img src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg" alt="VP" class="bulk-logo" />
            <h2>VADDADI PICKLES</h2>
            <p>Premium Handmade Pickles | Est. 1985</p>
          </div>
          
          <div class="from-section">
            <div class="title">FROM:</div>
            ${settings.businessAddress.name}, ${settings.businessAddress.city}, ${settings.businessAddress.state} - ${settings.businessAddress.pincode} | Ph: ${settings.businessAddress.phone}
          </div>
          
          <div class="to-section">
            <div class="title">📦 DELIVER TO:</div>
            <div class="name">${order.userName}</div>
            <div class="address">
              ${order.address.street}<br>
              ${order.address.city}, ${order.address.state}<br>
              <strong>PIN: ${order.address.pincode}</strong>
            </div>
            <div class="phone">📱 ${order.userPhone}</div>
          </div>
          
          ${codBadge}
          <div class="fragile">🫙</div>
          
          <div class="order-info">
            <div class="order-id">${order.id}</div>
            <div class="details">
              <span>Items: ${order.items.length}</span>
              <span>Weight: ~${order.items.reduce((sum, i) => sum + i.quantity, 0) * 250}g</span>
              <span>${paymentText}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const labelsHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bulk Shipping Labels - Vaddadi Pickles</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; }
          .page { page-break-after: always; padding: 10mm; }
          .page:last-child { page-break-after: avoid; }
          .labels-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10mm; }
          .label { border: 2px solid #000; padding: 15px; height: 140mm; position: relative; break-inside: avoid; }
          .label-header { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 12px; text-align: center; margin: -15px -15px 15px -15px; }
          .label-header .bulk-logo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid white; margin-bottom: 5px; }
          .label-header h2 { font-size: 18px; margin-bottom: 2px; }
          .label-header p { font-size: 10px; opacity: 0.9; }
          .from-section { background: #f3f4f6; padding: 10px; border-radius: 8px; margin-bottom: 12px; font-size: 11px; }
          .from-section .title { font-weight: bold; color: #666; margin-bottom: 5px; }
          .to-section { padding: 10px 0; }
          .to-section .title { font-weight: bold; color: #16a34a; font-size: 14px; margin-bottom: 8px; border-bottom: 2px solid #16a34a; padding-bottom: 4px; }
          .to-section .name { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
          .to-section .address { font-size: 14px; line-height: 1.6; }
          .to-section .phone { font-size: 14px; margin-top: 8px; font-weight: bold; }
          .order-info { position: absolute; bottom: 15px; left: 15px; right: 15px; border-top: 2px dashed #ccc; padding-top: 10px; }
          .order-info .order-id { font-family: monospace; font-size: 16px; font-weight: bold; text-align: center; letter-spacing: 2px; margin-bottom: 5px; }
          .order-info .details { display: flex; justify-content: space-between; font-size: 11px; color: #666; }
          .cod-badge { position: absolute; top: 60px; right: 15px; background: #dc2626; color: white; padding: 4px 12px; font-size: 12px; font-weight: bold; border-radius: 4px; transform: rotate(15deg); }
          .fragile { position: absolute; top: 95px; right: 10px; font-size: 24px; }
          @media print { 
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="labels-grid">
            ${labelsContent}
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    labelWindow.document.write(labelsHtml);
    labelWindow.document.close();
  };

  const printOrderLabel = (order: Order) => {
    const labelWindow = window.open('', '_blank');
    if (!labelWindow) return;

    const labelHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipping Label - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .label { border: 3px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
          .header h2 { margin: 0; }
          .section { margin-bottom: 15px; }
          .section-title { font-weight: bold; font-size: 12px; color: #666; margin-bottom: 5px; }
          .address { font-size: 16px; line-height: 1.5; }
          .barcode { text-align: center; font-family: monospace; font-size: 24px; letter-spacing: 5px; margin-top: 15px; padding-top: 15px; border-top: 2px dashed #000; }
          @media print { body { print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">
            <img src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg" alt="VP" style="width:50px;height:50px;border-radius:50%;object-fit:cover;border:2px solid #16a34a;" />
            <h2>${settings.businessAddress.name.toUpperCase()}</h2>
            <p>${settings.businessAddress.city}, ${settings.businessAddress.state}</p>
          </div>
          
          <div class="section">
            <div class="section-title">SHIP TO:</div>
            <div class="address">
              <strong>${order.userName}</strong><br>
              ${order.address.street}<br>
              ${order.address.city}, ${order.address.state}<br>
              PIN: ${order.address.pincode}<br>
              📱 ${order.userPhone}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">ORDER DETAILS:</div>
            <div class="address">
              Order ID: ${order.id}<br>
              Items: ${order.items.length}<br>
              Amount: ₹${order.finalAmount} (${order.paymentMethod.toUpperCase()})
            </div>
          </div>
          
          <div class="barcode">
            ${order.id}
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    labelWindow.document.write(labelHtml);
    labelWindow.document.close();
  };

  const handleAddCoupon = () => {
    if (!newCoupon.code) return;
    addCoupon(newCoupon as Coupon);
    setNewCoupon({
      code: '',
      discount: 10,
      type: 'percentage',
      minOrder: 500,
      active: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg"
              alt="Vaddadi Pickles"
              className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
            />
            <div>
              <h1 className="text-xl font-bold">Vaddadi Pickles Admin</h1>
              <p className="text-gray-400 text-sm">Manage orders, payments & coupons</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition text-sm"
          >
            Back to Store
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: ShoppingBag },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'payments', label: 'Payments', icon: CreditCard, badge: pendingPayments },
            { id: 'labels', label: 'Shipping Labels', icon: StickyNote },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${activeTab === tab.id
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <tab.icon size={20} />
              {tab.label}
              {tab.badge ? (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{tab.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <Package className="text-blue-500" size={32} />
                <span className="text-3xl font-bold text-gray-800">{orders.length}</span>
              </div>
              <p className="text-gray-600">Total Orders</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="text-yellow-500" size={32} />
                <span className="text-3xl font-bold text-gray-800">{pendingPayments}</span>
              </div>
              <p className="text-gray-600">Pending Payments</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <CreditCard className="text-green-500" size={32} />
                <span className="text-3xl font-bold text-gray-800">₹{totalRevenue}</span>
              </div>
              <p className="text-gray-600">Total Revenue</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="text-purple-500" size={32} />
                <span className="text-3xl font-bold text-gray-800">{new Set(orders.map(o => o.userId)).size}</span>
              </div>
              <p className="text-gray-600">Total Customers</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <Tag className="text-red-500" size={32} />
                <span className="text-3xl font-bold text-gray-800">
                  ₹{orders
                    .filter((o) => o.paymentStatus === 'approved')
                    .reduce((sum, o) => sum + (o.discount || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
              <p className="text-gray-600">Total Coupon Discounts</p>
            </div>

            {/* Recent Orders */}
            <div className="md:col-span-4 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm border-b">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-3 font-mono text-sm">{order.id}</td>
                        <td className="py-3">{order.userName}</td>
                        <td className="py-3 font-medium">₹{order.finalAmount}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{order.status}</span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${order.paymentStatus === 'approved' ? 'bg-green-100 text-green-700' :
                            order.paymentStatus === 'awaiting_approval' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Render Combos */}
                    {combos.map((combo) => (
                      <tr key={combo.id} className="border-b hover:bg-gray-50 bg-purple-50">
                        <td className="px-6 py-3">
                          <span className="text-2xl">{combo.image}</span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="font-medium text-gray-800">{combo.name}</div>
                          <div className="text-xs text-gray-500">Combo</div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            Combo
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <div className="font-semibold text-green-600">₹{combo.comboPrice}</div>
                          <div className="text-xs text-gray-500 line-through">₹{combo.originalPrice}</div>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          {combo.stock} Packs
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => deleteCombo(combo.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500 transition"
                            title="Delete Combo"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Store Settings</h3>

            <div className="bg-white rounded-xl shadow-md p-6 space-y-8">
              {/* COD Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Cash on Delivery (COD)</h4>
                  <p className="text-gray-500 text-sm mt-1">
                    Enable or disable COD option for customers at checkout.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.enableCOD}
                    onChange={() => updateSettings({ ...settings, enableCOD: !settings.enableCOD })}
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Bank Transfer Toggle */}
              <div className="flex items-center justify-between border-t pt-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Bank Transfer</h4>
                  <p className="text-gray-500 text-sm mt-1">
                    Enable or disable direct Bank Transfer option for customers.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.enableBankTransfer}
                    onChange={() => updateSettings({ ...settings, enableBankTransfer: !settings.enableBankTransfer })}
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-2">
                <p>
                  COD Status: <span className={`font-semibold ${settings.enableCOD ? 'text-green-600' : 'text-red-500'}`}>
                    {settings.enableCOD ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
                <p>
                  Bank Transfer Status: <span className={`font-semibold ${settings.enableBankTransfer ? 'text-blue-600' : 'text-red-500'}`}>
                    {settings.enableBankTransfer ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Add New Product Form */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Plus className="text-green-600" size={24} />
                  <h3 className="text-xl font-semibold text-gray-800">Add New Item</h3>
                </div>
                <div className="bg-gray-100 p-1 rounded-lg flex">
                  <button
                    onClick={() => setIsCombo(false)}
                    className={`px-4 py-2 rounded-md transition ${!isCombo ? 'bg-white shadow text-green-700 font-medium' : 'text-gray-500'}`}
                  >
                    Product
                  </button>
                  <button
                    onClick={() => setIsCombo(true)}
                    className={`px-4 py-2 rounded-md transition ${isCombo ? 'bg-white shadow text-green-700 font-medium' : 'text-gray-500'}`}
                  >
                    Combo
                  </button>
                </div>
              </div>

              {isCombo ? (
                /* Combo Form */
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Combo Name *</label>
                      <input
                        type="text"
                        value={newCombo.name}
                        onChange={(e) => setNewCombo({ ...newCombo, name: e.target.value })}
                        placeholder="e.g., Family Pack"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newCombo.description}
                        onChange={(e) => setNewCombo({ ...newCombo, description: e.target.value })}
                        placeholder="Describe the combo..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                      <input
                        type="text"
                        value={newCombo.image}
                        onChange={(e) => setNewCombo({ ...newCombo, image: e.target.value })}
                        placeholder="https://example.com/image.jpg or emoji 🎁"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Products & Variants *</label>
                      <div className="bg-gray-50 p-3 rounded-lg h-60 overflow-y-auto border border-gray-200 space-y-2">
                        {products.map((product) => {
                          const isSelected = newCombo.selectedProducts.some(p => p.productId === product.id);
                          const selectedVariant = newCombo.selectedProducts.find(p => p.productId === product.id)?.variantWeight || '';

                          return (
                            <div key={product.id} className={`p-2 rounded border ${isSelected ? 'bg-white border-green-200' : 'border-transparent'}`}>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // Default to first variant if available
                                      const defaultVariant = product.variants[0]?.weight || '';
                                      setNewCombo({
                                        ...newCombo,
                                        selectedProducts: [...newCombo.selectedProducts, { productId: product.id, variantWeight: defaultVariant }]
                                      });
                                    } else {
                                      setNewCombo({
                                        ...newCombo,
                                        selectedProducts: newCombo.selectedProducts.filter(p => p.productId !== product.id)
                                      });
                                    }
                                  }}
                                  className="rounded text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{product.name}</span>
                              </label>

                              {isSelected && (
                                <div className="ml-6 mt-2">
                                  <select
                                    value={selectedVariant}
                                    onChange={(e) => {
                                      setNewCombo({
                                        ...newCombo,
                                        selectedProducts: newCombo.selectedProducts.map(p =>
                                          p.productId === product.id ? { ...p, variantWeight: e.target.value } : p
                                        )
                                      });
                                    }}
                                    className="text-xs w-full p-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                  >
                                    {product.variants.map(v => (
                                      <option key={v.weight} value={v.weight}>{v.weight} - ₹{v.price}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                      <input
                        type="number"
                        value={newCombo.originalPrice}
                        onChange={(e) => setNewCombo({ ...newCombo, originalPrice: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Combo Price (₹)</label>
                      <input
                        type="number"
                        value={newCombo.comboPrice}
                        onChange={(e) => setNewCombo({ ...newCombo, comboPrice: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        value={newCombo.stock}
                        onChange={(e) => setNewCombo({ ...newCombo, stock: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleAddProduct}
                      className="w-full mt-8 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                      <Plus size={20} />
                      Add Combo
                    </button>
                  </div>
                </div>
              ) : (
                /* Existing Product Form */
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g., Mango Avakaya"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Describe your pickle..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="Mango">Mango</option>
                        <option value="Lemon">Lemon</option>
                        <option value="Mixed">Mixed</option>
                        <option value="Ginger">Ginger</option>
                        <option value="Garlic">Garlic</option>
                        <option value="Fryums">Fryums</option>
                        <option value="Powders">Powders</option>
                        <option value="Specialty">Specialty</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                      <input
                        type="text"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        placeholder="https://example.com/image.jpg or emoji 🥭"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {newProduct.image && (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-500 mb-2">Preview:</p>
                        {newProduct.image.startsWith('http') ? (
                          <img
                            src={newProduct.image}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-6xl">{newProduct.image}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column - Variants */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Weight Variants & Stock *</label>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        {newProduct.variants.map((variant, index) => (
                          <div key={variant.weight} className="flex items-center gap-4 bg-white p-3 rounded-lg border">
                            <label className="flex items-center gap-2 w-24">
                              <input
                                type="checkbox"
                                checked={variant.enabled}
                                onChange={(e) => {
                                  const newVariants = [...newProduct.variants];
                                  newVariants[index].enabled = e.target.checked;
                                  setNewProduct({ ...newProduct, variants: newVariants });
                                }}
                                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                              />
                              <span className="font-medium text-gray-700">{variant.weight}</span>
                            </label>

                            <div className="flex-1">
                              <label className="text-xs text-gray-500">Price (₹)</label>
                              <input
                                type="number"
                                value={variant.price}
                                onChange={(e) => {
                                  const newVariants = [...newProduct.variants];
                                  newVariants[index].price = Number(e.target.value);
                                  setNewProduct({ ...newProduct, variants: newVariants });
                                }}
                                disabled={!variant.enabled}
                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-400"
                              />
                            </div>

                            <div className="flex-1">
                              <label className="text-xs text-gray-500">Stock</label>
                              <input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => {
                                  const newVariants = [...newProduct.variants];
                                  newVariants[index].stock = Number(e.target.value);
                                  setNewProduct({ ...newProduct, variants: newVariants });
                                }}
                                disabled={!variant.enabled}
                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-400"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={newProduct.bestSeller}
                        onChange={(e) => setNewProduct({ ...newProduct, bestSeller: e.target.checked })}
                        className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                      />
                      <div>
                        <p className="font-medium text-gray-700">Mark as Best Seller</p>
                        <p className="text-sm text-gray-500">Shows "Best Seller" badge on product</p>
                      </div>
                    </div>

                    <button
                      onClick={handleAddProduct}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                      <Plus size={20} />
                      Add Product
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  All Products ({products.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-600 text-sm">
                      <th className="px-6 py-3">Image</th>
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Variants & Prices</th>
                      <th className="px-6 py-3">Stock</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {product.image.startsWith('http') ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-3xl">{product.image}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            {product.bestSeller && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                ⭐ Best Seller
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {product.variants.map((v) => (
                              <div key={v.weight} className="text-sm">
                                <span className="font-medium">{v.weight}:</span>{' '}
                                <span className="text-green-600">₹{v.price}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {product.variants.map((v) => (
                              <div key={v.weight} className="text-sm flex items-center gap-2">
                                <span className="font-medium">{v.weight}:</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${v.stock > 10 ? 'bg-green-100 text-green-700' :
                                  v.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                  {v.stock} pcs
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {products.length === 0 && (
                <div className="p-12 text-center">
                  <Image className="mx-auto text-gray-300 mb-4" size={60} />
                  <p className="text-gray-500">No products added yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {sortedOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package className="mx-auto text-gray-300 mb-4" size={60} />
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              sortedOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        <div>
                          <p className="font-mono font-bold text-gray-800">{order.id}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{order.userName}</p>
                        <p className="text-gray-500">{order.userPhone}</p>
                      </div>
                      <div className="font-bold text-green-700">₹{order.finalAmount}</div>
                      <select
                        value={order.status}
                        onChange={(e) => {
                          updateOrderStatus(order.id, e.target.value as Order['status']);
                          sendWhatsAppUpdate(order, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="border-t p-6 bg-gray-50">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={`${item.product.id}-${item.variant.weight}-${idx}`} className="flex items-center gap-2 text-sm">
                                <span>{item.product.image}</span>
                                <span>{item.product.name} ({item.variant.weight})</span>
                                <span className="text-gray-500">×{item.quantity}</span>
                                <span className="ml-auto font-medium">₹{item.variant.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Delivery Address</h4>
                          <p className="text-sm text-gray-600">
                            {order.address.street}<br />
                            {order.address.city}, {order.address.state}<br />
                            {order.address.pincode}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Payment</h4>
                          <p className="text-sm text-gray-600">
                            Method: {order.paymentMethod.toUpperCase()}<br />
                            Transaction: {order.transactionId}<br />
                            {order.couponCode && <>Coupon: {order.couponCode}<br /></>}
                          </p>
                        </div>
                      </div>

                      {/* Tracking Details Section */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-4">Tracking Details</h4>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                          <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Carrier</label>
                            <select
                              key={`carrier-select-${order.id}-${order.carrier}`}
                              defaultValue={order.carrier || ''}
                              id={`carrier-${order.id}`} // Use ID to access value in handler
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">Select Carrier</option>
                              {TRACKING_CARRIERS.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Tracking ID</label>
                            <input
                              key={`tracking-input-${order.id}-${order.trackingId}`}
                              type="text"
                              defaultValue={order.trackingId || ''}
                              id={`tracking-${order.id}`} // Use ID to access value in handler
                              placeholder="Enter Tracking Number"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const carrierSelect = document.getElementById(`carrier-${order.id}`) as HTMLSelectElement;
                              const trackingInput = document.getElementById(`tracking-${order.id}`) as HTMLInputElement;
                              if (carrierSelect && trackingInput) {
                                if (!trackingInput.value) {
                                  alert('Please enter a tracking ID');
                                  return;
                                }
                                updateOrderTracking(order.id, trackingInput.value, carrierSelect.value || 'Other');
                                alert('Tracking details updated!');
                                sendWhatsAppUpdate(order, 'shipped');
                              }
                            }}
                            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                          >
                            Update Tracking
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                        <button
                          onClick={() => printOrderLabel(order)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          <Printer size={16} />
                          Print Label
                        </button>
                        <button
                          onClick={() => {
                            const invoiceWindow = window.open('', '_blank');
                            if (!invoiceWindow) return;
                            const invoiceHtml = `
                              <!DOCTYPE html>
                              <html>
                              <head>
                                <title>Invoice - ${order.id}</title>
                                <style>
                                  body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                                  .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 20px; }
                                  .header h1 { color: #16a34a; margin: 0; }
                                  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                  th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                                  th { background: #f3f4f6; }
                                  .total { text-align: right; font-weight: bold; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <img src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg" alt="VP" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid #16a34a;" />
                                  <h1>Vaddadi Pickles</h1>
                                  <p>INVOICE</p>
                                </div>
                                <p><strong>Invoice:</strong> INV-${order.id}</p>
                                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                                <p><strong>Customer:</strong> ${order.userName}</p>
                                <table>
                                  <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                                  ${order.items.map(i => `<tr><td>${i.product.name} (${i.variant.weight})</td><td>${i.quantity}</td><td>₹${i.variant.price}</td><td>₹${i.variant.price * i.quantity}</td></tr>`).join('')}
                                </table>
                                <p class="total">Grand Total: ₹${order.finalAmount}</p>
                                <script>window.print();</script>
                              </body>
                              </html>
                            `;
                            invoiceWindow.document.write(invoiceHtml);
                            invoiceWindow.document.close();
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
                        >
                          <FileText size={16} />
                          Invoice
                        </button>
                        <button
                          onClick={() => sendWhatsAppUpdate(order, order.status)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                        >
                          <MessageCircle size={16} />
                          WhatsApp Update
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Approvals</h2>
            {orders.filter((o) => o.paymentStatus === 'awaiting_approval').length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <CheckCircle className="mx-auto text-green-300 mb-4" size={60} />
                <p className="text-gray-500">No pending payment approvals</p>
              </div>
            ) : (
              orders
                .filter((o) => o.paymentStatus === 'awaiting_approval')
                .map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-mono font-bold text-gray-800">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.userName} • {order.userPhone}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Transaction ID</p>
                        <p className="font-mono font-bold text-blue-600">{order.transactionId}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-xl font-bold text-green-700">₹{order.finalAmount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Method</p>
                        <p className="font-medium uppercase">{order.paymentMethod}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            updatePaymentStatus(order.id, 'approved');
                            sendWhatsAppUpdate(order, 'payment_approved');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => updatePaymentStatus(order.id, 'rejected')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Shipping Labels */}
        {activeTab === 'labels' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Shipping Labels</h2>
                  <p className="text-gray-500 text-sm">Print labels to stick on packages before shipping</p>
                </div>
                <button
                  onClick={printBulkLabels}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  <Printer size={20} />
                  Print All Ready Labels
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>💡 Tip:</strong> Labels are ready to print for orders with approved payment and status "Processing" or "Payment Approved".
                  Use A4 paper for best results. Each label is sized to fit 4 per page.
                </p>
              </div>

              {/* Label Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {orders.filter(o => o.paymentStatus === 'approved' && (o.status === 'processing' || o.status === 'payment_approved')).length}
                  </p>
                  <p className="text-sm text-green-600">Ready to Print</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {orders.filter(o => o.status === 'shipped').length}
                  </p>
                  <p className="text-sm text-blue-600">Shipped</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-700">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                  <p className="text-sm text-purple-600">Delivered</p>
                </div>
              </div>
            </div>

            {/* Individual Labels */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedOrders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${order.paymentStatus === 'approved' ? 'border-green-500' : 'border-gray-200'
                    }`}
                >
                  {/* Label Preview */}
                  <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg"
                          alt="VP"
                          className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        />
                        <div>
                          <p className="font-bold">VADDADI PICKLES</p>
                          <p className="text-xs opacity-80">Vijayawada, AP</p>
                        </div>
                      </div>
                      {order.paymentMethod === 'cod' && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          COD
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">SHIP TO:</p>
                      <p className="font-bold text-gray-800">{order.userName}</p>
                      <p className="text-sm text-gray-600">{order.address.street}</p>
                      <p className="text-sm text-gray-600">{order.address.city}, {order.address.state}</p>
                      <p className="text-sm font-bold text-gray-800">PIN: {order.address.pincode}</p>
                      <p className="text-sm text-gray-600 mt-1">📱 {order.userPhone}</p>
                    </div>

                    <div className="border-t border-dashed pt-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order ID:</span>
                        <span className="font-mono font-bold">{order.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Items:</span>
                        <span>{order.items.length} items</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-bold text-green-600">₹{order.finalAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${order.paymentStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          order.paymentStatus === 'awaiting_approval' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => printSingleLabel(order)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                      >
                        <Printer size={16} />
                        Full Label
                      </button>
                      <button
                        onClick={() => printSmallLabel(order)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                        title="Print small sticker label"
                      >
                        <StickyNote size={16} />
                        Small
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedOrders.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package className="mx-auto text-gray-300 mb-4" size={60} />
                <p className="text-gray-500">No orders to generate labels</p>
              </div>
            )}
          </div>
        )}

        {/* Coupons */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            {/* Add Coupon */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Coupon</h3>
              <div className="grid md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Discount"
                  value={newCoupon.discount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as 'percentage' | 'fixed' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
                <input
                  type="number"
                  placeholder="Min Order"
                  value={newCoupon.minOrder}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleAddCoupon}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Add Coupon
                </button>
              </div>
            </div>

            {/* Coupon List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600">
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Discount</th>
                    <th className="px-6 py-3">Min Order</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.code} className="border-t">
                      <td className="px-6 py-4 font-mono font-bold">{coupon.code}</td>
                      <td className="px-6 py-4">
                        {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}
                      </td>
                      <td className="px-6 py-4">₹{coupon.minOrder}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleCoupon(coupon.code)}
                          className={`px-4 py-2 rounded-lg text-sm ${coupon.active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                          {coupon.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
