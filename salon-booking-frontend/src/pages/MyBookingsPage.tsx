import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../services/apiClient'
import { Booking } from '../types'
import { Calendar, Clock, CreditCard, CheckCircle, XCircle, AlertCircle, MapPin, Search, Filter, Download, MoreVertical, Eye, Star, Scissors, User, Phone, ChevronDown, Receipt } from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function CustomerBookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [salons, setSalons] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null)

  useEffect(() => {
    fetchBookingsAndSalons()
  }, [])

  const fetchBookingsAndSalons = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
      const customerId = userInfo.sub
      
      if (!customerId) {
        setError('Please log in again to view your bookings')
        setLoading(false)
        return
      }

      // Fetch bookings
      const bookingsData = await apiClient.getCustomerBookings(customerId)
      console.log('📦 Bookings:', bookingsData)
      
      const sortedBookings = Array.isArray(bookingsData) 
        ? bookingsData.sort((a: Booking, b: Booking) => 
            new Date(b.startTime || b.date || '').getTime() - new Date(a.startTime || a.date || '').getTime()
          )
        : []
      
      setBookings(sortedBookings)

      // Get unique salon IDs
      const salonIds = [...new Set(sortedBookings.map((b: Booking) => b.salonId).filter(Boolean))]
      console.log('🏪 Salon IDs to fetch:', salonIds)

      // Fetch all salons
      const salonData: Record<string, any> = {}
      for (const salonId of salonIds) {
        try {
          console.log('  Fetching salon:', salonId)
          const salon = await apiClient.getSalonById(salonId as string)
          console.log('  ✅ Got salon:', salon?.name)
          salonData[salonId as string] = salon
        } catch (err) {
          console.error('  ❌ Failed to fetch salon:', salonId, err)
        }
      }
      
      console.log('💾 All salons fetched:', salonData)
      setSalons(salonData)
      
    } catch (error: any) {
      console.error('❌ Error:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      setCancellingId(bookingId)
      await apiClient.cancelBooking(bookingId)
      
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'CANCELLED' as const }
          : booking
      ))
      
      alert('Booking cancelled successfully!')
    } catch (error: any) {
      console.error('Failed to cancel booking:', error)
      alert(error.response?.data || 'Failed to cancel booking. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  const getSalonName = (booking: Booking) => {
    const salon = salons[booking.salonId]
    if (salon?.name) return salon.name
    return 'Loading salon...'
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      CONFIRM: 'bg-green-50 text-green-700 border-green-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
      COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200'
    }

    const icons = {
      PENDING: <AlertCircle className="w-3.5 h-3.5" />,
      CONFIRM: <CheckCircle className="w-3.5 h-3.5" />,
      CANCELLED: <XCircle className="w-3.5 h-3.5" />,
      COMPLETED: <CheckCircle className="w-3.5 h-3.5" />
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {icons[status as keyof typeof icons] || icons.PENDING}
        {status}
      </span>
    )
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const styles = {
      PENDING: 'bg-gray-50 text-gray-700 border-gray-200',
      PAID: 'bg-green-50 text-green-700 border-green-200',
      FAILED: 'bg-red-50 text-red-700 border-red-200',
      REFUNDED: 'bg-orange-50 text-orange-700 border-orange-200'
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[paymentStatus as keyof typeof styles] || styles.PENDING}`}>
        <CreditCard className="w-3 h-3" />
        {paymentStatus}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  }

  const filteredBookings = bookings
    .filter(booking => {
      if (filter === 'all') return true
      const bookingDate = new Date(booking.startTime || booking.date || '')
      const now = new Date()
      return filter === 'upcoming' ? bookingDate >= now : bookingDate < now
    })
    .filter(booking => {
      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      const salonName = getSalonName(booking).toLowerCase()
      return booking.id.toLowerCase().includes(search) || salonName.includes(search)
    })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBookingsAndSalons}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Bookings
                </h1>
              </div>
              <p className="text-sm text-gray-600 ml-14">View and manage your salon appointments</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => new Date(b.startTime || b.date || '') >= new Date()).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{bookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filter === 'upcoming'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filter === 'past'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Past
              </button>
            </div>

            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by booking ID or salon name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-16 text-center shadow-sm">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl rounded-full" />
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
              {filter === 'all' 
                ? "You haven't made any bookings yet. Start exploring salons near you!" 
                : `You have no ${filter} bookings.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="group bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                              <Scissors className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900">
                                {getSalonName(booking)}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Booking #{booking.id.slice(-8).toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mb-4">
                            {getStatusBadge(booking.status)}
                            {getPaymentStatusBadge(booking.paymentStatus || 'PENDING')}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="font-medium">{formatDate(booking.startTime || booking.date || '')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Clock className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Time</p>
                                <p className="font-medium">
                                  {formatTime(booking.startTime || booking.time || '')} - {formatTime(booking.endTime || '')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <CreditCard className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Payment</p>
                                <p className="font-medium capitalize">{booking.paymentMethod || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <MapPin className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="font-medium text-blue-600">View on map</p>
                              </div>
                            </div>
                          </div>

                          {expandedBooking === booking.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                              <div className="flex items-center gap-3 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Customer: <span className="font-medium text-gray-900">{booking.customerName || 'N/A'}</span></span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-gray-600">Total: <span className="font-medium text-gray-900">₹{booking.totalPrice}</span></span>
                              </div>
                            </div>
                          )}

                          <button 
                            onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            {expandedBooking === booking.id ? 'Show less' : 'Show more details'}
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedBooking === booking.id ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Right: Price & Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-200 lg:pl-6 min-w-[200px]">
                      <div className="text-left lg:text-right">
                        <p className="text-xs font-medium text-gray-500 mb-2">Total Amount</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ₹{booking.totalPrice?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                      </div>
                      
                      <div className="flex flex-col gap-2 w-full lg:w-auto">
                        {booking.status === 'PENDING' && (
                          <button 
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="px-4 py-2.5 text-sm font-medium border-2 border-red-300 text-red-700 bg-white rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}
                        {booking.status === 'COMPLETED' && (
                          <button className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2">
                            <Receipt className="w-4 h-4" />
                            Get Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent group-hover:via-blue-500 group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}