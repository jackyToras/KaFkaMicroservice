import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiClient } from '../services/apiClient'
import { 
  CheckCircle, Calendar, Clock, CreditCard, Download, 
  Mail, Phone, MapPin, ArrowRight, Home, FileText,
  Shield, AlertCircle, Loader, ChevronRight, User,
  Building, Receipt, Check
} from 'lucide-react'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      const paymentOrderId = searchParams.get('order_id')

      if (!paymentOrderId) {
        setError('Payment order ID not found')
        setLoading(false)
        return
      }

      console.log('🔍 Verifying payment:', paymentOrderId)

      const paymentOrder = await apiClient.getPaymentOrder(paymentOrderId)

      console.log('✅ Payment verified:', paymentOrder)

      setPaymentDetails(paymentOrder)
      setLoading(false)

    } catch (err: any) {
      console.error('❌ Payment verification failed:', err)
      setError('Failed to verify payment. Please contact support.')
      setLoading(false)
    }
  }

  const safeText = (value: any) => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  const safeAmount = (value: any) => {
    if (!value) return ''
    if (typeof value === 'object') {
      return value.amount || value.value || JSON.stringify(value)
    }
    return value
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-black border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your transaction</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          
          {/* Error Card */}
          <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-xl overflow-hidden">
            
            {/* Error Header */}
            <div className="bg-black text-white px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Payment Verification Failed</h1>
                  <p className="text-sm text-gray-300 mt-1">Unable to confirm your transaction</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Error Message */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                <p className="text-gray-700 leading-relaxed">{error}</p>
              </div>

              {/* Support Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>support@findmystyle.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>1-800-SALON-HELP</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate('/')}
                className="w-full bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-black rounded-full mb-6 relative">
            <div className="absolute inset-0 bg-black rounded-full animate-ping opacity-20"></div>
            <CheckCircle className="w-14 h-14 text-white relative z-10" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Payment Successful</h1>
          <p className="text-lg text-gray-600">Your booking has been confirmed and processed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Transaction Details */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gray-900 text-white px-6 py-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Transaction Details
                </h2>
              </div>
              
              <div className="p-6">
                {paymentDetails && (
                  <div className="space-y-4">
                    
                    {/* Amount */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ₹{safeAmount(paymentDetails.amount)}
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-black text-white rounded-lg">
                        <span className="text-sm font-semibold">PAID</span>
                      </div>
                    </div>

                    {/* Transaction ID */}
                    <DetailRow 
                      icon={<FileText className="w-4 h-4" />}
                      label="Transaction ID"
                      value={safeText(paymentDetails.id)}
                      copyable
                    />

                    {/* Payment Method */}
                    <DetailRow 
                      icon={<CreditCard className="w-4 h-4" />}
                      label="Payment Method"
                      value="Credit Card"
                    />

                    {/* Status */}
                    <DetailRow 
                      icon={<CheckCircle className="w-4 h-4" />}
                      label="Status"
                      value={
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-lg text-sm font-medium">
                          <Check className="w-3.5 h-3.5" />
                          {safeText(paymentDetails.status)}
                        </span>
                      }
                    />

                    {/* Date & Time */}
                    <DetailRow 
                      icon={<Clock className="w-4 h-4" />}
                      label="Transaction Date"
                      value={new Date().toLocaleString('en-US', {
                        dateStyle: 'long',
                        timeStyle: 'short'
                      })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Confirmation Sent</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    A detailed confirmation email with your booking information and receipt has been sent to your registered email address. Please check your inbox and spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gray-900 text-white px-6 py-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Important Information
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <InfoItem 
                  title="Cancellation Policy"
                  description="Free cancellation up to 24 hours before your appointment. Cancellations within 24 hours may incur a fee."
                />
                <InfoItem 
                  title="Rescheduling"
                  description="You can reschedule your appointment from the bookings page at no additional cost, subject to availability."
                />
                <InfoItem 
                  title="Arrival Time"
                  description="Please arrive 10 minutes before your scheduled appointment time to complete any necessary formalities."
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gray-900 text-white px-6 py-4">
                <h2 className="text-lg font-bold">Quick Actions</h2>
              </div>
              
              <div className="p-4 space-y-3">
                <ActionButton
                  icon={<Calendar className="w-5 h-5" />}
                  text="View My Bookings"
                  onClick={() => navigate('/customer/bookings')}
                  primary
                />
                <ActionButton
                  icon={<Download className="w-5 h-5" />}
                  text="Download Receipt"
                  onClick={() => {}}
                />
                <ActionButton
                  icon={<Home className="w-5 h-5" />}
                  text="Back to Home"
                  onClick={() => navigate('/')}
                />
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-gray-900" />
                <h3 className="font-bold text-gray-900">Secure Payment</h3>
              </div>
              <div className="space-y-3">
                <SecurityItem text="256-bit SSL encryption" />
                <SecurityItem text="PCI DSS compliant" />
                <SecurityItem text="Verified transaction" />
                <SecurityItem text="Protected by fraud detection" />
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4">Need Assistance?</h3>
              <div className="space-y-3">
                <SupportItem
                  icon={<Mail className="w-4 h-4" />}
                  text="support@findmystyle.com"
                />
                <SupportItem
                  icon={<Phone className="w-4 h-4" />}
                  text="1-800-SALON-HELP"
                />
                <SupportItem
                  icon={<Clock className="w-4 h-4" />}
                  text="24/7 Customer Support"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
            <Shield className="w-4 h-4" />
            <span>Your payment information is secured and encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =====================================================
   COMPONENTS
===================================================== */

function DetailRow({ icon, label, value, copyable }: { 
  icon: React.ReactNode
  label: string
  value: any
  copyable?: boolean 
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="text-gray-400">
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{label}</p>
          {typeof value === 'string' ? (
            <p className="text-sm font-semibold text-gray-900 font-mono">{value}</p>
          ) : (
            value
          )}
        </div>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  )
}

function InfoItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm mb-1">{title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function ActionButton({ 
  icon, 
  text, 
  onClick, 
  primary 
}: { 
  icon: React.ReactNode
  text: string
  onClick: () => void
  primary?: boolean 
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all ${
        primary
          ? 'bg-black text-white hover:bg-gray-900 shadow-lg'
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {text}
      </span>
      <ChevronRight className="w-5 h-5" />
    </button>
  )
}

function SecurityItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <Check className="w-4 h-4 text-gray-900 flex-shrink-0" />
      <span>{text}</span>
    </div>
  )
}

function SupportItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-700">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="font-medium">{text}</span>
    </div>
  )
}