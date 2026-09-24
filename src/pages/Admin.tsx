import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Users, CreditCard, Tag, LayoutDashboard,
  CheckCircle, XCircle, Clock, FileText, Printer,
  MessageCircle, ChevronDown, ChevronUp, StickyNote,
  Plus, Trash2, ShoppingBag, Image, Settings, Edit, Eye, ShoppingCart, Repeat, ShoppingCart as CartIcon
} from 'lucide-react';
import { useStore } from '../store';
import { Order, Coupon, Product, ProductVariant } from '../types';
import { TRACKING_CARRIERS } from '../utils/tracking';

type Tab = 'dashboard' | 'products' | 'orders' | 'payments' | 'coupons' | 'labels' | 'settings' | 'feedback' | 'abandoned';

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
  const deleteCoupon = useStore((state) => state.deleteCoupon);
  const addProduct = useStore((state) => state.addProduct);
  const updateProduct = useStore((state) => state.updateProduct);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const addCombo = useStore((state) => state.addCombo);
  const combos = useStore((state) => state.combos);
  const deleteCombo = useStore((state) => state.deleteCombo);
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const siteFeedbacks = useStore((state) => state.siteFeedbacks);
  const updateFeedbackStatus = useStore((state) => state.updateFeedbackStatus);
  const abandonedCarts = useStore((state) => state.abandonedCarts);
  const fetchAbandonedCarts = useStore((state) => state.fetchAbandonedCarts);
  const navigate = useNavigate();
  const [draftSettings, setDraftSettings] = useState(settings);

  const dailyVisits = useStore((state) => state.dailyVisits);
  const totalVisits = useStore((state) => state.totalVisits);
  const fetchDailyVisits = useStore((state) => state.fetchDailyVisits);

  useEffect(() => {
    fetchDailyVisits();
    fetchAbandonedCarts();
  }, [fetchDailyVisits, fetchAbandonedCarts]);

  // Sync draft settings with store settings when they change externally
  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);
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
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isCombo, setIsCombo] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'mango',
    image: '',
    variants: [
      { weight: '250g', price: 149, mrp: 199, stock: 50, enabled: true },
      { weight: '500g', price: 279, mrp: 349, stock: 50, enabled: true },
      { weight: '1kg', price: 529, mrp: 699, stock: 30, enabled: true },
    ],
    bestSeller: false,
    hasNoGarlicOption: false,
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

  const handleAddProduct = async () => {
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

      await addCombo(combo);

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
      .map(v => ({ weight: v.weight, price: v.price, mrp: v.mrp, stock: v.stock }));

    if (enabledVariants.length === 0) {
      alert('Please enable at least one weight variant');
      return;
    }

    const product: Product = {
      id: editingProductId || `prod_${Date.now()}`,
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      image: newProduct.image,
      variants: enabledVariants,
      inStock: enabledVariants.some(v => v.stock > 0),
      rating: editingProductId ? (products.find(p => p.id === editingProductId)?.rating || 4.5) : 4.5,
      reviews: editingProductId ? (products.find(p => p.id === editingProductId)?.reviews || 0) : 0,
      bestSeller: newProduct.bestSeller,
      hasNoGarlicOption: newProduct.hasNoGarlicOption,
    };

    if (editingProductId) {
      await updateProduct(product);
      setEditingProductId(null);
      alert('Product updated successfully!');
    } else {
      await addProduct(product);
      alert('Product added successfully!');
    }

    // Reset form
    setNewProduct({
      name: '',
      description: '',
      category: 'mango',
      image: '',
      variants: [
        { weight: '250g', price: 149, mrp: 199, stock: 50, enabled: true },
        { weight: '500g', price: 279, mrp: 349, stock: 50, enabled: true },
        { weight: '1kg', price: 529, mrp: 699, stock: 30, enabled: true },
      ],
      bestSeller: false,
      hasNoGarlicOption: false,
    });
  };

  const handleEditProduct = (product: Product) => {
    setIsCombo(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setNewProduct({
      name: product.name,
      description: product.description,
      category: product.category,
      image: product.image,
      variants: product.variants.map(v => ({...v, enabled: true})),
      bestSeller: product.bestSeller || false,
      hasNoGarlicOption: product.hasNoGarlicOption || false,
    });
    setEditingProductId(product.id);
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

  // Analytics calculations
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaysOrdersCount = orders.filter(o => new Date(o.createdAt) >= todayStart).length;
  
  const customerOrderCounts = orders.reduce((acc, order) => {
    acc[order.userPhone] = (acc[order.userPhone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const repeatCustomersCount = Object.values(customerOrderCounts).filter(count => count > 1).length;

  const todaysRevenue = orders
    .filter(o => o.paymentStatus === 'approved' && new Date(o.createdAt) >= todayStart)
    .reduce((sum, o) => sum + o.finalAmount, 0);

  const earliestOrderDates = orders.reduce((acc, order) => {
    const orderDate = new Date(order.createdAt).getTime();
    if (!acc[order.userPhone] || orderDate < acc[order.userPhone]) {
      acc[order.userPhone] = orderDate;
    }
    return acc;
  }, {} as Record<string, number>);
  const todaysNewCustomersCount = Object.values(earliestOrderDates)
    .filter(date => date >= todayStart.getTime()).length;

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
          .label-header .logo { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid white; margin-bottom: 8px; }
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
          .handle-care { text-align: center; margin-top: 15px; padding: 8px; background: #fef2f2; border-radius: 4px; font-size: 16px; font-weight: bold; color: #991b1b; }
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
            <p>Premium Handmade Pickles | Est. 2026</p>
          </div>
          
          ${codBadge}
          
          <div class="content">
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
            
            <div class="from-box">
              <div class="title">FROM:</div>
              <div class="text">
                ${settings.businessAddress.name}, ${settings.businessAddress.street}<br>
                ${settings.businessAddress.city}, ${settings.businessAddress.state} - ${settings.businessAddress.pincode} | Ph: ${settings.businessAddress.phone}
              </div>
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
              ⚠️ HANDLE WITH CARE
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
            <h2>Vaddadi Pickles</h2>
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
          @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39&family=Inter:wght@400;600;700;800;900&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 20px; background: #e5e7eb; display: flex; justify-content: center; margin: 0; }
          .label { background: white; width: 4in; min-height: 6in; border: 3px solid #000; box-sizing: border-box; display: flex; flex-direction: column; color: #000; }
          .row { border-bottom: 2px solid #000; display: flex; width: 100%; box-sizing: border-box; }
          .col { border-right: 2px solid #000; display: flex; flex-direction: column; padding: 10px; box-sizing: border-box; }
          .col:last-child { border-right: none; }
          
          .courier-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: #000; color: #fff; }
          .courier-header h1 { margin: 0; font-size: 24px; font-weight: 900; font-style: italic; letter-spacing: 1px; }
          .courier-header p { margin: 0; font-size: 14px; font-weight: 700; border: 2px solid #fff; padding: 2px 8px; border-radius: 4px; }
          
          .routing-code { font-size: 48px; font-weight: 900; text-align: center; padding: 10px; letter-spacing: 2px; }
          
          .barcode-container { padding: 15px 10px; text-align: center; }
          .barcode-font { font-family: 'Libre Barcode 39', cursive; font-size: 64px; line-height: 1; margin-bottom: 5px; font-weight: normal; }
          .barcode-text { font-size: 14px; font-weight: 600; letter-spacing: 2px; font-family: monospace; }
          
          .address-block { padding: 12px; flex: 1; }
          .address-title { font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 5px; }
          
          .from-address { font-size: 11px; line-height: 1.4; }
          .from-address strong { font-size: 12px; }
          
          .to-address { font-size: 14px; line-height: 1.5; }
          .to-address strong { font-size: 20px; display: block; margin-bottom: 4px; }
          .to-phone { font-size: 16px; font-weight: 800; margin-top: 8px; display: inline-block; border: 2px solid #000; padding: 4px 8px; }
          
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; width: 100%; }
          .detail-item { padding: 8px 12px; border-bottom: 2px solid #000; border-right: 2px solid #000; }
          .detail-item:nth-child(even) { border-right: none; }
          .detail-label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #4b5563; }
          .detail-value { font-size: 14px; font-weight: 800; }
          
          .payment-box { padding: 15px; text-align: center; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
          .payment-prepaid { background: #000; color: #fff; }
          .payment-cod { background: #fff; color: #000; border: 4px solid #000; margin: 10px; }
          
          .footer-warning { background: #000; color: #fff; text-align: center; padding: 12px; font-size: 20px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-top: auto; }
          
          @media print { 
            body { background: white; padding: 0; }
            .label { border: none; width: 100%; height: auto; }
            .payment-prepaid { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .courier-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .footer-warning { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="courier-header">
            <h1>VP EXPRESS</h1>
            <p>STANDARD</p>
          </div>
          
          <div class="row">
            <div class="routing-code" style="width: 100%;">${order.address.pincode}</div>
          </div>
          
          <div class="row">
            <div class="barcode-container" style="width: 100%;">
              <div class="barcode-font">*${order.id.slice(0, 8).toUpperCase()}*</div>
              <div class="barcode-text">${order.id.toUpperCase()}</div>
            </div>
          </div>
          
          <div class="row" style="flex: 1;">
            <div class="col" style="flex: 1; padding: 15px;">
              <div class="address-title">SHIP TO:</div>
              <div class="to-address">
                <strong>${order.userName.toUpperCase()}</strong>
                ${order.address.street.toUpperCase()}<br>
                ${order.address.city.toUpperCase()}, ${order.address.state.toUpperCase()}<br>
                PIN: ${order.address.pincode}<br>
                <div class="to-phone">PH: ${order.userPhone}</div>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col" style="flex: 1; padding: 15px;">
              <div class="address-title">RETURN TO:</div>
              <div class="from-address">
                <strong>${settings.businessAddress.name.toUpperCase()}</strong><br>
                Sujathanagar, Visakhapatnam<br>
                Andhra Pradesh - 530051<br>
                PH: 8008129309
              </div>
            </div>
          </div>
          
          <div class="row" style="border-bottom: none;">
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Order Date</div>
                <div class="detail-value">${new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Weight (Est)</div>
                <div class="detail-value">0.5 KG</div>
              </div>
              <div class="detail-item" style="border-bottom: none;">
                <div class="detail-label">Items</div>
                <div class="detail-value">${order.items.reduce((acc, item) => acc + item.quantity, 0)}</div>
              </div>
              <div class="detail-item" style="border-bottom: none;">
                <div class="detail-label">Invoice Value</div>
                <div class="detail-value">₹${order.finalAmount}</div>
              </div>
            </div>
          </div>
          
          <div class="row" style="border-top: 2px solid #000;">
            <div style="width: 100%;">
              ${order.paymentMethod === 'cod' 
                ? `<div class="payment-box payment-cod">COD: ₹${order.finalAmount}</div>` 
                : `<div class="payment-box payment-prepaid">PREPAID</div>`}
            </div>
          </div>
          
          <div class="footer-warning">
            ⚠️ HANDLE WITH CARE ⚠️
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
    const trimmedCode = newCoupon.code?.trim();
    if (!trimmedCode) return;
    addCoupon({ ...newCoupon, code: trimmedCode } as Coupon);
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
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg"
              alt="Vaddadi Pickles"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-green-500"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-lg md:text-xl font-bold">Vaddadi Pickles Admin</h1>
              <p className="text-gray-400 text-xs md:text-sm">Manage orders, payments & coupons</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition text-sm flex items-center justify-center gap-2"
          >
            Back to Store
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sticky top-[80px] sm:top-[88px] bg-gray-100 z-40">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: ShoppingBag },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'payments', label: 'Payments', icon: CreditCard, badge: pendingPayments },
            { id: 'labels', label: 'Labels', icon: StickyNote },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'abandoned', label: 'Abandoned', icon: CartIcon, badge: abandonedCarts.length || undefined },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'feedback', label: 'Feedback', icon: MessageCircle, badge: siteFeedbacks.filter(f => f.status === 'new').length || undefined },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition whitespace-nowrap ${activeTab === tab.id
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <tab.icon size={18} className="md:w-5 md:h-5" />
              <span className="text-sm md:text-base">{tab.label}</span>
              {tab.badge ? (
                <span className="bg-red-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full">{tab.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <Package className="text-blue-500" size={24} />
                  <span className="text-xl md:text-3xl font-bold text-gray-800">{orders.length}</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Total Orders</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <Clock className="text-yellow-500" size={24} />
                  <span className="text-xl md:text-3xl font-bold text-gray-800">{pendingPayments}</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Pending Payments</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <CreditCard className="text-green-500" size={24} />
                  <span className="text-xl md:text-3xl font-bold text-gray-800">₹{totalRevenue}</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Total Revenue</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <Users className="text-purple-500" size={24} />
                  <span className="text-xl md:text-3xl font-bold text-gray-800">{new Set(orders.map(o => o.userId)).size}</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Total Customers</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <Tag className="text-red-500" size={24} />
                  <span className="text-xl md:text-3xl font-bold text-gray-800">
                    ₹{orders
                      .filter((o) => o.paymentStatus === 'approved')
                      .reduce((sum, o) => sum + (o.discount || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Coupon Discounts</p>
              </div>

              {/* Analytics Section */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <Eye className="text-teal-500" size={24} />
                  <span className="text-xl md:text-3xl font-bold text-gray-800">{dailyVisits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 text-sm md:text-base">Today's Visits</p>
                  <p className="text-gray-400 text-xs text-right">Total: {totalVisits}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <ShoppingCart className="text-indigo-500" size={24} />
                  <span className="text-xl md:text-3xl font-bold text-gray-800">{todaysOrdersCount}</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Today's Orders</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <CreditCard className="text-emerald-500" size={24} />
                  <span className="text-xl md:text-3xl font-bold text-gray-800">₹{todaysRevenue.toFixed(0)}</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Today's Revenue</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <Users className="text-blue-500" size={24} />
                  <span className="text-xl md:text-3xl font-bold text-gray-800">{todaysNewCustomersCount}</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Today's New Customers</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <Repeat className="text-orange-500" size={24} />
                  <span className="text-xl md:text-3xl font-bold text-gray-800">{repeatCustomersCount}</span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Repeat Customers</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
              <div className="hidden sm:block overflow-x-auto">
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
                          <div className="w-12 h-12 flex-shrink-0 bg-white rounded flex items-center justify-center text-2xl overflow-hidden border">
                            {combo.image.startsWith('http') || combo.image.startsWith('/') ? (
                              <img
                                src={combo.image}
                                alt={combo.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              combo.image
                            )}
                          </div>
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

              {/* Mobile Recent Orders & Combos Card View */}
              <div className="sm:hidden space-y-4">
                {/* Recent Orders Cards */}
                <div className="space-y-3">
                  {sortedOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-4 border rounded-xl bg-gray-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] font-bold text-gray-400">{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.paymentStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 truncate text-sm">{order.userName}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{order.paymentStatus.replace('_', ' ')}</p>
                        </div>
                        <span className="font-bold text-green-700 text-lg ml-2">₹{order.finalAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Combos Cards */}
                {combos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-purple-700 mt-6 mb-2">Active Combos</h4>
                    {combos.map((combo) => (
                      <div key={combo.id} className="p-4 border border-purple-100 rounded-xl bg-purple-50/30 space-y-3">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg flex items-center justify-center text-3xl overflow-hidden border">
                            {combo.image.startsWith('http') || combo.image.startsWith('/') ? (
                              <img
                                src={combo.image}
                                alt={combo.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              combo.image
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-gray-800 text-sm">{combo.name}</h5>
                            <span className="text-[10px] text-purple-600 font-semibold uppercase">Combo Item</span>
                          </div>
                          <button
                            onClick={() => deleteCombo(combo.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg h-fit"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-purple-100">
                          <div className="text-xs">
                            <span className="text-green-600 font-bold">₹{combo.comboPrice}</span>{' '}
                            <span className="text-gray-400 line-through ml-1">₹{combo.originalPrice}</span>
                          </div>
                          <span className="text-[10px] text-gray-500">{combo.stock} Packs in stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Abandoned Carts */}
        {activeTab === 'abandoned' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <CartIcon className="text-orange-500" />
                Abandoned Carts
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items in Cart</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cart Total</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {abandonedCarts.map((cartInfo) => {
                    const cartTotal = cartInfo.cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
                    const handleRemind = () => {
                      const msg = `Hi ${cartInfo.name}, you left some delicious pickles in your cart! 🥒\n\nComplete your order now at vaddadipickles.com/cart to get them delivered to you.\n\nItems:\n${cartInfo.cart.map(item => `- ${item.product.name} (${item.variant.weight}) x${item.quantity}`).join('\n')}\n\nTotal: ₹${cartTotal}`;
                      window.open(`https://wa.me/${cartInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                    };

                    return (
                      <tr key={cartInfo.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 md:px-6 py-4">
                          <div className="font-medium text-gray-900">{cartInfo.name}</div>
                          <div className="text-sm text-gray-500">{cartInfo.phone}</div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {cartInfo.cart.length} item(s)
                          </div>
                          <div className="text-xs text-gray-500 max-w-[200px] truncate">
                            {cartInfo.cart.map(i => i.product.name).join(', ')}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className="font-bold text-gray-900">₹{cartTotal}</span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                          {new Date(cartInfo.updatedAt).toLocaleString()}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <button 
                            onClick={handleRemind}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 transition"
                          >
                            Send Reminder
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {abandonedCarts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No abandoned carts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
                    checked={draftSettings.enableCOD}
                    onChange={() => {
                      setDraftSettings(prev => ({ ...prev, enableCOD: !prev.enableCOD }));
                    }}
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
                    checked={draftSettings.enableBankTransfer}
                    onChange={() => {
                      setDraftSettings(prev => ({ ...prev, enableBankTransfer: !prev.enableBankTransfer }));
                    }}
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-2">
                <p>
                  COD Status: <span className={`font-semibold ${draftSettings.enableCOD ? 'text-green-600' : 'text-red-500'}`}>
                    {draftSettings.enableCOD ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
                <p>
                  Bank Transfer Status: <span className={`font-semibold ${draftSettings.enableBankTransfer ? 'text-blue-600' : 'text-red-500'}`}>
                    {draftSettings.enableBankTransfer ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
              </div>

              {/* Save Button */}
              <div className="border-t pt-6">
                <button
                  onClick={async () => {
                    await updateSettings(draftSettings);
                    alert('Settings saved successfully!');
                  }}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  Save Settings
                </button>
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
                  <h3 className="text-xl font-semibold text-gray-800">
                    {editingProductId ? 'Edit Product' : 'Add New Item'}
                  </h3>
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
                        <option value="Pickles">Pickles</option>
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
                          <div key={variant.weight} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-white p-3 rounded-lg border">
                            <label className="flex items-center gap-2 w-full sm:w-24">
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

                            <div className="flex w-full gap-2 sm:flex-1">
                              <div className="flex-1">
                                <label className="text-xs text-gray-500">MRP (₹)</label>
                                <input
                                  type="number"
                                  value={variant.mrp}
                                  onChange={(e) => {
                                    const newVariants = [...newProduct.variants];
                                    newVariants[index].mrp = Number(e.target.value);
                                    setNewProduct({ ...newProduct, variants: newVariants });
                                  }}
                                  disabled={!variant.enabled}
                                  className="w-full px-2 sm:px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-400"
                                />
                              </div>

                              <div className="flex-1">
                                <label className="text-xs text-gray-500">Selling (₹)</label>
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => {
                                    const newVariants = [...newProduct.variants];
                                    newVariants[index].price = Number(e.target.value);
                                    setNewProduct({ ...newProduct, variants: newVariants });
                                  }}
                                  disabled={!variant.enabled}
                                  className="w-full px-2 sm:px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-400"
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
                                  className="w-full px-2 sm:px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-400"
                                />
                              </div>
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

                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={newProduct.hasNoGarlicOption}
                        onChange={(e) => setNewProduct({ ...newProduct, hasNoGarlicOption: e.target.checked })}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <div>
                        <p className="font-medium text-gray-700">Enable "No Garlic" Option</p>
                        <p className="text-sm text-gray-500">Allows customers to choose a version without garlic</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {editingProductId && (
                        <button
                          onClick={() => {
                            setEditingProductId(null);
                            setNewProduct({
                              name: '',
                              description: '',
                              category: 'mango',
                              image: '',
                              variants: [
                                { weight: '250g', price: 149, mrp: 199, stock: 50, enabled: true },
                                { weight: '500g', price: 279, mrp: 349, stock: 50, enabled: true },
                                { weight: '1kg', price: 529, mrp: 699, stock: 30, enabled: true },
                              ],
                              bestSeller: false,
                              hasNoGarlicOption: false,
                            });
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={handleAddProduct}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                      >
                        {editingProductId ? <Edit size={20} /> : <Plus size={20} />}
                        {editingProductId ? 'Update Product' : 'Add Product'}
                      </button>
                    </div>
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
                <div className="hidden lg:block overflow-x-auto">
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
                            {product.image.startsWith('http') || product.image.startsWith('/') ? (
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
                                  <span className="text-green-600">₹{v.price}</span>{' '}
                                  <span className="text-gray-400 line-through text-xs">₹{v.mrp}</span>
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Product Cards */}
                <div className="lg:hidden space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white border rounded-xl p-4 space-y-4 shadow-sm">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 flex-shrink-0">
                          {product.image.startsWith('http') || product.image.startsWith('/') ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-4xl flex items-center justify-center h-full bg-gray-50 rounded-lg">
                              {product.image}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-800 truncate">{product.name}</h4>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full mt-1">
                            {product.category}
                          </span>
                          {product.bestSeller && (
                            <span className="ml-2 inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full">
                              ⭐ Best Seller
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Variants & Prices</p>
                          <div className="space-y-1">
                            {product.variants.map((v) => (
                              <div key={v.weight} className="text-xs flex justify-between gap-1">
                                <span className="text-gray-600">{v.weight}:</span>
                                <div className="flex gap-1">
                                  <span className="text-gray-400 line-through">₹{v.mrp}</span>
                                  <span className="font-bold text-green-600">₹{v.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Stock Levels</p>
                          <div className="space-y-1">
                            {product.variants.map((v) => (
                              <div key={v.weight} className="text-xs flex justify-between">
                                <span className="text-gray-600">{v.weight}:</span>
                                <span className={`font-bold ${v.stock > 10 ? 'text-green-600' : v.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {v.stock}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className={`w-full inline-block text-center py-1 rounded-lg text-xs font-semibold ${product.inStock ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
                                <div className="w-8 h-8 flex-shrink-0 bg-white rounded flex items-center justify-center text-lg overflow-hidden border">
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
                                <span className="flex-1 truncate">
                                  {item.product.name} ({item.variant.weight})
                                  {item.noGarlic && <span className="ml-2 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px]">No Garlic</span>}
                                </span>
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
                            className="w-full md:w-auto bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                          >
                            Update Tracking
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                        <button
                          onClick={() => printOrderLabel(order)}
                          className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          <Printer size={16} />
                          Print Label
                        </button>
                        <button
                          onClick={() => {
                            const invoiceWindow = window.open('', '_blank');
                            if (!invoiceWindow) return;
                            const itemsHtml = order.items.map(item => `
                              <tr class="item-row">
                                <td>
                                  <div class="item-name">${item.product.name}</div>
                                  <div class="item-weight">
                                    ${item.variant.weight}
                                    ${item.noGarlic ? '<span style="margin-left: 8px; background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 9999px; font-size: 10px;">No Garlic</span>' : ''}
                                  </div>
                                </td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">₹${item.variant.price}</td>
                                <td style="text-align: right; font-weight: 600;">₹${item.variant.price * item.quantity}</td>
                              </tr>
                            `).join('');

                            const invoiceHtml = `
                              <!DOCTYPE html>
                              <html>
                              <head>
                                <title>Invoice - ${order.id}</title>
                                <style>
                                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                                  body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1f2937; line-height: 1.5; }
                                  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6; }
                                  .logo-container { display: flex; align-items: center; gap: 15px; }
                                  .logo { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; }
                                  .brand h1 { margin: 0; font-size: 24px; color: #111827; letter-spacing: -0.5px; }
                                  .brand p { margin: 0; font-size: 14px; color: #6b7280; }
                                  .invoice-title h2 { margin: 0; font-size: 32px; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; text-align: right; }
                                  .invoice-title p { margin: 4px 0 0 0; font-size: 14px; color: #6b7280; text-align: right; }
                                  .details-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; margin-bottom: 40px; }
                                  .detail-box h3 { margin: 0 0 10px 0; font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
                                  .detail-box p { margin: 0; font-size: 14px; color: #374151; }
                                  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                  th { padding: 12px 16px; background: #f9fafb; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; }
                                  td { padding: 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
                                  .item-name { font-weight: 600; color: #111827; }
                                  .item-weight { font-size: 12px; color: #6b7280; margin-top: 2px; }
                                  .summary { width: 300px; margin-left: auto; }
                                  .summary-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #4b5563; }
                                  .summary-row.total { font-size: 18px; font-weight: 700; color: #16a34a; border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 5px; }
                                  .discount { color: #dc2626; }
                                  .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 14px; color: #6b7280; }
                                  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div class="logo-container">
                                    <img src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg" alt="Vaddadi Pickles" class="logo" />
                                    <div class="brand">
                                      <h1>Vaddadi Pickles</h1>
                                      <p>Authentic Homemade Pickles<br>Sujathanagar, Visakhapatnam, Andhra Pradesh - 530051</p>
                                    </div>
                                  </div>
                                  <div class="invoice-title">
                                    <h2>INVOICE</h2>
                                    <p>#INV-${order.id.slice(-8).toUpperCase()}</p>
                                  </div>
                                </div>

                                <div class="details-grid">
                                  <div class="detail-box">
                                    <h3>Billed To</h3>
                                    <p><strong>${order.userName}</strong><br>${order.userEmail}<br>${order.userPhone}</p>
                                  </div>
                                  <div class="detail-box">
                                    <h3>Shipped To</h3>
                                    <p>${order.address.street}<br>${order.address.city}, ${order.address.state}<br>${order.address.pincode}</p>
                                  </div>
                                  <div class="detail-box">
                                    <h3>Order Details</h3>
                                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br><strong>Order ID:</strong> ${order.id}<br><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
                                  </div>
                                </div>

                                <table>
                                  <thead>
                                    <tr>
                                      <th>Description</th>
                                      <th style="text-align: center;">Qty</th>
                                      <th style="text-align: right;">Price</th>
                                      <th style="text-align: right;">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>${itemsHtml}</tbody>
                                </table>

                                <div class="summary">
                                  <div class="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹${order.total}</span>
                                  </div>
                                  ${order.discount > 0 ? `
                                  <div class="summary-row discount">
                                    <span>Discount (${order.couponCode})</span>
                                    <span>-₹${order.discount}</span>
                                  </div>` : ''}
                                  <div class="summary-row">
                                    <span>Shipping</span>
                                    <span>${order.total >= 500 ? 'Free' : '₹50'}</span>
                                  </div>
                                  <div class="summary-row total">
                                    <span>Grand Total</span>
                                    <span>₹${order.finalAmount}</span>
                                  </div>
                                </div>

                                <div class="footer">
                                  <p>Thank you for your business!<br>For any inquiries, WhatsApp us at <strong>8008129309</strong></p>
                                </div>
                                <script>window.print();</script>
                              </body>
                              </html>
                            `;
                            invoiceWindow.document.write(invoiceHtml);
                            invoiceWindow.document.close();
                          }}
                          className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
                        >
                          <FileText size={16} />
                          Invoice
                        </button>
                        <button
                          onClick={() => sendWhatsAppUpdate(order, order.status)}
                          className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
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
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            updatePaymentStatus(order.id, 'approved');
                            sendWhatsAppUpdate(order, 'payment_approved');
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex-1 sm:flex-none"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => updatePaymentStatus(order.id, 'rejected')}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex-1 sm:flex-none"
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
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Coupon</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Discount"
                  value={newCoupon.discount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                />
                <select
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as 'percentage' | 'fixed' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
                <input
                  type="number"
                  placeholder="Min Order"
                  value={newCoupon.minOrder}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                />
                <button
                  onClick={handleAddCoupon}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm"
                >
                  Add Coupon
                </button>
              </div>
            </div>

            {/* Coupon List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-600">
                      <th className="px-6 py-3">Code</th>
                      <th className="px-6 py-3">Discount</th>
                      <th className="px-6 py-3">Min Order</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.code} className="border-t hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-mono font-bold">{coupon.code}</td>
                        <td className="px-6 py-4">
                          {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}
                        </td>
                        <td className="px-6 py-4">₹{coupon.minOrder}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {coupon.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => toggleCoupon(coupon.code)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium ${coupon.active
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                              {coupon.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete coupon ${coupon.code}?`)) {
                                  deleteCoupon(coupon.code);
                                }
                              }}
                              className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"
                              title="Delete Coupon"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Coupon Cards */}
              <div className="md:hidden divide-y">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="p-4 flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-gray-800">{coupon.code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`} off • Min. ₹{coupon.minOrder}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleCoupon(coupon.code)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${coupon.active
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {coupon.active ? 'Stop' : 'Start'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete coupon ${coupon.code}?`)) {
                            deleteCoupon(coupon.code);
                          }
                        }}
                        className="px-2 py-1.5 bg-red-100 text-red-700 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Customer Feedback</h2>
            
            {siteFeedbacks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                No feedback received yet.
              </div>
            ) : (
              <div className="grid gap-4">
                {siteFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-800">{feedback.name}</h3>
                        <span className="text-sm text-gray-500">({feedback.email})</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{feedback.message}</p>
                      <div className="text-xs text-gray-400">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col gap-2">
                      <select
                        value={feedback.status}
                        onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value as any)}
                        className={`text-sm rounded-lg px-3 py-1.5 border font-medium outline-none ${
                          feedback.status === 'new' ? 'bg-red-50 text-red-700 border-red-200' :
                          feedback.status === 'read' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
