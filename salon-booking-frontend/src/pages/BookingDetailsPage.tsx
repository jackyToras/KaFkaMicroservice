import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../services/apiClient'
import { Booking } from '../types'
import { Calendar, Clock, CreditCard, CheckCircle, XCircle, AlertCircle, MapPin, ArrowLeft, Download, Star, Scissors, User, Mail, Phone, Shield } from 'lucide-react'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function BookingDetailsPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [salon, setSalon] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      const bookingData = await apiClient.getBookingById(bookingId!)
      setBooking(bookingData)

      // Fetch salon details
      if (bookingData.salonId) {
        const salonData = await apiClient.getSalonById(bookingData.salonId)
        setSalon(salonData)
      }
    } catch (err: any) {
      console.error('Failed to fetch booking details:', err)
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      CONFIRM: 'bg-green-50 text-green-700 border-green-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
      COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200'
    }

    const icons = {
      PENDING: <AlertCircle className="w-5 h-5" />,
      CONFIRM: <CheckCircle className="w-5 h-5" />,
      CANCELLED: <XCircle className="w-5 h-5" />,
      COMPLETED: <CheckCircle className="w-5 h-5" />
    }

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {icons[status as keyof typeof icons] || icons.PENDING}
        {status}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Not Found</h3>
          <p className="text-sm text-gray-600 mb-6">{error || 'This booking does not exist'}</p>
          <button
            onClick={() => navigate('/customer/bookings')}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/customer/bookings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to My Bookings</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
                <p className="text-blue-100">Booking ID: #{booking.id.slice(-8).toUpperCase()}</p>
              </div>
              {getStatusBadge(booking.status)}
            </div>
          </div>

          {/* Booking Info */}
          <div className="p-6 space-y-6">
            {/* Salon Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{salon?.name || 'Loading salon...'}</h2>
                  <p className="text-sm text-gray-600">Salon Information</p>
                </div>
              </div>
              {salon && (
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span>{salon.address}, {salon.city}</span>
                </div>
              )}
            </div>

            {/* Appointment Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">Date</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatDate(booking.startTime || booking.date || '')}</p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">Time</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatTime(booking.startTime || booking.time || '')} - {formatTime(booking.endTime || '')}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{booking.customerName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{booking.customerEmail || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Payment Method:</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-gray-900 capitalize">{booking.paymentMethod || 'CARD'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Payment Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    booking.paymentStatus === 'PAID' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.paymentStatus || 'PENDING'}
                  </span>
                </div>
                <div className="pt-4 mt-4 border-t border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                    <span className="text-3xl font-black text-green-600">₹{booking.totalPrice?.toLocaleString() || '0'}</span>
                  </div>
                  <p className="text-xs text-gray-600 text-right mt-1">Inclusive of all taxes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </button>
          {booking.status === 'COMPLETED' && (
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
              <Star className="w-5 h-5" />
              Rate Experience
            </button>
          )}
        </div>

        {/* Security Badge */}
        <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Your booking is secured with 256-bit encryption</span>
          </div>
        </div>
      </div>
    </div>
  )
}