import { useState, useEffect } from 'react'
import { apiClient } from '../../services/apiClient'
import { getUserId } from '../../services/keycloakService'
import { Booking } from '../../types'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { 
  Calendar, Clock, MapPin, XCircle, AlertTriangle, AlertCircle, CheckCircle, 
  CreditCard, Scissors, Download, Search, Filter, Eye, Star, Phone, User, 
  ChevronDown, Receipt, MoreVertical, TrendingUp
} from 'lucide-react'

export default function CustomerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const customerId = getUserId()

      if (!customerId) {
        setError('No customer ID found - please log in again')
        return
      }

      const data = await apiClient.getCustomerBookings(customerId)
      
      const sortedBookings = Array.isArray(data) 
        ? data.sort((a: Booking, b: Booking) => 
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          )
        : []
      
      setBookings(sortedBookings)

    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const openCancelModal = (id: string) => {
    setBookingToCancel(id)
    setShowCancelModal(true)
  }

  const closeCancelModal = () => {
    setShowCancelModal(false)
    setBookingToCancel(null)
  }

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return

    try {
      setCancellingId(bookingToCancel)
      await apiClient.cancelBooking(bookingToCancel)

      setBookings(bookings.map(b =>
        b.id === bookingToCancel ? { ...b, status: 'CANCELLED' } : b
      ))

      closeCancelModal()

    } catch (error: any) {
      alert('Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-gray-100 text-gray-900 border-gray-300',
      CONFIRMED: 'bg-black text-white border-black',
      CANCELLED: 'bg-white text-red-600 border-red-300',
      COMPLETED: 'bg-black text-white border-black'
    }

    const icons = {
      PENDING: <AlertCircle className="w-3.5 h-3.5" />,
      CONFIRMED: <CheckCircle className="w-3.5 h-3.5" />,
      CANCELLED: <XCircle className="w-3.5 h-3.5" />,
      COMPLETED: <CheckCircle className="w-3.5 h-3.5" />
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {icons[status as keyof typeof icons]}
        {status}
      </span>
    )
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const styles = {
      PENDING: 'bg-gray-100 text-gray-900 border-gray-300',
      PAID: 'bg-black text-white border-black',
      FAILED: 'bg-white text-red-600 border-red-300',
      REFUNDED: 'bg-white text-orange-600 border-orange-300'
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${styles[paymentStatus as keyof typeof styles] || styles.PENDING}`}>
        <CreditCard className="w-3 h-3" />
        {paymentStatus}
      </span>
    )
  }

  const filteredBookings = bookings
    .filter(booking => {
      if (filter === 'all') return true
      
      const bookingDate = new Date(booking.startTime)
      const now = new Date()
      
      if (filter === 'upcoming') {
        return bookingDate >= now
      } else {
        return bookingDate < now
      }
    })
    .filter(booking => {
      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      return booking.id.toLowerCase().includes(search)
    })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-gray-900" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-6 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-all"
          >
            Try Again
          </button>
        </div>
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
              <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
              <p className="text-gray-400">View and manage your salon appointments</p>
            </div>
            <button className="px-5 py-3 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Total Bookings"
            value={bookings.length}
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Upcoming"
            value={bookings.filter(b => new Date(b.startTime) >= new Date()).length}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Total Spent"
            value={`₹${bookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}`}
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex gap-2">
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                label={`All (${bookings.length})`}
              />
              <FilterButton
                active={filter === 'upcoming'}
                onClick={() => setFilter('upcoming')}
                label="Upcoming"
              />
              <FilterButton
                active={filter === 'past'}
                onClick={() => setFilter('past')}
                label="Past"
              />
            </div>

            {/* Search */}
            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
              <button className="px-4 py-3 text-sm font-medium text-gray-900 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-20 text-center shadow-lg">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
              {filter === 'all' 
                ? "You haven't made any bookings yet. Start exploring salons near you!" 
                : `You have no ${filter} bookings.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                expanded={expandedBooking === booking.id}
                onToggleExpand={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                onCancel={() => openCancelModal(booking.id)}
                cancelling={cancellingId === booking.id}
                getStatusBadge={getStatusBadge}
                getPaymentStatusBadge={getPaymentStatusBadge}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelModal
          onClose={closeCancelModal}
          onConfirm={confirmCancelBooking}
          isLoading={!!cancellingId}
        />
      )}
    </div>
  )
}

/* =====================================================
   COMPONENTS
===================================================== */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="group bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-xl group-hover:bg-black group-hover:text-white transition-all">
          {icon}
        </div>
      </div>
    </div>
  )
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
        active
          ? 'bg-black text-white shadow-lg'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}

function BookingCard({
  booking,
  expanded,
  onToggleExpand,
  onCancel,
  cancelling,
  getStatusBadge,
  getPaymentStatusBadge,
  formatDate,
  formatTime
}: any) {
  return (
    <div className="group bg-white border-2 border-gray-200 rounded-3xl hover:border-gray-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Booking Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-black rounded-xl">
                    <Scissors className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Booking #{booking.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {booking.salonId?.name || booking.salon?.name || 'Premium Salon'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap mb-6">
                  {getStatusBadge(booking.status)}
                  {booking.paymentStatus && getPaymentStatusBadge(booking.paymentStatus)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoBox
                    icon={<Calendar className="w-5 h-5" />}
                    label="Date"
                    value={booking.startTime ? formatDate(booking.startTime) : booking.date || 'N/A'}
                  />
                  <InfoBox
                    icon={<Clock className="w-5 h-5" />}
                    label="Time"
                    value={booking.startTime && booking.endTime
                      ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`
                      : booking.time || 'N/A'}
                  />
                  <InfoBox
                    icon={<CreditCard className="w-5 h-5" />}
                    label="Payment"
                    value={booking.paymentMethod || 'N/A'}
                  />
                  <InfoBox
                    icon={<MapPin className="w-5 h-5" />}
                    label="Location"
                    value={booking.location || 'View map'}
                  />
                </div>

                {/* Expandable Details */}
                {expanded && (
                  <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-4">
                    <DetailRow icon={<User />} label="Stylist" value="Professional Stylist" />
                    <DetailRow icon={<Phone />} label="Contact" value="Available after confirmation" />
                    <DetailRow icon={<Star />} label="Rating" value="4.8 / 5.0" />
                  </div>
                )}

                <button 
                  onClick={onToggleExpand}
                  className="mt-6 text-sm text-gray-900 hover:text-black font-semibold flex items-center gap-2 transition-colors"
                >
                  {expanded ? 'Show less' : 'Show more details'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Right: Price & Actions */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-6 pt-6 lg:pt-0 border-t-2 lg:border-t-0 lg:border-l-2 border-gray-200 lg:pl-8 min-w-[220px]">
            <div className="text-left lg:text-right">
              <p className="text-xs font-semibold text-gray-600 mb-2">Total Amount</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">
                ₹{booking.totalPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Inclusive of taxes</p>
            </div>
            
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <button className="px-6 py-3 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              {booking.status === 'PENDING' && (
                <button 
                  onClick={onCancel}
                  disabled={cancelling}
                  className="px-6 py-3 text-sm font-semibold border-2 border-gray-300 text-gray-900 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
              {booking.status === 'COMPLETED' && (
                <button className="px-6 py-3 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoBox({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
      <div className="p-2 bg-white rounded-lg border border-gray-200">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-600 mb-0.5">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-4 h-4 text-gray-400">{icon}</div>
      <span className="text-gray-600">{label}: <span className="font-semibold text-gray-900">{value}</span></span>
    </div>
  )
}

function CancelModal({ onClose, onConfirm, isLoading }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-red-100 rounded-xl">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Cancel Booking?</h3>
        </div>
        <p className="text-gray-700 mb-8 leading-relaxed">
          Are you sure you want to cancel this booking? This action cannot be undone and cancellation policies may apply.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-900 rounded-xl hover:bg-gray-50 font-semibold transition-all"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 font-semibold transition-all disabled:opacity-50"
          >
            {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}