import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { useStore } from './store';
import { supabase } from './lib/supabase';
import { FeedbackWidget } from './components/FeedbackWidget';

// Lazy load pages for better performance
const Products = React.lazy(() => import('./pages/Products').then(module => ({ default: module.Products })));
const Cart = React.lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Checkout = React.lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const OrderSuccess = React.lazy(() => import('./pages/OrderSuccess').then(module => ({ default: module.OrderSuccess })));
const Orders = React.lazy(() => import('./pages/Orders').then(module => ({ default: module.Orders })));
const Profile = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Admin = React.lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const RefundPolicy = React.lazy(() => import('./pages/RefundPolicy').then(module => ({ default: module.RefundPolicy })));
const TermsAndConditions = React.lazy(() => import('./pages/TermsAndConditions').then(module => ({ default: module.TermsAndConditions })));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword').then(module => ({ default: module.ResetPassword })));
const AuthSuccess = React.lazy(() => import('./pages/AuthSuccess').then(module => ({ default: module.AuthSuccess })));

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden w-full relative">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FeedbackWidget />
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
    let cleanupUserSync = () => { };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.location.hash = '#/reset-password';
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

    return () => {
      subscription.unsubscribe();
      cleanupSettings();
      cleanupProducts();
      cleanupCoupons();
      cleanupOrders();
      cleanupUserSync();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchInitialData]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
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
            path="/admin"
            element={
              <AdminLayout>
                <Admin />
              </AdminLayout>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}
