import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import HomePage from './pages/HomePage'
import SalonsPage from './pages/SalonsPage'
import SalonDetailsPage from './pages/SalonDetailsPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerBookings from './pages/customer/Bookings'
import AccountSettings from './pages/customer/AccountSettings'
import AdminDashboard from './pages/admin/Dashboard'
import SalonOwnerDashboard from './pages/salon/Dashboard'
import ProtectedRoute from './components/common/ProtectedRoute'
import BookingPage from './pages/BookingPage'
import CategorySelectionPage from './pages/CategorySelectionPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import FavoritesPage from './pages/FavoritesPage'

function App() {
  const user = useAuthStore((state) => state.user)

  return (
    <Router>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/salons" element={<SalonsPage />} />
          <Route path="/salons/:id" element={<SalonDetailsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/book/:salonId/:serviceId/category" element={<CategorySelectionPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/settings"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <AccountSettings />
              </ProtectedRoute>
            }
          />

          {/* Salon Owner Routes */}
          <Route
            path="/salon/dashboard"
            element={
              <ProtectedRoute requiredRole="SALON">
                <SalonOwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App