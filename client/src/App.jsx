import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import BuyerLayout from './layouts/BuyerLayout';
import SellerLayout from './layouts/SellerLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import { usePageTracking } from './hooks/usePageTracking';

// Public pages
import Home from './pages/public/Home';
import EventsList from './pages/public/EventsList';
import EventDetail from './pages/public/EventDetail';
import ListingDetail from './pages/public/ListingDetail';
import SearchResults from './pages/public/SearchResults';
import About from './pages/public/About';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import FAQ from './pages/public/FAQ';
import Contact from './pages/public/Contact';

// Auth pages
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Shared pages
import AccountSettings from './pages/shared/AccountSettings';

// Buyer pages
import BuyerDashboard from './pages/buyer/Dashboard';
import MyOrders from './pages/buyer/MyOrders';
import OrderDetail from './pages/buyer/OrderDetail';
import DisputeSubmit from './pages/buyer/DisputeSubmit';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import ListingFormPage from './pages/seller/ListingFormPage';
import MyListings from './pages/seller/MyListings';
import Payouts from './pages/seller/Payouts';
import KYCUpload from './pages/seller/KYCUpload';
import TaxSummary from './pages/seller/TaxSummary';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserModeration from './pages/admin/UserModeration';
import ListingModeration from './pages/admin/ListingModeration';
import Disputes from './pages/admin/Disputes';
import EventManagement from './pages/admin/EventManagement';
import PayoutOverride from './pages/admin/PayoutOverride';
import Reports from './pages/admin/Reports';

function App() {
  usePageTracking();

  return (
    <Routes>
      {/* ---- Public routes ---- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:slug" element={<EventDetail />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />

        {/* ---- Auth ---- */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* ---- Buyer routes ---- */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['buyer']}>
              <BuyerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/orders" element={<MyOrders />} />
        <Route path="/buyer/orders/:id" element={<OrderDetail />} />
        <Route path="/buyer/orders/:id/dispute" element={<DisputeSubmit />} />
        <Route path="/buyer/account" element={<AccountSettings />} />
      </Route>

      {/* ---- Seller routes ---- */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['seller']}>
              <SellerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/listings/new" element={<ListingFormPage />} />
        <Route path="/seller/listings/:id/edit" element={<ListingFormPage />} />
        <Route path="/seller/listings" element={<MyListings />} />
        <Route path="/seller/payouts" element={<Payouts />} />
        <Route path="/seller/tax-summary" element={<TaxSummary />} />
        <Route path="/seller/kyc" element={<KYCUpload />} />
        <Route path="/seller/account" element={<AccountSettings />} />
      </Route>

      {/* ---- Admin routes ---- */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserModeration />} />
        <Route path="/admin/listings" element={<ListingModeration />} />
        <Route path="/admin/disputes" element={<Disputes />} />
        <Route path="/admin/events" element={<EventManagement />} />
        <Route path="/admin/payouts" element={<PayoutOverride />} />
        <Route path="/admin/reports" element={<Reports />} />
      </Route>

      {/* ---- 404 ---- */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
            <h1 className="font-display text-display-lg text-ink">404</h1>
            <p className="text-slate-500">This page doesn't exist.</p>
          </div>
        }
      />
    </Routes>
  );
}

export default App;