import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiClient } from '../services/apiClient'
import { Salon, Service } from '../types'
import { getUsername } from '../services/keycloakService'
import { MapPin, Clock, Calendar, CreditCard, CheckCircle, AlertCircle, Shield, Star, Users, Award, ArrowRight, Check, Search, X, ChevronRight, Info } from 'lucide-react'

export default function BookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const { salon, services, totalPrice } = (location.state as {
    salon: Salon
    services: Service[]
    totalPrice: number
  }) || {}

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [timeSearch, setTimeSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)

  const username = getUsername()

  useEffect(() => {
    if (!salon || !services || !totalPrice) {
      navigate('/')
    }
  }, [salon, services, totalPrice, navigate])

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00'
  ]

  const filteredTimeSlots = timeSlots.filter(time => 
    time.toLowerCase().includes(timeSearch.toLowerCase())
  )

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
      const keycloakId = userInfo.sub
      const email = userInfo.email || ''
      const name = userInfo.name || username || ''

      if (!keycloakId) {
        throw new Error('User not authenticated. Please login again.')
      }

      const totalDuration = services.reduce((sum, s) => sum + s.duration, 0)
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`)
      const endDateTime = new Date(startDateTime.getTime() + totalDuration * 60000)

      const bookingData = {
        salonId: salon.id,
        customerId: keycloakId,
        customerName: name,
        customerEmail: email,
        serviceIds: services.map(s => s.id),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        totalPrice: totalPrice,
        paymentMethod: 'CARD',
        status: 'PENDING'
      }

      const bookingResponse = await apiClient.createBooking(bookingData)
      const paymentResponse = await apiClient.createPaymentLink(bookingResponse)

      if (paymentResponse.payment_link_url) {
        sessionStorage.setItem('pendingBookingId', bookingResponse.id || bookingResponse._id)
        window.location.href = paymentResponse.payment_link_url
      } else {
        throw new Error('Payment link not received from server')
      }

    } catch (err: any) {
      console.error('❌ Booking error:', err)
      setError(
        err.response?.data?.message || 
        err.response?.data ||
        err.message || 
        'Failed to process booking. Please try again.'
      )
      setLoading(false)
    }
  }

  const getTotalDuration = () => {
    return services?.reduce((sum, s) => sum + s.duration, 0) || 0
  }

  if (!salon || !services) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full mb-6 text-sm">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              Final Step
            </div>
            <h1 className="text-5xl font-bold mb-4">Complete Your Booking</h1>
            <p className="text-lg text-gray-400">
              Select your preferred appointment time to proceed with payment
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              <ProgressStep number="1" label="Services" completed />
              <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              <ProgressStep number="2" label="Salon" completed />
              <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              <ProgressStep number="3" label="Schedule" active />
              <div className="flex-1 h-px bg-gray-200 mx-4"></div>
              <ProgressStep number="4" label="Payment" />
            </div>

            {/* Appointment Scheduling */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="border-b border-gray-200 px-8 py-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Appointment</h2>
                <p className="text-sm text-gray-600 mt-1">Choose your preferred date and time slot</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Select Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-all text-base font-medium"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Available for next 30 days
                  </p>
                </div>

                {/* Time Selection with Search */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Select Time
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={selectedTime || timeSearch}
                      onChange={(e) => {
                        setTimeSearch(e.target.value)
                        setSelectedTime('')
                      }}
                      onFocus={() => setShowTimeDropdown(true)}
                      placeholder="Search or select a time slot (e.g., 10:00)"
                      className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-all text-base font-medium"
                    />
                    {(selectedTime || timeSearch) && (
                      <button
                        onClick={() => {
                          setSelectedTime('')
                          setTimeSearch('')
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}

                    {/* Time Dropdown */}
                    {showTimeDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowTimeDropdown(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-20">
                          {filteredTimeSlots.length > 0 ? (
                            filteredTimeSlots.map((time) => (
                              <button
                                key={time}
                                onClick={() => {
                                  setSelectedTime(time)
                                  setTimeSearch('')
                                  setShowTimeDropdown(false)
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  <Clock className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                                  <span className="font-medium text-gray-900">{time}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                              No time slots found
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Type to search or click to browse available slots
                  </p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="border-b border-gray-200 px-8 py-6">
                <h2 className="text-2xl font-bold text-gray-900">Service Details</h2>
                <p className="text-sm text-gray-600 mt-1">{services.length} services selected</p>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={service.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5" />
                            {service.duration} minutes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">₹{service.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Salon Information */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="border-b border-gray-200 px-8 py-6">
                <h2 className="text-2xl font-bold text-gray-900">Salon Information</h2>
              </div>
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{salon.name}</h3>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-black text-white rounded text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{salon.address}, {salon.city}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">Customers</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">10,000+</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">Rating</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">Top Rated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-red-900 mb-1">Unable to complete booking</p>
                    <p className="text-sm text-red-700">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-gray-200 rounded-2xl sticky top-6 overflow-hidden">
              
              {/* Summary Header */}
              <div className="bg-black text-white px-8 py-6">
                <h2 className="text-2xl font-bold mb-1">Booking Summary</h2>
                <p className="text-sm text-gray-400">Review your details</p>
              </div>

              {/* Summary Content */}
              <div className="p-8 space-y-6">
                
                {/* Appointment Details */}
                {(selectedDate || selectedTime) && (
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Appointment</h3>
                    <div className="space-y-3">
                      {selectedDate && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Date</span>
                          </div>
                          <span className="font-bold text-gray-900">
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                      {selectedTime && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Time</span>
                          </div>
                          <span className="font-bold text-gray-900">{selectedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Price Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Services ({services.length})</span>
                      <span className="font-semibold text-gray-900">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold text-gray-900">{getTotalDuration()} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span className="font-semibold text-gray-900">Included</span>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-3xl font-bold text-gray-900">₹{totalPrice}</span>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  disabled={loading || !selectedDate || !selectedTime}
                  className={`w-full py-5 rounded-xl font-bold text-base transition-all ${
                    loading || !selectedDate || !selectedTime
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Proceed to Payment
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </button>

                {/* Security Badge */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Secured by 256-bit SSL encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* =====================================================
   COMPONENTS
===================================================== */

function ProgressStep({ number, label, completed, active }: { 
  number: string
  label: string
  completed?: boolean
  active?: boolean 
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
        completed 
          ? 'bg-black text-white' 
          : active 
            ? 'bg-black text-white ring-4 ring-black/10' 
            : 'bg-gray-200 text-gray-500'
      }`}>
        {completed ? <Check className="w-5 h-5" /> : number}
      </div>
      <span className={`text-xs font-medium ${
        completed || active ? 'text-gray-900' : 'text-gray-500'
      }`}>
        {label}
      </span>
    </div>
  )
}