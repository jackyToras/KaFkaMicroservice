import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../services/apiClient'
import { Salon, Service } from '../types'
import LoadingSpinner from '../components/common/LoadingSpinner'

import {
  MapPin,
  Phone,
  Clock,
  Star,
  Check,
  Award,
  Calendar,
  Heart,
  Share2,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  TrendingUp
} from 'lucide-react'

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */

export default function SalonDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)

  /* -------------------------------------------------------
     FETCH
  ------------------------------------------------------- */

  useEffect(() => {
    if (id) {
      fetchAll()
    }
  }, [id])

  const fetchAll = async () => {
    try {
      const salonData = await apiClient.getSalonById(id!)
      const servicesData = await apiClient.getServicesBySalonId(id!)

      setSalon(salonData)
      setServices(servicesData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------------
     SERVICE HANDLING
  ------------------------------------------------------- */

  const toggleService = (service: Service) => {
    const sid = service.id || service._id

    setSelectedServices(prev => {
      const exists = prev.find(s => (s.id || s._id) === sid)

      if (exists) {
        return prev.filter(s => (s.id || s._id) !== sid)
      }

      return [...prev, service]
    })
  }

  const isSelected = (service: Service) => {
    const sid = service.id || service._id
    return selectedServices.some(s => (s.id || s._id) === sid)
  }

  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + s.price,
    0
  )

  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration,
    0
  )

  const handleBooking = () => {
    if (!selectedServices.length) {
      alert('Please select services first')
      return
    }

    navigate('/booking', {
      state: {
        salon,
        services: selectedServices,
        totalPrice,
        totalDuration
      }
    })
  }

  /* -------------------------------------------------------
     STATES
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <LoadingSpinner />
      </div>
    )
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Salon not found
      </div>
    )
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-40">

      {/* =====================================================
         HERO SECTION (REPLACED IMAGE)
      ===================================================== */}

      <div className="relative bg-black text-white overflow-hidden">

        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT */}

            <div className="space-y-6">

              <div className="flex items-center gap-3 text-sm text-gray-300">

                <ShieldCheck className="w-5 h-5 text-green-400" />

                Verified Premium Partner
              </div>

              <h1 className="text-5xl font-bold leading-tight">
                {salon.name}
              </h1>

              <p className="text-gray-300 text-lg max-w-xl">
                Experience world-class beauty services delivered
                by certified professionals in a luxurious environment.
              </p>

              {/* Stats */}

              <div className="flex gap-8 pt-4">

                <HeroStat
                  icon={<Star />}
                  label="Rating"
                  value={salon.rating || '4.9'}
                />

                <HeroStat
                  icon={<TrendingUp />}
                  label="Services"
                  value={`${services.length}+`}
                />

                <HeroStat
                  icon={<Sparkles />}
                  label="Clients"
                  value="10k+"
                />

              </div>

            </div>

            {/* RIGHT */}

            <div className="relative">

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">

                {/* Actions */}
                <div className="flex justify-end gap-3">

                  <IconButton
                    onClick={() => setIsLiked(!isLiked)}
                    active={isLiked}
                    icon={<Heart />}
                  />

                  <IconButton icon={<Share2 />} />

                </div>

                {/* Info */}

                <div className="space-y-4 text-gray-200">

                  <InfoRow
                    icon={<MapPin />}
                    text={`${salon.address}, ${salon.city}`}
                  />

                  {salon.phone && (
                    <InfoRow
                      icon={<Phone />}
                      text={salon.phone}
                    />
                  )}

                </div>

                {/* Trust */}

                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">

                  <Award className="text-yellow-400" />

                  <div>
                    <div className="font-semibold">
                      Trusted Partner
                    </div>
                    <div className="text-sm text-gray-300">
                      100% verified & insured
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </div>


      {/* =====================================================
         SERVICES
      ===================================================== */}

      <div className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center mb-16">

          <h2 className="text-4xl font-bold mb-4">
            Our Premium Services
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our wide range of curated beauty services,
            designed for excellence and comfort.
          </p>

        </div>

        {services.length === 0 ? (

          <div className="text-center text-gray-500">
            No services available
          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

            {services.map(service => {

              const selected = isSelected(service)

              return (

                <ServiceCard
                  key={service.id || service._id}
                  service={service}
                  selected={selected}
                  onClick={() => toggleService(service)}
                />

              )
            })}

          </div>

        )}

      </div>


      {/* =====================================================
         BOTTOM BAR
      ===================================================== */}

      {selectedServices.length > 0 && (

        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t shadow-2xl z-50">

          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

            <div>

              <div className="text-sm text-gray-600 mb-1">
                {selectedServices.length} services selected
              </div>

              <div className="flex items-center gap-6">

                <div className="text-3xl font-bold">
                  ₹{totalPrice}
                </div>

                <div className="flex items-center gap-2 text-gray-600">

                  <Clock size={18} />

                  {totalDuration} min

                </div>

              </div>

            </div>

            <button
              onClick={handleBooking}
              className="
                px-10 py-4
                bg-black text-white
                rounded-xl
                font-semibold
                shadow-lg
                hover:bg-gray-900
                hover:scale-105
                transition
              "
            >
              Proceed to Booking
            </button>

          </div>

        </div>

      )}

    </div>
  )
}


/* =====================================================
   COMPONENTS
===================================================== */


function HeroStat({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">

      <div className="p-3 bg-white/10 rounded-lg">
        {icon}
      </div>

      <div>
        <div className="font-bold text-xl">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>

    </div>
  )
}


function InfoRow({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span>{text}</span>
    </div>
  )
}


function IconButton({ icon, onClick, active }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-11 h-11
        rounded-full
        flex items-center justify-center
        transition
        ${
          active
            ? 'bg-white text-black'
            : 'bg-white/10 text-white hover:bg-white hover:text-black'
        }
      `}
    >
      {icon}
    </button>
  )
}


/* =====================================================
   SERVICE CARD (WITH REAL HOVER EFFECT)
===================================================== */

function ServiceCard({
  service,
  selected,
  onClick
}: {
  service: Service
  selected: boolean
  onClick: () => void
}) {
  return (

    <div
      onClick={onClick}
      className={`
        group cursor-pointer
        rounded-3xl overflow-hidden
        border
        transition-all duration-300

        hover:-translate-y-2
        hover:shadow-2xl

        ${
          selected
            ? 'border-black shadow-xl scale-[1.02]'
            : 'border-gray-200'
        }
      `}
    >

      {/* Header */}

      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">

        {service.image ? (
          <img
            src={service.image}
            className="w-full h-full object-cover group-hover:scale-110 transition"
          />
        ) : (
          <span className="text-4xl">✂️</span>
        )}

        {/* Price */}

        <div className="absolute top-4 left-4 bg-white px-4 py-1 rounded-full text-sm font-bold shadow">
          ₹{service.price}
        </div>

        {/* Duration */}

        <div className="absolute bottom-4 left-4 bg-black text-white px-3 py-1 rounded-full text-xs flex gap-1 items-center">
          <Clock size={12} />
          {service.duration} min
        </div>

      </div>


      {/* Body */}

      <div className="p-6 space-y-4">

        <h3 className="font-bold text-xl group-hover:text-black transition">
          {service.name}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-2">
          {service.description}
        </p>

        <div className="flex justify-between items-center pt-3 border-t">

          <span className="font-semibold text-sm">

            {selected ? 'Selected' : 'Add Service'}

          </span>

          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition

              ${
                selected
                  ? 'bg-black'
                  : 'bg-gray-900 group-hover:bg-black'
              }
            `}
          >

            {selected ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white" />
            )}

          </div>

        </div>

      </div>

    </div>

  )
}
