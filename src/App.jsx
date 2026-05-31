import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import CustomCursor from './components/CustomCursor';
import SmoothScroll from './components/SmoothScroll';
import Preloader from './components/Preloader';
import Landing from './pages/Landing';
import BrandLanding from './pages/BrandLanding';
import Home from './pages/Home';
import Products from './pages/Products';
import Explore from './pages/Explore';
import ExploreNav from './pages/ExploreNav';
import Creators from './pages/Creators';
import CampaignsExplore from './pages/CampaignsExplore';
import CreatorsNav from './pages/CreatorsNav';
import About from './pages/About';
import AboutNav from './pages/AboutNav';
import Profile from './pages/Profile';
import ProfileDemo from './pages/ProfileDemo';
import Collection from './pages/Collection';
import CollectionDetailPage from './pages/CollectionDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Waitlist from './pages/Waitlist';
import BrandOnboarding from './pages/BrandOnboarding';
import BrandPortal from './pages/BrandPortal';
import BrandPublicPage from './pages/BrandPublicPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmailToken from './pages/VerifyEmailToken';
import Analytics from './pages/Analytics';
import ProfileViews from './pages/ProfileViews';
import LikedProducts from './pages/LikedProducts';
import Subscription from './pages/Subscription';
import BrandSubscription from './pages/BrandSubscription';
import PlanDetails from './pages/PlanDetails';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import WalletHistory from './pages/WalletHistory';
import CreatorCampaigns from './pages/CreatorCampaigns';
import Help from './pages/Help';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ScrollToTop from './components/ScrollToTop';

// Redirect /portfolio/:username → /profile/:username
const PortfolioRedirect = () => {
  const { username } = useParams();
  return <Navigate to={`/profile/${username}`} replace />;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isBrand } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  if (isBrand) {
    return <Navigate to="/brand/app" replace />;
  }

  return children;
};

const BrandRoute = ({ children }) => {
  const { isAuthenticated, isBrand } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  if (!isBrand) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isBrand } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isBrand ? '/brand/app' : '/'} replace />;
  }

  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, isBrand } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/landing" element={
          <Landing />
        } />
        <Route path="/home" element={
          <Landing />
        } />
        <Route path="/products" element={<Products />} />
        <Route path="/brand" element={
          <BrandLanding />
        } />
        <Route path="/brand/app" element={
          <BrandRoute>
            <BrandPortal page="home" />
          </BrandRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmailToken />} />
        <Route path="/verify-email" element={<VerifyEmailToken />} />

        {/* Protected Routes */}
        <Route path="/brand/onboarding" element={
          <BrandRoute>
            <BrandOnboarding />
          </BrandRoute>
        } />
        <Route path="/brand/explore" element={
          <BrandRoute>
            <BrandPortal page="explore" />
          </BrandRoute>
        } />
        <Route path="/brand/dashboard" element={
          <BrandRoute>
            <BrandPortal page="dashboard" />
          </BrandRoute>
        } />
        <Route path="/brand/campaigns" element={
          <BrandRoute>
            <BrandPortal page="campaigns" />
          </BrandRoute>
        } />
        <Route path="/brand/campaigns/new" element={
          <BrandRoute>
            <BrandPortal page="new-campaign" />
          </BrandRoute>
        } />
        <Route path="/brand/campaigns/:id" element={
          <BrandRoute>
            <BrandPortal page="campaign-detail" />
          </BrandRoute>
        } />
        <Route path="/brand/creators" element={
          <BrandRoute>
            <BrandPortal page="creators" />
          </BrandRoute>
        } />
        <Route path="/brand/creators/:id" element={
          <BrandRoute>
            <BrandPortal page="creator-detail" />
          </BrandRoute>
        } />
        <Route path="/brand/chats" element={
          <BrandRoute>
            <BrandPortal page="chats" />
          </BrandRoute>
        } />
        <Route path="/brand/messages" element={
          <BrandRoute>
            <BrandPortal page="messages" />
          </BrandRoute>
        } />
        <Route path="/brand/analytics" element={
          <BrandRoute>
            <BrandPortal page="analytics" />
          </BrandRoute>
        } />
        <Route path="/brand/brand-page" element={
          <BrandRoute>
            <BrandPortal page="brand-page" />
          </BrandRoute>
        } />
        <Route path="/brand/notifications" element={
          <BrandRoute>
            <BrandPortal page="notifications" />
          </BrandRoute>
        } />
        <Route path="/brand/profile" element={
          <BrandRoute>
            <BrandPortal page="profile" />
          </BrandRoute>
        } />
        <Route path="/brand/settings" element={
          <BrandRoute>
            <BrandPortal page="settings" />
          </BrandRoute>
        } />
        <Route path="/brand/wallet" element={
          <BrandRoute>
            <Wallet />
          </BrandRoute>
        } />
        <Route path="/brand/wallet/history" element={
          <BrandRoute>
            <WalletHistory />
          </BrandRoute>
        } />
        <Route path="/brand/subscription" element={
          <BrandRoute>
            <BrandSubscription />
          </BrandRoute>
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/explore" element={isAuthenticated ? (isBrand ? <Navigate to="/brand/explore" replace /> : <Explore />) : <ExploreNav />} />
        <Route path="/campaigns" element={isBrand ? <Navigate to="/brand/campaigns" replace /> : <CampaignsExplore />} />

        <Route path="/creators" element={isBrand ? <Navigate to="/brand/creators" replace /> : <Creators />} />
        <Route path="/about" element={isAuthenticated ? <About /> : <AboutNav />} />
        <Route path="/profile/:username" element={isAuthenticated ? (isBrand ? <Navigate to="/brand/profile" replace /> : <Profile />) : <ProfileDemo />} />
        <Route path="/c/:id" element={<CollectionDetailPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/user/:userId" element={<UserProfilePage />} />
        <Route path="/brand-profile/:brandId" element={<BrandPublicPage />} />
        <Route path="/portfolio/:username" element={<PortfolioRedirect />} />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/profile-views" element={
          <ProtectedRoute>
            <ProfileViews />
          </ProtectedRoute>
        } />
        <Route path="/liked-products" element={
          <ProtectedRoute>
            <LikedProducts />
          </ProtectedRoute>
        } />
        <Route path="/subscription" element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        } />
        <Route path="/plan-details" element={
          <ProtectedRoute>
            <PlanDetails />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        } />
        <Route path="/wallet/history" element={
          <ProtectedRoute>
            <WalletHistory />
          </ProtectedRoute>
        } />
        <Route path="/my-campaigns" element={
          <ProtectedRoute>
            <CreatorCampaigns />
          </ProtectedRoute>
        } />

        {/* Legal — fully public, no auth guard, never redirect */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/help" element={<Help />} />

        {/* Catch all - redirect to landing or home based on auth */}
        <Route path="*" element={
          isAuthenticated ? <Navigate to={isBrand ? '/brand/app' : '/'} replace /> : <Navigate to="/home" replace />
        } />
      </Routes>
    </AnimatePresence>
  );
};

// Pages that must always render with Header + Footer (no Sidebar),
// regardless of authentication state.
const LEGAL_PATHS = ['/terms', '/privacy', '/help'];

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(!isAuthenticated);

  const isAuthPage = ['/login', '/signup', '/waitlist', '/forgot-password'].includes(location.pathname)
    || location.pathname.startsWith('/reset-password')
    || location.pathname.startsWith('/verify-email');
  const isLegalPage = LEGAL_PATHS.includes(location.pathname);
  const showCustomCursor = !isAuthenticated && !isAuthPage && !isLegalPage;
  const isLandingPage = ['/landing', '/home', '/brand'].includes(location.pathname);
  const isBrandOnboarding = location.pathname === '/brand/onboarding';

  // Legal pages always get the public layout (Header + Footer, no Sidebar)
  const showHeader = (!isAuthenticated || isLegalPage) && !isLandingPage && !isAuthPage;
  const showFooter = (!isAuthenticated || isLegalPage) && !isLandingPage && !isAuthPage;
  const showSidebar = isAuthenticated && !isBrandOnboarding && !isLegalPage && !isLandingPage;

  return (
    <SmoothScroll>
      <div className={`app${showCustomCursor ? ' landing-cursor-active' : ''}`}>
        {showPreloader && isLandingPage && (
          <Preloader onComplete={() => setShowPreloader(false)} />
        )}
        {showCustomCursor && <CustomCursor />}
        {showSidebar && <Sidebar />}
        <div className="app-content">
          {showHeader && <Header />}
          <main className="main-content">
            <AnimatedRoutes />
          </main>
          {showFooter && <Footer />}
        </div>
      </div>
    </SmoothScroll>
  );
};

function App() {
  return (
    <DataProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <NotificationProvider>
              <ScrollToTop />
              <AppContent />
              <VercelAnalytics />
              <SpeedInsights />
            </NotificationProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </DataProvider>
  );
}

export default App;
