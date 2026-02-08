import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant, CartItem, User, Order, Coupon, ComboProduct, DisplayImage, StoreSettings, UserAddress } from '../types';

// Sample Products with variants and stock
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Mango Avakaya',
    description: 'Traditional Andhra style raw mango pickle with mustard and red chili. Authentic homemade taste.',
    image: '🥭',
    category: 'Mango',
    variants: [
      { weight: '250g', price: 149, stock: 50 },
      { weight: '500g', price: 299, stock: 30 },
      { weight: '1kg', price: 549, stock: 20 },
    ],
    inStock: true,
    rating: 4.8,
    reviews: 245,
    bestSeller: true,
  },
  {
    id: '2',
    name: 'Lemon Pickle',
    description: 'Tangy and spicy lemon pickle made with fresh lemons and aromatic spices.',
    image: '🍋',
    category: 'Lemon',
    variants: [
      { weight: '250g', price: 99, stock: 60 },
      { weight: '500g', price: 199, stock: 40 },
      { weight: '1kg', price: 379, stock: 25 },
    ],
    inStock: true,
    rating: 4.6,
    reviews: 189,
    bestSeller: false,
  },
  {
    id: '3',
    name: 'Mixed Vegetable Pickle',
    description: 'A delightful blend of carrots, cauliflower, and green chilies in tangy masala.',
    image: '🥗',
    category: 'Mixed',
    variants: [
      { weight: '250g', price: 129, stock: 45 },
      { weight: '500g', price: 249, stock: 35 },
      { weight: '1kg', price: 449, stock: 18 },
    ],
    inStock: true,
    rating: 4.5,
    reviews: 156,
    bestSeller: false,
  },
  {
    id: '4',
    name: 'Gongura Pickle',
    description: 'Famous Andhra Gongura leaves pickle with a unique sour taste.',
    image: '🌿',
    category: 'Specialty',
    variants: [
      { weight: '250g', price: 139, stock: 55 },
      { weight: '500g', price: 279, stock: 32 },
      { weight: '1kg', price: 529, stock: 15 },
    ],
    inStock: true,
    rating: 4.9,
    reviews: 312,
    bestSeller: true,
  },
  {
    id: '5',
    name: 'Garlic Pickle',
    description: 'Aromatic garlic pickle with the perfect blend of spices and oil.',
    image: '🧄',
    category: 'Specialty',
    variants: [
      { weight: '250g', price: 119, stock: 40 },
      { weight: '500g', price: 229, stock: 28 },
      { weight: '1kg', price: 429, stock: 12 },
    ],
    inStock: true,
    rating: 4.4,
    reviews: 98,
    bestSeller: false,
  },
  {
    id: '6',
    name: 'Tomato Pickle',
    description: 'Sweet and tangy tomato pickle, perfect with rice and rotis.',
    image: '🍅',
    category: 'Mixed',
    variants: [
      { weight: '250g', price: 89, stock: 65 },
      { weight: '500g', price: 189, stock: 45 },
      { weight: '1kg', price: 349, stock: 22 },
    ],
    inStock: true,
    rating: 4.3,
    reviews: 134,
    bestSeller: false,
  },
  {
    id: '7',
    name: 'Red Chili Pickle',
    description: 'Fiery red chili pickle for spice lovers. Extra hot and flavorful.',
    image: '🌶️',
    category: 'Specialty',
    variants: [
      { weight: '250g', price: 129, stock: 50 },
      { weight: '500g', price: 259, stock: 30 },
      { weight: '1kg', price: 489, stock: 16 },
    ],
    inStock: true,
    rating: 4.7,
    reviews: 201,
    bestSeller: true,
  },
  {
    id: '8',
    name: 'Ginger Pickle',
    description: 'Spicy ginger pickle with authentic taste and health benefits.',
    image: '🫚',
    category: 'Ginger',
    variants: [
      { weight: '250g', price: 109, stock: 35 },
      { weight: '500g', price: 219, stock: 25 },
      { weight: '1kg', price: 399, stock: 14 },
    ],
    inStock: true,
    rating: 4.5,
    reviews: 87,
    bestSeller: false,
  },
];

const sampleCombos: ComboProduct[] = [
  {
    id: 'combo1',
    name: 'Family Pack',
    description: 'Perfect combo for families - Mango, Lemon & Mixed pickles',
    image: '🎁',
    products: [
      { productId: '1', variantWeight: '250g' },
      { productId: '2', variantWeight: '250g' },
      { productId: '3', variantWeight: '250g' }
    ],
    originalPrice: 999,
    comboPrice: 799,
    stock: 25,
    active: true,
  },
  {
    id: 'combo2',
    name: 'Starter Kit',
    description: 'Try our best sellers - Mango Avakaya & Gongura',
    image: '⭐',
    products: [
      { productId: '1', variantWeight: '250g' },
      { productId: '4', variantWeight: '250g' }
    ],
    originalPrice: 599,
    comboPrice: 449,
    stock: 30,
    active: true,
  },
  {
    id: 'combo3',
    name: 'Spice Lovers Special',
    description: 'For those who love it hot - Red Chili, Garlic & Ginger',
    image: '🔥',
    products: [
      { productId: '5', variantWeight: '250g' },
      { productId: '7', variantWeight: '250g' },
      { productId: '8', variantWeight: '250g' }
    ],
    originalPrice: 699,
    comboPrice: 549,
    stock: 20,
    active: true,
  },
];

const sampleDisplayImages: DisplayImage[] = [
  {
    id: 'img1',
    title: 'Summer Sale',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200',
    type: 'banner',
    linkUrl: '/products',
    order: 1,
    active: true,
  },
  {
    id: 'img2',
    title: 'New Arrivals',
    imageUrl: 'https://images.unsplash.com/photo-1589135233689-63e7bc9eb702?w=1200',
    type: 'banner',
    linkUrl: '/products',
    order: 2,
    active: true,
  },
  {
    id: 'img3',
    title: 'Mango Pickle Special',
    imageUrl: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=600',
    type: 'promotional',
    linkUrl: '/products?category=Mango',
    order: 1,
    active: true,
  },
];

const defaultSettings: StoreSettings = {
  upiId: '9885192948@ptyes',
  businessAddress: {
    name: 'VADDADI PICKLES',
    street: 'SUJATHANAGAR',
    city: 'VISAKHAPATNAM',
    state: 'ANDHRA PRADESH',
    pincode: '530051',
    phone: '8008129309 (WhatsApp)',
  },
  enableCOD: true,
};

const sampleCoupons: Coupon[] = [
  { code: 'WELCOME10', discount: 10, type: 'percentage', minOrder: 500, active: true },
  { code: 'PICKLE50', discount: 50, type: 'fixed', minOrder: 400, active: true },
  { code: 'FESTIVE20', discount: 20, type: 'percentage', minOrder: 1000, active: true },
];

interface StoreState {
  products: Product[];
  combos: ComboProduct[];
  displayImages: DisplayImage[];
  settings: StoreSettings;
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  isAdmin: boolean;

  // Cart actions
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  clearCart: () => void;

  // User actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  addUserAddress: (address: UserAddress) => void;
  updateUserAddress: (address: UserAddress) => void;
  deleteUserAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;

  // Order actions
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderTracking: (orderId: string, trackingId: string, carrier: string) => void;
  updatePaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;

  // Coupon actions
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;
  toggleCoupon: (code: string) => void;

  // Product actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  // Combo actions
  addCombo: (combo: ComboProduct) => void;
  updateCombo: (combo: ComboProduct) => void;
  deleteCombo: (comboId: string) => void;

  // Display Image actions
  addDisplayImage: (image: DisplayImage) => void;
  updateDisplayImage: (image: DisplayImage) => void;
  deleteDisplayImage: (imageId: string) => void;

  // Settings actions
  updateSettings: (settings: StoreSettings) => void;

  // Admin actions
  setAdmin: (isAdmin: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: sampleProducts,
      combos: sampleCombos,
      displayImages: sampleDisplayImages,
      settings: defaultSettings,
      cart: [],
      user: null,
      orders: [],
      coupons: sampleCoupons,
      appliedCoupon: null,
      isAdmin: false,

      addToCart: (product, variant, quantity = 1) => {
        const cart = get().cart;
        const existing = cart.find(
          (item) => item.product.id === product.id && item.variant.weight === variant.weight
        );
        if (existing) {
          const newQuantity = existing.quantity + quantity;
          if (newQuantity <= 0) {
            set({
              cart: cart.filter(
                (item) => !(item.product.id === product.id && item.variant.weight === variant.weight)
              ),
            });
          } else {
            set({
              cart: cart.map((item) =>
                item.product.id === product.id && item.variant.weight === variant.weight
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            });
          }
        } else if (quantity > 0) {
          set({ cart: [...cart, { product, variant, quantity }] });
        }
      },

      removeFromCart: (productId, weight) => {
        set({
          cart: get().cart.filter(
            (item) => !(item.product.id === productId && item.variant.weight === weight)
          ),
        });
      },

      updateQuantity: (productId, weight, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, weight);
        } else {
          set({
            cart: get().cart.map((item) =>
              item.product.id === productId && item.variant.weight === weight
                ? { ...item, quantity }
                : item
            ),
          });
        }
      },

      clearCart: () => {
        set({ cart: [], appliedCoupon: null });
      },

      login: (user) => {
        set({ user, isAdmin: user.role === 'admin' });
      },

      logout: () => {
        set({ user: null, isAdmin: false });
      },

      updateUser: (user) => {
        set({ user });
      },

      addUserAddress: (address) => {
        const user = get().user;
        if (!user) return;
        const addresses = user.addresses || [];
        if (address.isDefault) {
          addresses.forEach(a => a.isDefault = false);
        }
        set({ user: { ...user, addresses: [...addresses, address] } });
      },

      updateUserAddress: (address) => {
        const user = get().user;
        if (!user) return;
        let addresses = user.addresses || [];
        if (address.isDefault) {
          addresses = addresses.map(a => ({ ...a, isDefault: false }));
        }
        set({
          user: {
            ...user,
            addresses: addresses.map(a => a.id === address.id ? address : a)
          }
        });
      },

      deleteUserAddress: (addressId) => {
        const user = get().user;
        if (!user) return;
        set({
          user: {
            ...user,
            addresses: (user.addresses || []).filter(a => a.id !== addressId)
          }
        });
      },

      setDefaultAddress: (addressId) => {
        const user = get().user;
        if (!user) return;
        set({
          user: {
            ...user,
            addresses: (user.addresses || []).map(a => ({ ...a, isDefault: a.id === addressId }))
          }
        });
      },

      createOrder: (order) => {
        set({ orders: [...get().orders, order] });
      },

      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map((order) =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order
          ),
        });
      },

      updatePaymentStatus: (orderId, paymentStatus) => {
        set({
          orders: get().orders.map((order) =>
            order.id === orderId
              ? {
                ...order,
                paymentStatus,
                status: paymentStatus === 'approved' ? 'payment_approved' : order.status,
                updatedAt: new Date().toISOString(),
              }
              : order
          ),
        });
      },

      updateOrderTracking: (orderId, trackingId, carrier) => {
        set({
          orders: get().orders.map((order) =>
            order.id === orderId
              ? {
                ...order,
                trackingId,
                carrier,
                status: 'shipped', // Auto-update status to shipped when tracking is added
                updatedAt: new Date().toISOString(),
              }
              : order
          ),
        });
      },

      applyCoupon: (code) => {
        const coupon = get().coupons.find(
          (c) => c.code.toUpperCase() === code.toUpperCase() && c.active
        );
        if (!coupon) {
          return { success: false, message: 'Invalid coupon code' };
        }
        const cartTotal = get().cart.reduce(
          (sum, item) => sum + item.variant.price * item.quantity,
          0
        );
        if (cartTotal < coupon.minOrder) {
          return {
            success: false,
            message: `Minimum order amount is ₹${coupon.minOrder}`,
          };
        }
        set({ appliedCoupon: coupon });
        return { success: true, message: 'Coupon applied successfully!' };
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      addCoupon: (coupon) => {
        set({ coupons: [...get().coupons, coupon] });
      },

      toggleCoupon: (code) => {
        set({
          coupons: get().coupons.map((c) =>
            c.code === code ? { ...c, active: !c.active } : c
          ),
        });
      },

      // Product actions
      addProduct: (product) => {
        set({ products: [...get().products, product] });
      },

      updateProduct: (product) => {
        set({
          products: get().products.map((p) =>
            p.id === product.id ? product : p
          ),
        });
      },

      deleteProduct: (productId) => {
        set({
          products: get().products.filter((p) => p.id !== productId),
        });
      },

      // Combo actions
      addCombo: (combo) => {
        set({ combos: [...get().combos, combo] });
      },

      updateCombo: (combo) => {
        set({
          combos: get().combos.map((c) =>
            c.id === combo.id ? combo : c
          ),
        });
      },

      deleteCombo: (comboId) => {
        set({
          combos: get().combos.filter((c) => c.id !== comboId),
        });
      },

      // Display Image actions
      addDisplayImage: (image) => {
        set({ displayImages: [...get().displayImages, image] });
      },

      updateDisplayImage: (image) => {
        set({
          displayImages: get().displayImages.map((i) =>
            i.id === image.id ? image : i
          ),
        });
      },

      deleteDisplayImage: (imageId) => {
        set({
          displayImages: get().displayImages.filter((i) => i.id !== imageId),
        });
      },

      // Settings actions
      updateSettings: (settings) => {
        set({ settings });
      },

      setAdmin: (isAdmin) => {
        set({ isAdmin });
      },
    }),
    {
      name: 'vaddadi-pickles-store',
      version: 6,
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // Migration from version 0 to 2
          return {
            ...persistedState,
            settings: defaultSettings,
          };
        }
        if (version === 1) {
          // Migration from version 1 to 2
          return {
            ...persistedState,
            settings: {
              ...defaultSettings,
              ...(persistedState.settings || {}),
            },
          };
        }
        if (version === 2) {
          // Migration from version 2 to 3 - Reset combos to fix structure mismatch
          return {
            ...persistedState,
            combos: sampleCombos,
          };
        }
        if (version === 3) {
          // Migration from version 3 to 4 - Force update UPI ID
          return {
            ...persistedState,
            settings: {
              ...(persistedState.settings || defaultSettings),
              upiId: '9885192948@ptyes',
            },
          };
        }
        if (version === 4) {
          // Migration from version 4 to 5 - Force update Merchant Name
          return {
            ...persistedState,
            settings: {
              ...(persistedState.settings || defaultSettings),
              businessAddress: {
                ...(persistedState.settings?.businessAddress || defaultSettings.businessAddress),
                name: 'VADDADI PICKLES',
              },
            },
          };
        }
        if (version === 5) {
          // Migration from version 5 to 6 - Force update payment details
          return {
            ...persistedState,
            settings: {
              ...(persistedState.settings || defaultSettings),
              upiId: '9885192948@ptyes',
              businessAddress: {
                ...(persistedState.settings?.businessAddress || defaultSettings.businessAddress),
                name: 'VADDADI PICKLES',
              },
            },
          };
        }
        return persistedState;
      },
    }
  )
);
