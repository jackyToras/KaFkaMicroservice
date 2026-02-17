import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../services/apiClient'
import { Salon } from '../types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { MapPin, Star, ArrowRight, Award, Zap, TrendingUp, Heart, Eye, CheckCircle, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { isFavorite, toggleFavorite } from '../services/favoritesService'

export default function HomePage() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredSalon, setHoveredSalon] = useState<number | null>(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({})
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({})
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const hasFetched = useRef(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchSalons()
    }
  }, [])

  // Parallax mouse movement effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Auto-play testimonials
  useEffect(() => {
    if (isAutoPlay) {
      autoPlayRef.current = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
      }, 5000)
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isAutoPlay])

  // Intersection Observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    const elements = document.querySelectorAll('[data-animate]')
    elements.forEach((el) => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
  }, [salons])

  // Update favorites status when salons change
  useEffect(() => {
    const favoriteStatus: {[key: string]: boolean} = {}
    salons.forEach(salon => {
      favoriteStatus[salon.id] = isFavorite(salon.id)
    })
    setFavorites(favoriteStatus)
  }, [salons])

  const fetchSalons = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getSalons()
      setSalons(data.slice(0, 6))
    } catch (error: any) {
      console.error('❌ Failed to fetch salons')
    } finally {
      setLoading(false)
    }
  }

  const testimonials = [
    {
      name: "Jacky Toras",
      role: "Regular Client",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      content: "The booking process was incredibly smooth. Found the perfect salon for my needs and the stylist was amazing. Highly recommend!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "First-time User",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      content: "Best platform for finding quality salons. The verified professionals gave me peace of mind, and the results exceeded my expectations.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "VIP Member",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      content: "I've been using this service for over a year. The consistency in quality and the exclusive member benefits make it absolutely worth it.",
      rating: 5
    }
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlay(false)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlay(false)
  }

  return (
    <div className="min-h-screen -mx-6 md:-mx-8">
      {/* Hero Section - Right Aligned Text, Video Visible Left */}
      <div className="relative bg-neutral-900 text-white overflow-hidden">
        {/* Background Video with Vignette */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
            style={{ 
              opacity: 0.3,
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px) scale(1.1)`
            }}
          >
            <source src="/videos/salon-video.mp4" type="video/mp4" />
          </video>
          
          {/* Professional Vignette Overlay - Stronger on Right for Text */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/80"></div>
          
          {/* Subtle animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-blue-900/10 animate-gradient"></div>
        </div>
        
        {/* Content Container - Right Aligned */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
            <div className="min-h-[90vh] flex items-center py-20 md:py-24">
              
              {/* Right Side Content */}
              <div className="ml-auto max-w-2xl">
                
                {/* Trust Badge */}
                <div className="mb-8 animate-fade-in">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                    <CheckCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" strokeWidth={2} />
                    <span className="text-sm font-medium text-white/90 tracking-wide">
                      Trusted by 10,000+ customers worldwide
                    </span>
                  </div>
                </div>

                {/* Main Headline */}
                <div className="mb-8 animate-fade-in-up">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.1] text-white">
                    Your beauty,
                    <br />
                    <span className="group inline-block italic font-light relative cursor-default">
                      redefined
                      {/* Professional Underline Effect on Hover */}
                      <span className="absolute bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-white/60 to-white/30 group-hover:w-full transition-all duration-700 ease-out"></span>
                      {/* Subtle Glow Effect */}
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-2xl bg-white/10 transition-opacity duration-700"></span>
                    </span>
                  </h1>
                </div>
                
                {/* Value Proposition */}
                <div className="mb-10 animate-fade-in-up animation-delay-200">
                  <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light">
                    Experience luxury salon services with world-class professionals. 
                    Book in seconds, transform in minutes.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up animation-delay-400">
                  <Link
                    to="/salons"
                    className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-neutral-900 rounded-lg font-semibold text-base overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                  >
                    <span className="relative z-10">Explore Salons</span>
                    <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  <Link
                    to="/salons"
                    className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/5 backdrop-blur-sm text-white border border-white/20 rounded-lg font-semibold text-base overflow-hidden transition-all duration-300 hover:border-white/30"
                  >
                    <span className="relative z-10">See How It Works</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </div>

                {/* Stats - Horizontal Layout */}
                <div className="grid grid-cols-3 gap-6 animate-fade-in-up animation-delay-600">
                  <div className="group">
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 transition-all duration-500 hover:bg-white/10 hover:border-white/20 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative">
                        <div className="text-3xl md:text-4xl font-semibold mb-1 text-white tracking-tight group-hover:scale-110 transition-transform duration-300">
                          {salons.length}+
                        </div>
                        <div className="text-xs text-white/60 font-medium">
                          Premium Salons
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 transition-all duration-500 hover:bg-white/10 hover:border-white/20 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative">
                        <div className="text-3xl md:text-4xl font-semibold mb-1 text-white tracking-tight group-hover:scale-110 transition-transform duration-300">
                          4.9★
                        </div>
                        <div className="text-xs text-white/60 font-medium">
                          Avg. Rating
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 transition-all duration-500 hover:bg-white/10 hover:border-white/20 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative">
                        <div className="text-3xl md:text-4xl font-semibold mb-1 text-white tracking-tight group-hover:scale-110 transition-transform duration-300">
                          24/7
                        </div>
                        <div className="text-xs text-white/60 font-medium">
                          Instant Booking
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
          <div 
            id="features-section"
            data-animate
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 transition-all duration-1000 ${
              isVisible['features-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            
            <div className="group flex items-start gap-4 hover:translate-y-[-4px] transition-all duration-300">
              <div className="relative flex-shrink-0 w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Zap className="relative w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1.5 text-lg group-hover:text-neutral-800 transition-colors">
                  Instant Booking
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Book appointments in under 60 seconds with our streamlined platform
                </p>
              </div>
            </div>
            
            <div className="group flex items-start gap-4 hover:translate-y-[-4px] transition-all duration-300">
              <div className="relative flex-shrink-0 w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Award className="relative w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1.5 text-lg group-hover:text-neutral-800 transition-colors">
                  Verified Professionals
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  All stylists are licensed, certified, and thoroughly vetted
                </p>
              </div>
            </div>
            
            <div className="group flex items-start gap-4 hover:translate-y-[-4px] transition-all duration-300">
              <div className="relative flex-shrink-0 w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <TrendingUp className="relative w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1.5 text-lg group-hover:text-neutral-800 transition-colors">
                  Best Price Guarantee
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Exclusive member pricing and transparent cost breakdowns
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Customer Testimonials Section */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28">
          
          <div 
            id="testimonials-header"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible['testimonials-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-semibold mb-6 hover:scale-105 transition-transform duration-300">
              <Star className="w-4 h-4 fill-white" />
              TESTIMONIALS
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-4 tracking-tight">
              Loved by thousands
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Don't just take our word for it — hear from our satisfied customers
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div 
            id="testimonials-carousel"
            data-animate
            className={`relative max-w-4xl mx-auto transition-all duration-1000 ${
              isVisible['testimonials-carousel'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-neutral-200 overflow-hidden hover:shadow-2xl transition-shadow duration-500">
              
              {/* Animated background gradient */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/30 to-blue-100/30 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
              
              <div className="relative flex items-start gap-6 mb-8">
                <Quote className="w-12 h-12 text-neutral-300 flex-shrink-0 animate-float" strokeWidth={1.5} />
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-scale-in" 
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-xl md:text-2xl text-neutral-800 leading-relaxed font-light mb-6 transition-all duration-500">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={testimonials[currentTestimonial].image} 
                        alt={testimonials[currentTestimonial].name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-neutral-200 transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 text-lg">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {testimonials[currentTestimonial].role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="relative flex items-center justify-between border-t border-neutral-200 pt-6">
                <div className="flex gap-3">
                  <button
                    onClick={prevTestimonial}
                    className="w-10 h-10 rounded-lg border border-neutral-300 flex items-center justify-center hover:bg-neutral-900 hover:border-neutral-900 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="w-10 h-10 rounded-lg border border-neutral-300 flex items-center justify-center hover:bg-neutral-900 hover:border-neutral-900 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentTestimonial(index)
                        setIsAutoPlay(false)
                      }}
                      className={`h-2 rounded-full transition-all duration-500 hover:scale-110 ${
                        index === currentTestimonial 
                          ? 'bg-neutral-900 w-8' 
                          : 'bg-neutral-300 hover:bg-neutral-400 w-2'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Featured Salons Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-32">
          
          <div 
            id="salons-header"
            data-animate
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible['salons-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-bold mb-6 shadow-lg hover:scale-110 hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-500 cursor-default overflow-hidden group">
              <Star className="w-4 h-4 fill-white group-hover:animate-spin-slow" />
              <span className="relative z-10">FEATURED</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight hover:scale-105 transition-transform duration-300 inline-block cursor-default">
              Discover excellence
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto hover:text-neutral-800 transition-colors">
              Handpicked salons delivering world-class experiences
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : salons.length > 0 ? (
            <>
              <div 
                id="salons-grid"
                data-animate
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${
                  isVisible['salons-grid'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                {salons.map((salon, index) => (
                  <Link
                    key={salon.id}
                    to={`/salons/${salon.id}`}
                    className="group relative bg-white rounded-3xl overflow-hidden border border-neutral-200 hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` 
                    }}
                    onMouseEnter={() => setHoveredSalon(index)}
                    onMouseLeave={() => setHoveredSalon(null)}
                  >
                    {/* Animated border gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-sm -z-10"></div>
                    
                    <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                      <img
                        src={salon.image || salon.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'}
                        alt={salon.name}
                        className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Hover overlay icons */}
                      <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        {/* Heart Button - Add to Favorites */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite(salon)
                            setFavorites(prev => ({
                              ...prev,
                              [salon.id]: !prev[salon.id]
                            }))
                          }}
                          className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-125 active:scale-110 transition-transform duration-300 cursor-pointer shadow-xl hover:shadow-2xl"
                        >
                          <Heart 
                            className={`w-6 h-6 transition-all duration-300 ${
                              favorites[salon.id] 
                                ? 'text-pink-500 fill-pink-500 animate-heart-beat' 
                                : 'text-pink-500 hover:fill-pink-500'
                            }`} 
                          />
                        </button>
                        {/* Eye Button - View Details */}
                        <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-125 active:scale-110 transition-transform duration-300 cursor-pointer shadow-xl hover:shadow-2xl">
                          <Eye className="w-6 h-6 text-blue-500" />
                        </div>
                      </div>
                      
                      {salon.rating > 0 && (
                        <div className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-xl backdrop-blur-sm group-hover:scale-110 group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 transition-all duration-300">
                          <Star className={`w-4 h-4 text-yellow-500 fill-yellow-500 ${hoveredSalon === index ? 'animate-bounce' : ''}`} />
                          <span className="text-sm font-black text-black group-hover:text-white transition-colors">{salon.rating}</span>
                        </div>
                      )}
                      <div className="absolute bottom-5 left-5 right-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-2 text-white text-sm font-medium bg-black/50 backdrop-blur-md px-4 py-2 rounded-full">
                          <MapPin className="w-4 h-4 animate-bounce" />
                          <span>{salon.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative p-7 bg-white group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-neutral-50 transition-all duration-500 overflow-hidden">
                      {/* Subtle shimmer effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 group-hover:translate-x-full transition-all duration-1000"></div>
                      
                      <h3 className="relative text-2xl font-black text-black mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {salon.name}
                      </h3>
                      <div className="relative flex items-center justify-between pt-5 border-t border-neutral-100 group-hover:border-neutral-200 transition-colors">
                        <span className="text-sm font-bold text-black group-hover:text-purple-600 transition-colors">View Details</span>
                        <div className="relative w-10 h-10 bg-black rounded-full flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90 overflow-hidden">
                          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform relative z-10" />
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-16 text-center">
                <Link
                  to="/salons"
                  className="group relative inline-flex items-center gap-3 px-10 py-5 bg-black text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-black/50 transition-all duration-300 overflow-hidden hover:scale-110 active:scale-105"
                >
                  <span className="relative z-10">View All Salons</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-black group-hover:scale-150 transition-transform duration-700"></div>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-neutral-600">No salons available</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/50 via-neutral-900 to-neutral-800/50"></div>
        
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div 
          id="cta-section"
          data-animate
          className={`relative max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-24 md:py-32 text-center transition-all duration-1000 ${
            isVisible['cta-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-semibold mb-6 leading-tight tracking-tight">
              Ready to look{' '}
              <span className="italic font-light relative inline-block">
                absolutely stunning?
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></span>
              </span>
            </h2>
            <p className="text-xl text-white/70 mb-10 font-light max-w-2xl mx-auto">
              Join thousands transforming their beauty routine every day
            </p>
            <Link
              to="/salons"
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-neutral-900 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-white/95 hover:scale-105 active:scale-100 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Start Your Journey</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
              <div className="absolute inset-0 bg-gradient-to-r from-white to-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(20px) translateX(-10px);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes heart-beat {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.2);
          }
          50% {
            transform: scale(1);
          }
          75% {
            transform: scale(1.1);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .animate-heart-beat {
          animation: heart-beat 0.6s ease-in-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}