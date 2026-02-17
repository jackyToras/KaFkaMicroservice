import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../../services/apiClient'
import { Booking } from '../../types'
import { 
  Calendar, Clock, ArrowRight, TrendingUp, CheckCircle, XCircle, 
  Eye, BarChart3, Activity, CreditCard, ChevronRight, Plus,
  Filter, Download, Search, AlertCircle, User, MapPin
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
      const customerId = userInfo.sub
      
      if (!customerId) {
        console.error('No customer ID found')
        return
      }

      const bookingsData = await apiClient.getCustomerBookings(customerId)
      setBookings(bookingsData)

      const now = new Date()
      const upcoming = bookingsData.filter((b: Booking) => {
        if (b.startTime) {
          return new Date(b.startTime) >= now
        }
        return b.status === 'PENDING' || b.status === 'CONFIRM'
      })
      const completed = bookingsData.filter((b: Booking) => b.status === 'COMPLETED')
      const totalSpent = bookingsData
        .filter((b: Booking) => b.paymentStatus === 'PAID')
        .reduce((sum: number, b: Booking) => sum + b.totalPrice, 0)

      setStats({
        totalBookings: bookingsData.length,
        upcomingBookings: upcoming.length,
        completedBookings: completed.length,
        totalSpent
      })

    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (booking: Booking) => {
    if (booking.startTime) {
      const date = new Date(booking.startTime)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    return booking.date || 'Date not available'
  }

  const formatTime = (booking: Booking) => {
    if (booking.startTime) {
      return new Date(booking.startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    return booking.time || ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* Header */}
      <div className="bg-black text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-400">Welcome back! Here's your booking overview</p>
            </div>
            <Link
              to="/salons"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Booking
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Bookings */}
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Total Bookings"
            value={stats.totalBookings}
            trend="+12% from last month"
          />

          {/* Upcoming */}
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Upcoming"
            value={stats.upcomingBookings}
            trend="Next 30 days"
          />

          {/* Completed */}
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Completed"
            value={stats.completedBookings}
            trend="All time"
          />

          {/* Total Spent */}
          <StatCard
            icon={<CreditCard className="w-6 h-6" />}
            label="Total Spent"
            value={`₹${stats.totalSpent.toLocaleString()}`}
            trend="Lifetime value"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <QuickAction
            icon={<Calendar className="w-5 h-5" />}
            title="Book Appointment"
            description="Find and book a salon"
            link="/salons"
          />
          <QuickAction
            icon={<Activity className="w-5 h-5" />}
            title="View Bookings"
            description="Manage your appointments"
            link="/customer/bookings"
          />
          <QuickAction
            icon={<User className="w-5 h-5" />}
            title="Profile Settings"
            description="Update your details"
            link="/customer/settings"
          />
        </div>

        {/* Recent Bookings */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          
          {/* Table Header */}
          <div className="px-8 py-6 border-b-2 border-gray-200 bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
                <p className="text-sm text-gray-600 mt-1">Your latest appointments and history</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Filter
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                  <Download className="w-4 h-4 inline mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {bookings.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-8 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="text-left px-8 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="text-left px-8 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-8 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="text-right px-8 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-right px-8 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 font-mono">
                            #{booking.id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatDate(booking)}
                            </span>
                            <span className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatTime(booking)}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-8 py-5">
                          <PaymentBadge status={booking.paymentStatus || 'PENDING'} />
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-base font-bold text-gray-900">
                            ₹{booking.totalPrice.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Link
                            to={`/customer/bookings`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-black transition-colors"
                          >
                            View
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                ))}
              </div>

              {/* View All Footer */}
              <div className="px-8 py-6 border-t-2 border-gray-200 bg-gray-50">
                <Link
                  to="/customer/bookings"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-black transition-colors"
                >
                  View all bookings
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  )
}

/* =====================================================
   COMPONENTS
===================================================== */

function StatCard({ 
  icon, 
  label, 
  value, 
  trend 
}: { 
  icon: React.ReactNode
  label: string
  value: string | number
  trend: string 
}) {
  return (
    <div className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-black rounded-xl group-hover:scale-110 transition-transform">
          <div className="text-white">
            {icon}
          </div>
        </div>
        <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
      
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{label}</p>
        <p className="text-4xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{trend}</p>
      </div>
    </div>
  )
}

function QuickAction({ 
  icon, 
  title, 
  description, 
  link 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  link: string 
}) {
  return (
    <Link
      to={link}
      className="group bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-black hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-black transition-colors">
          <div className="text-gray-900 group-hover:text-white transition-colors">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-black transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    COMPLETED: 'bg-black text-white',
    CONFIRM: 'bg-gray-100 text-gray-900 border-2 border-gray-300',
    PENDING: 'bg-gray-100 text-gray-900 border-2 border-gray-300',
    CANCELLED: 'bg-white text-red-600 border-2 border-red-300'
  }

  const icons = {
    COMPLETED: <CheckCircle className="w-3.5 h-3.5" />,
    CONFIRM: <Clock className="w-3.5 h-3.5" />,
    PENDING: <AlertCircle className="w-3.5 h-3.5" />,
    CANCELLED: <XCircle className="w-3.5 h-3.5" />
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${styles[status as keyof typeof styles] || styles.PENDING}`}>
      {icons[status as keyof typeof icons]}
      {status}
    </span>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const styles = {
    PAID: 'bg-black text-white',
    PENDING: 'bg-gray-100 text-gray-900 border-2 border-gray-300',
    FAILED: 'bg-white text-red-600 border-2 border-red-300',
    REFUNDED: 'bg-white text-orange-600 border-2 border-orange-300'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${styles[status as keyof typeof styles] || styles.PENDING}`}>
      <CreditCard className="w-3.5 h-3.5" />
      {status}
    </span>
  )
}

function BookingCard({ 
  booking, 
  formatDate, 
  formatTime 
}: { 
  booking: Booking
  formatDate: (booking: Booking) => string
  formatTime: (booking: Booking) => string 
}) {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Booking ID</p>
          <p className="font-bold text-gray-900 font-mono">
            #{booking.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{formatDate(booking)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{formatTime(booking)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-1">Amount</p>
          <p className="text-xl font-bold text-gray-900">₹{booking.totalPrice.toLocaleString()}</p>
        </div>
        <Link
          to="/customer/bookings"
          className="inline-flex items-center gap-1 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors"
        >
          View
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="px-8 py-20 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Calendar className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
      <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
        Start booking appointments with premium salons and enjoy professional beauty services
      </p>
      <Link
        to="/salons"
        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 transition-all"
      >
        Browse Salons
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  )
}