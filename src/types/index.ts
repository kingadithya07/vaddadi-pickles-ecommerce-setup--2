export interface ProductVariant {
  weight: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  variants: ProductVariant[];
  inStock: boolean;
  rating: number;
  reviews: number;
  bestSeller?: boolean;
}

export interface ComboProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  products: { productId: string; variantWeight: string }[]; // Product IDs and variants included in combo
  originalPrice: number;
  comboPrice: number;
  stock: number;
  active: boolean;
}

export interface DisplayImage {
  id: string;
  title: string;
  imageUrl: string;
  type: 'banner' | 'promotional' | 'category' | 'product_highlight';
  linkUrl?: string;
  order: number;
  active: boolean;
}

export interface UserAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  addresses: UserAddress[];
  role: 'customer' | 'admin';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  items: CartItem[];
  total: number;
  discount: number;
  finalAmount: number;
  couponCode?: string;
  address: Address;
  status: 'pending' | 'payment_pending' | 'payment_approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'awaiting_approval' | 'approved' | 'rejected';
  paymentMethod: string;
  transactionId?: string;
  trackingId?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minOrder: number;
  active: boolean;
}

export interface Invoice {
  orderId: string;
  invoiceNumber: string;
  date: string;
  order: Order;
}

export interface StoreSettings {
  upiId: string;
  businessAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  enableCOD: boolean;
  enableBankTransfer: boolean;
}
