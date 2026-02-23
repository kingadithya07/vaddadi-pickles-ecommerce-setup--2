import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant, CartItem, User, Order, Coupon, ComboProduct, DisplayImage, StoreSettings, UserAddress, Review } from '../types';
import { supabase } from '../lib/supabase';

// Sample Products with variants and stock
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Mango Avakaya',
    description: 'Traditional Andhra style raw mango pickle with mustard and red chili. Authentic homemade taste.',
    image: '🥭',
    category: 'Mango',
    variants: [
      { weight: '250g', price: 149, mrp: 199, stock: 50 },
      { weight: '500g', price: 299, mrp: 399, stock: 30 },
      { weight: '1kg', price: 549, mrp: 699, stock: 20 },
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
      { weight: '250g', price: 99, mrp: 149, stock: 60 },
      { weight: '500g', price: 199, mrp: 279, stock: 40 },
      { weight: '1kg', price: 379, mrp: 499, stock: 25 },
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
      { weight: '250g', price: 129, mrp: 179, stock: 45 },
      { weight: '500g', price: 249, mrp: 349, stock: 35 },
      { weight: '1kg', price: 449, mrp: 599, stock: 18 },
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
      { weight: '250g', price: 139, mrp: 189, stock: 55 },
      { weight: '500g', price: 279, mrp: 379, stock: 32 },
      { weight: '1kg', price: 529, mrp: 699, stock: 15 },
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
      { weight: '250g', price: 119, mrp: 159, stock: 40 },
      { weight: '500g', price: 229, mrp: 319, stock: 28 },
      { weight: '1kg', price: 429, mrp: 599, stock: 12 },
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
      { weight: '250g', price: 89, mrp: 129, stock: 65 },
      { weight: '500g', price: 189, mrp: 279, stock: 45 },
      { weight: '1kg', price: 349, mrp: 479, stock: 22 },
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
      { weight: '250g', price: 129, mrp: 179, stock: 50 },
      { weight: '500g', price: 259, mrp: 349, stock: 30 },
      { weight: '1kg', price: 489, mrp: 649, stock: 16 },
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
      { weight: '250g', price: 109, mrp: 159, stock: 35 },
      { weight: '500g', price: 219, mrp: 319, stock: 25 },
      { weight: '1kg', price: 399, mrp: 549, stock: 14 },
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
    name: 'Vaddadi Pickles',
    street: 'Sujathanagar',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530051',
    phone: '8008129309 (WhatsApp)',
  },
  enableCOD: true,
  enableBankTransfer: true,
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
  isLoading: boolean;
  reviews: Record<string, Review[]>; // Product ID to Reviews mapping

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

  // Review actions
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<{ success: boolean; message: string }>;
  fetchReviews: (productId: string) => Promise<void>;

  // Admin actions
  setAdmin: (isAdmin: boolean) => void;

  // Sync actions
  fetchInitialData: () => Promise<void>;
  initializeRealtimeSettings: () => () => void;
  syncCartWithCloud: () => Promise<void>;
  syncProfileWithCloud: () => Promise<void>;
  initializeRealtimeUserSync: () => () => void;
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
      isLoading: false,
      reviews: {},

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
        get().syncCartWithCloud();
      },

      removeFromCart: (productId, weight) => {
        set({
          cart: get().cart.filter(
            (item) => !(item.product.id === productId && item.variant.weight === weight)
          ),
        });
        get().syncCartWithCloud();
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
        get().syncCartWithCloud();
      },

      clearCart: () => {
        set({ cart: [], appliedCoupon: null });
        get().syncCartWithCloud();
      },

      login: (user) => {
        set({ user, isAdmin: user.role === 'admin' });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAdmin: false });
      },

      updateUser: (user) => {
        set({ user });
        get().syncProfileWithCloud();
      },

      addUserAddress: (address) => {
        const user = get().user;
        if (!user) return;
        const addresses = user.addresses || [];
        if (address.isDefault) {
          addresses.forEach(a => a.isDefault = false);
        }
        const updatedUser = { ...user, addresses: [...addresses, address] };
        set({ user: updatedUser });
        get().syncProfileWithCloud();
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
        get().syncProfileWithCloud();
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
        get().syncProfileWithCloud();
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
        get().syncProfileWithCloud();
      },

      createOrder: async (order) => {
        set({ orders: [...get().orders, order] });
        await supabase.from('orders').insert({
          id: order.id,
          user_id: order.userId,
          user_name: order.userName,
          user_email: order.userEmail,
          user_phone: order.userPhone,
          items: order.items,
          total: order.total,
          discount: order.discount,
          final_amount: order.finalAmount,
          coupon_code: order.couponCode,
          address: order.address,
          status: order.status,
          payment_status: order.paymentStatus,
          payment_method: order.paymentMethod,
          transaction_id: order.transactionId,
          tracking_id: order.trackingId,
          carrier: order.carrier,
        });
      },

      updateOrderStatus: async (orderId, status) => {
        set({
          orders: get().orders.map((order) =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order
          ),
        });
        await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
      },

      updatePaymentStatus: async (orderId, paymentStatus) => {
        const updatedAt = new Date().toISOString();
        const status = paymentStatus === 'approved' ? 'payment_approved' : get().orders.find(o => o.id === orderId)?.status;

        set({
          orders: get().orders.map((order) =>
            order.id === orderId
              ? {
                ...order,
                paymentStatus,
                status: status as Order['status'],
                updatedAt,
              }
              : order
          ),
        });

        await supabase.from('orders').update({
          payment_status: paymentStatus,
          status,
          updated_at: updatedAt
        }).eq('id', orderId);
      },

      updateOrderTracking: async (orderId, trackingId, carrier) => {
        const updatedAt = new Date().toISOString();
        set({
          orders: get().orders.map((order) =>
            order.id === orderId
              ? {
                ...order,
                trackingId,
                carrier,
                status: 'shipped',
                updatedAt,
              }
              : order
          ),
        });

        await supabase.from('orders').update({
          tracking_id: trackingId,
          carrier,
          status: 'shipped',
          updated_at: updatedAt
        }).eq('id', orderId);
      },

      applyCoupon: (code) => {
        const trimmedCode = code.trim().toUpperCase();
        const coupon = get().coupons.find(
          (c) => c.code.toUpperCase() === trimmedCode && c.active
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

      addCoupon: async (coupon) => {
        set({ coupons: [...get().coupons, coupon] });
        await supabase.from('coupons').insert({
          code: coupon.code,
          discount: coupon.discount,
          type: coupon.type,
          min_order: coupon.minOrder,
          active: coupon.active,
        });
      },

      toggleCoupon: async (code) => {
        const coupons = get().coupons;
        const coupon = coupons.find(c => c.code === code);
        if (!coupon) return;

        const newActive = !coupon.active;
        set({
          coupons: coupons.map((c) =>
            c.code === code ? { ...c, active: newActive } : c
          ),
        });

        await supabase.from('coupons').update({ active: newActive }).eq('code', code);
      },

      // Product actions
      addProduct: async (product) => {
        set({ products: [...get().products, product] });
        await supabase.from('products').insert({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          image: product.image,
          variants: product.variants,
          in_stock: product.inStock,
          rating: product.rating,
          reviews: product.reviews,
          best_seller: product.bestSeller,
          is_combo: false,
        });
      },

      updateProduct: async (product) => {
        set({
          products: get().products.map((p) =>
            p.id === product.id ? product : p
          ),
        });
        await supabase.from('products').update({
          name: product.name,
          description: product.description,
          category: product.category,
          image: product.image,
          variants: product.variants,
          in_stock: product.inStock,
          rating: product.rating,
          reviews: product.reviews,
          best_seller: product.bestSeller,
          updated_at: new Date().toISOString(),
        }).eq('id', product.id);
      },

      deleteProduct: async (productId) => {
        set({
          products: get().products.filter((p) => p.id !== productId),
        });
        await supabase.from('products').delete().eq('id', productId);
      },

      // Combo actions
      addCombo: async (combo) => {
        set({ combos: [...get().combos, combo] });
        await supabase.from('products').insert({
          id: combo.id,
          name: combo.name,
          description: combo.description,
          image: combo.image,
          combo_products: combo.products,
          original_price: combo.originalPrice,
          combo_price: combo.comboPrice,
          stock: combo.stock,
          active: combo.active,
          is_combo: true,
          variants: [], // Empty variants for combos
        });
      },

      updateCombo: async (combo) => {
        set({
          combos: get().combos.map((c) =>
            c.id === combo.id ? combo : c
          ),
        });
        await supabase.from('products').update({
          name: combo.name,
          description: combo.description,
          image: combo.image,
          combo_products: combo.products,
          original_price: combo.originalPrice,
          combo_price: combo.comboPrice,
          stock: combo.stock,
          active: combo.active,
          updated_at: new Date().toISOString(),
        }).eq('id', combo.id);
      },

      deleteCombo: async (comboId) => {
        set({
          combos: get().combos.filter((c) => c.id !== comboId),
        });
        await supabase.from('products').delete().eq('id', comboId);
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
      updateSettings: async (settings) => {
        try {
          console.log('Updating settings:', settings);

          const { data, error } = await supabase.from('store_settings').update({
            business_address: settings.businessAddress,
            enable_cod: settings.enableCOD,
            enable_bank_transfer: settings.enableBankTransfer,
            upi_id: settings.upiId,
            updated_at: new Date().toISOString(),
          }).eq('id', 1).select();

          if (error) {
            console.error('Error updating settings:', error);
            throw error;
          }

          console.log('Settings updated successfully in database:', data);
          set({ settings });
        } catch (error) {
          console.error('Failed to update settings:', error);
          // Revert to previous settings on error
          const { data: settingsData } = await supabase.from('store_settings').select('*').eq('id', 1).single();
          if (settingsData) {
            set({
              settings: {
                upiId: settingsData.upi_id || defaultSettings.upiId,
                businessAddress: settingsData.business_address,
                enableCOD: settingsData.enable_cod ?? defaultSettings.enableCOD,
                enableBankTransfer: settingsData.enable_bank_transfer ?? defaultSettings.enableBankTransfer,
              }
            });
          }
        }
      },

      setAdmin: (isAdmin: boolean) => {
        set({ isAdmin });
      },

      addReview: async (reviewData) => {
        const { data, error } = await supabase.from('reviews').insert({
          product_id: reviewData.productId,
          user_id: reviewData.userId,
          user_name: reviewData.userName,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }).select().single();

        if (error) {
          return { success: false, message: error.message };
        }

        const newReview: Review = {
          id: data.id,
          productId: data.product_id,
          userId: data.user_id,
          userName: data.user_name,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.created_at,
        };

        const currentReviews = get().reviews[reviewData.productId] || [];
        set({
          reviews: {
            ...get().reviews,
            [reviewData.productId]: [newReview, ...currentReviews],
          },
        });

        // Fetch product again to update its rating/reviews count (updated by DB trigger)
        const { data: updatedProduct } = await supabase.from('products').select('*').eq('id', reviewData.productId).single();
        if (updatedProduct) {
          set({
            products: get().products.map(p => p.id === reviewData.productId ? {
              ...p,
              rating: Number(updatedProduct.rating),
              reviews: updatedProduct.reviews,
            } : p)
          });
        }

        return { success: true, message: 'Review submitted successfully!' };
      },

      fetchReviews: async (productId) => {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formattedReviews: Review[] = data.map(r => ({
            id: r.id,
            productId: r.product_id,
            userId: r.user_id,
            userName: r.user_name,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at,
          }));

          set({
            reviews: {
              ...get().reviews,
              [productId]: formattedReviews,
            },
          });
        }
      },

      fetchInitialData: async () => {
        set({ isLoading: true });
        try {
          // Fetch Products
          const { data: productsData } = await supabase.from('products').select('*');
          if (productsData) {
            const products = productsData.filter(p => !p.is_combo).map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              category: p.category,
              image: p.image,
              variants: p.variants,
              inStock: p.in_stock,
              rating: Number(p.rating),
              reviews: p.reviews,
              bestSeller: p.best_seller,
            }));
            const combos = productsData.filter(p => p.is_combo).map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              image: p.image,
              products: p.combo_products,
              originalPrice: p.original_price, // Assuming these columns exist in my schema update or handled via JSON
              comboPrice: p.combo_price,
              stock: p.stock,
              active: p.active,
            }));
            if (products.length > 0) set({ products });
            if (combos.length > 0) set({ combos });
          }

          // Fetch Coupons
          const { data: couponsData } = await supabase.from('coupons').select('*');
          if (couponsData) {
            set({
              coupons: couponsData.map(c => ({
                code: c.code,
                discount: Number(c.discount),
                type: c.type,
                minOrder: Number(c.min_order),
                active: c.active,
              }))
            });
          }

          // Fetch Settings
          const { data: settingsData } = await supabase.from('store_settings').select('*').eq('id', 1).single();
          if (settingsData) {
            set({
              settings: {
                upiId: settingsData.upi_id || defaultSettings.upiId,
                businessAddress: settingsData.business_address,
                enableCOD: settingsData.enable_cod,
                enableBankTransfer: settingsData.enable_bank_transfer,
              }
            });
          }

          // Fetch Orders (if admin)
          if (get().isAdmin) {
            const { data: ordersData } = await supabase.from('orders').select('*');
            if (ordersData) {
              set({
                orders: ordersData.map(o => ({
                  id: o.id,
                  userId: o.user_id,
                  userName: o.user_name,
                  userEmail: o.user_email,
                  userPhone: o.user_phone,
                  items: o.items,
                  total: Number(o.total),
                  discount: Number(o.discount),
                  finalAmount: Number(o.final_amount),
                  couponCode: o.coupon_code,
                  address: o.address,
                  status: o.status,
                  paymentStatus: o.payment_status,
                  paymentMethod: o.payment_method,
                  transactionId: o.transaction_id,
                  trackingId: o.tracking_id,
                  carrier: o.carrier,
                  createdAt: o.created_at,
                  updatedAt: o.updated_at,
                }))
              });
            }
          } else if (get().user) {
            // Fetch personal orders
            const { data: ordersData } = await supabase.from('orders').select('*').eq('user_id', get().user!.id);
            if (ordersData) {
              set({
                orders: ordersData.map(o => ({
                  id: o.id,
                  userId: o.user_id,
                  userName: o.user_name,
                  userEmail: o.user_email,
                  userPhone: o.user_phone,
                  items: o.items,
                  total: Number(o.total),
                  discount: Number(o.discount),
                  finalAmount: Number(o.final_amount),
                  couponCode: o.coupon_code,
                  address: o.address,
                  status: o.status,
                  paymentStatus: o.payment_status,
                  paymentMethod: o.payment_method,
                  transactionId: o.transaction_id,
                  trackingId: o.tracking_id,
                  carrier: o.carrier,
                  createdAt: o.created_at,
                  updatedAt: o.updated_at,
                }))
              });
            }
          }
        } finally {
          set({ isLoading: false });
        }

        // Fetch user profile if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            set({
              user: {
                id: user.id,
                email: user.email!,
                name: profile.name || '',
                phone: profile.phone || '',
                addresses: profile.addresses || [],
                role: profile.role || (user.app_metadata?.role as any) || 'customer',
                address: profile.addresses?.find((a: any) => a.isDefault) || profile.addresses?.[0] || {
                  street: '',
                  city: '',
                  state: '',
                  pincode: '',
                  country: 'India'
                }
              },
              cart: profile.cart || get().cart, // Merge or overwrite? Let's overwrite for consistency
            });
          }
        }
      },

      syncCartWithCloud: async () => {
        const user = get().user;
        if (!user) return;

        await supabase.from('profiles').upsert({
          id: user.id,
          cart: get().cart,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      },

      syncProfileWithCloud: async () => {
        const user = get().user;
        if (!user) return;

        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      },

      initializeRealtimeUserSync: () => {
        const user = get().user;
        if (!user) return () => { };

        const channel = supabase
          .channel(`public:profiles:id=eq.${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${user.id}`,
            },
            (payload) => {
              const newProfile = payload.new;
              set((state) => ({
                user: state.user ? {
                  ...state.user,
                  name: newProfile.name,
                  phone: newProfile.phone,
                  role: newProfile.role || state.user.role,
                  addresses: newProfile.addresses,
                } : null,
                cart: newProfile.cart || state.cart,
                isAdmin: (newProfile.role || state.user?.role) === 'admin',
              }));
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },

      initializeRealtimeSettings: () => {
        const channel = supabase
          .channel('public:store_settings')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'store_settings',
              filter: 'id=eq.1',
            },
            (payload) => {
              const newSettings = payload.new;
              set({
                settings: {
                  upiId: newSettings.upi_id || defaultSettings.upiId,
                  businessAddress: newSettings.business_address || defaultSettings.businessAddress,
                  enableCOD: newSettings.enable_cod ?? defaultSettings.enableCOD,
                  enableBankTransfer: newSettings.enable_bank_transfer ?? defaultSettings.enableBankTransfer,
                },
              });
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },
    }),
    {
      name: 'vaddadi-pickles-store',
      version: 7,
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
        if (version === 6) {
          // Migration from version 6 to 7 - Add enableBankTransfer
          return {
            ...persistedState,
            settings: {
              ...(persistedState.settings || defaultSettings),
              enableBankTransfer: true,
            },
          };
        }
        return persistedState;
      },
    }
  )
);
