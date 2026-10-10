import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import {
  Header,
  Footer,
  ErrorBoundary,
  ProtectedRoute,
  WhatsAppButton,
  PWAInstallPrompt,
  FestiveWelcomeModal,
  AffiliatePromoToast,
} from './components';
import { Home } from './pages/shop/Home';
import { useStore } from './store';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';

// Lazy load pages for better performance
// Shop
const Products = React.lazy(() => import('./pages/shop/Products').then(module => ({ default: module.Products })));
const Cart = React.lazy(() => import('./pages/shop/Cart').then(module => ({ default: module.Cart })));
const Checkout = React.lazy(() => import('./pages/shop/Checkout').then(module => ({ default: module.Checkout })));
const OrderSuccess = React.lazy(() => import('./pages/shop/OrderSuccess').then(module => ({ default: module.OrderSuccess })));
const Orders = React.lazy(() => import('./pages/shop/Orders').then(module => ({ default: module.Orders })));
const Profile = React.lazy(() => import('./pages/shop/Profile').then(module => ({ default: module.Profile })));
const Wishlist = React.lazy(() => import('./pages/shop/Wishlist').then(module => ({ default: module.Wishlist })));

// Auth
const Login = React.lazy(() => import('./pages/auth/Login').then(module => ({ default: module.Login })));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword').then(module => ({ default: module.ResetPassword })));
const AuthSuccess = React.lazy(() => import('./pages/auth/AuthSuccess').then(module => ({ default: module.AuthSuccess })));

// Admin
const Admin = React.lazy(() => import('./pages/admin/Admin').then(module => ({ default: module.Admin })));
const AffiliateDashboard = React.lazy(() => import('./pages/admin/AffiliateDashboard').then(module => ({ default: module.AffiliateDashboard })));

// Legal & Information
const AboutUs = React.lazy(() => import('./pages/legal/AboutUs').then(module => ({ default: module.AboutUs })));
const FAQ = React.lazy(() => import('./pages/legal/FAQ').then(module => ({ default: module.FAQ })));
const PrivacyPolicy = React.lazy(() => import('./pages/legal/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const RefundPolicy = React.lazy(() => import('./pages/legal/RefundPolicy').then(module => ({ default: module.RefundPolicy })));
const TermsAndConditions = React.lazy(() => import('./pages/legal/TermsAndConditions').then(module => ({ default: module.TermsAndConditions })));

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full relative">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />

      <WhatsAppButton />
      <PWAInstallPrompt />
      <FestiveWelcomeModal />
      <AffiliatePromoToast />
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-100">{children}</div>;
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );
}

export function App() {
  const fetchInitialData = useStore((state) => state.fetchInitialData);
  const isLoading = useStore((state) => state.isLoading);
  const isAdmin = useStore((state) => state.isAdmin);

  React.useEffect(() => {
    let cleanupProfiles = () => {};
    if (isAdmin) {
      cleanupProfiles = useStore.getState().initializeRealtimeProfiles();
    }
    return () => {
      cleanupProfiles();
    };
  }, [isAdmin]);

  React.useEffect(() => {
    fetchInitialData();

    // Increment daily visit on first load per session per day
    const today = new Date().toISOString().split('T')[0];
    const visitedToday = sessionStorage.getItem(`visited_${today}`);
    if (!visitedToday) {
      useStore.getState().incrementDailyVisit();
      sessionStorage.setItem(`visited_${today}`, 'true');
    }

    const cleanupSettings = useStore.getState().initializeRealtimeSettings();
    const cleanupProducts = useStore.getState().initializeRealtimeProducts();
    const cleanupCoupons = useStore.getState().initializeRealtimeCoupons();
    const cleanupOrders = useStore.getState().initializeRealtimeOrders();
    const cleanupVisits = useStore.getState().initializeRealtimeVisits();
    const cleanupFeedbacks = useStore.getState().subscribeToFeedbacks();
    let cleanupUserSync = () => { };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/reset-password';
      }

      // Re-initialize user sync and re-fetch data on auth change
      cleanupUserSync();
      if (event !== 'INITIAL_SESSION') {
        fetchInitialData(false); // Re-fetch all data without showing global loading spinner
      } else {
        fetchInitialData(true);
      }
      if (session?.user) {
        cleanupUserSync = useStore.getState().initializeRealtimeUserSync();
      }
    });

    // Initial check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        cleanupUserSync = useStore.getState().initializeRealtimeUserSync();
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-fetch data when app comes back to foreground (especially for mobile)
        fetchInitialData(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Also listen to window focus as a fallback
    window.addEventListener('focus', handleVisibilityChange);

    // Track affiliate referral code (supports both standard and HashRouter URLs)
    let refCode = new URLSearchParams(window.location.search).get('ref');
    if (!refCode && window.location.hash.includes('?')) {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
      refCode = hashParams.get('ref');
    }

    if (refCode) {
      localStorage.setItem('affiliate_ref', refCode);
      // Clean only the 'ref' param, keeping productId and other params intact
      try {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('ref')) {
          searchParams.delete('ref');
          const remainingSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
          window.history.replaceState({}, document.title, window.location.pathname + remainingSearch + window.location.hash);
        }
      } catch {
        // Fallback
      }
    }

    return () => {
      subscription.unsubscribe();
      cleanupSettings();
      cleanupProducts();
      cleanupCoupons();
      cleanupOrders();
      cleanupVisits();
      if (cleanupFeedbacks) cleanupFeedbacks();
      cleanupUserSync();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchInitialData]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <HelmetProvider>
      <Toaster position="bottom-center" />
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
        <Suspense fallback={<Loading />}>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout>
                <Products />
              </Layout>
            }
          />
          <Route
            path="/products/:productId"
            element={
              <Layout>
                <Products />
              </Layout>
            }
          />
          <Route
            path="/cart"
            element={
              <Layout>
                <Cart />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />
          <Route
            path="/checkout"
            element={
              <Layout>
                <Checkout />
              </Layout>
            }
          />
          <Route
            path="/order-success"
            element={
              <Layout>
                <OrderSuccess />
              </Layout>
            }
          />
          <Route
            path="/orders"
            element={
              <Layout>
                <Orders />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <Layout>
                <PrivacyPolicy />
              </Layout>
            }
          />
          <Route
            path="/refund-policy"
            element={
              <Layout>
                <RefundPolicy />
              </Layout>
            }
          />
          <Route
            path="/terms-and-conditions"
            element={
              <Layout>
                <TermsAndConditions />
              </Layout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Layout>
                <ForgotPassword />
              </Layout>
            }
          />
          <Route
            path="/reset-password"
            element={
              <Layout>
                <ResetPassword />
              </Layout>
            }
          />
          <Route
            path="/auth-success"
            element={
              <Layout>
                <AuthSuccess />
              </Layout>
            }
          />
          <Route
            path="/affiliate"
            element={
              <Layout>
                <AffiliateDashboard />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <AboutUs />
              </Layout>
            }
          />
          <Route
            path="/faq"
            element={
              <Layout>
                <FAQ />
              </Layout>
            }
          />
          <Route
            path="/wishlist"
            element={
              <Layout>
                <Wishlist />
              </Layout>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Admin />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      </ErrorBoundary>
      </Router>
    </HelmetProvider>
  );
}
