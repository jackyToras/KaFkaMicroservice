import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../services/apiClient'
import type { Salon } from '../types'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { addToFavorites, removeFromFavorites, isFavorite } from '../services/favoritesService'
import { Search, Sparkles, TrendingUp, Filter, MapPin, Star, ArrowRight, Heart, Eye } from 'lucide-react'

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [hoveredSalon, setHoveredSalon] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSalons()
  }, [])

  useEffect(() => {
    if (search.trim()) {
      const filtered = salons.filter(
        (salon) =>
          salon.name?.toLowerCase().includes(search.toLowerCase()) ||
          salon.city?.toLowerCase().includes(search.toLowerCase()) ||
          salon.address?.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredSalons(filtered)
    } else {
      setFilteredSalons(salons)
    }
  }, [search, salons])

  useEffect(() => {
    // Initialize favorites state
    const favSet = new Set<string>()
    salons.forEach(salon => {
      if (isFavorite(salon.id || salon._id)) {
        favSet.add(salon.id || salon._id)
      }
    })
    setFavorites(favSet)
  }, [salons])

  const fetchSalons = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getSalons(1, 10)
      
      const salonData = Array.isArray(response) ? response : []
      setSalons(salonData)
      setFilteredSalons(salonData)
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch salons'
      console.error('Failed to fetch salons:', error)
      setError(errorMsg)
      setSalons([])
      setFilteredSalons([])
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (e: React.MouseEvent, salon: Salon) => {
    e.preventDefault() // Prevent Link navigation
    e.stopPropagation() // Stop event bubbling
    
    const salonId = salon.id || salon._id
    
    if (favorites.has(salonId)) {
      removeFromFavorites(salonId)
      setFavorites(prev => {
        const newSet = new Set(prev)
        newSet.delete(salonId)
        return newSet
      })
    } else {
      addToFavorites(salon)
      setFavorites(prev => new Set(prev).add(salonId))
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Header Section - Enhanced */}
      <div className="mb-8 md:mb-12 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-sm font-semibold text-blue-700 mb-2 hover:scale-105 transition-transform duration-300 cursor-default group">
              <Sparkles className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
              <span>Premium Selection</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-3 tracking-tight hover:scale-105 transition-transform duration-300 inline-block">
              Explore Salons
            </h1>
            
            <div className="flex items-center gap-3">
              <p className="text-slate-600 text-lg md:text-xl">
                Find and book from <span className="font-bold text-slate-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{salons?.length || 0}</span> verified salons
              </p>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-700">All Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message - Enhanced */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-slideDown">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-lg">Error Loading Salons</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar - Ultra Enhanced */}
      <div className="mb-10 md:mb-12">
        <div className="relative group">
          {/* Animated glow effect */}
          <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${isSearchFocused ? 'opacity-30' : ''}`}></div>
          
          <div className="relative">
            <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${isSearchFocused ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
              <Search className="w-5 h-5" />
            </div>
            
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by name, city, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-12 pr-4 py-4 md:py-5 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg bg-white hover:border-slate-300 hover:shadow-lg group-hover:shadow-xl"
            />
            
            {/* Animated search suggestions indicator */}
            {search && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-600">{filteredSalons?.length || 0} found</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Search results summary - Enhanced */}
        {search && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full animate-slideDown">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">
                Found {filteredSalons?.length || 0} result{(filteredSalons?.length || 0) !== 1 ? 's' : ''} for "{search}"
              </p>
            </div>
            
            <button
              onClick={() => setSearch('')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 hover:scale-105 transition-all duration-200"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Filter chips */}
        <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button className="group flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 whitespace-nowrap hover:scale-105">
            <Filter className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            All Salons
          </button>
          <button className="px-4 py-2 bg-white border-2 border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 whitespace-nowrap hover:scale-105">
            Top Rated
          </button>
          <button className="px-4 py-2 bg-white border-2 border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50 transition-all duration-300 whitespace-nowrap hover:scale-105">
            Nearby
          </button>
          <button className="px-4 py-2 bg-white border-2 border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all duration-300 whitespace-nowrap hover:scale-105">
            New Arrivals
          </button>
        </div>
      </div>

      {/* Salons Grid - Custom Cards with Same HomePage Styling */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner />
          <p className="mt-6 text-slate-600 font-medium animate-pulse">Loading amazing salons...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 group">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
            <svg
              className="relative mx-auto h-16 w-16 text-red-400 group-hover:scale-110 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-slate-900 font-bold text-xl mb-2">Failed to load salons</p>
          <p className="text-slate-600 mb-6">Something went wrong. Please try again.</p>
          <button
            onClick={fetchSalons}
            className="group/btn relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 overflow-hidden hover:scale-110"
          >
            <span className="relative z-10">Try Again</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      ) : filteredSalons && filteredSalons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredSalons.map((salon, index) => {
            const salonId = salon.id || salon._id
            const isFav = favorites.has(salonId)
            
            return (
              <Link
                key={salonId}
                to={`/salons/${salonId}`}
                className="group relative bg-white rounded-3xl overflow-hidden border border-neutral-200 hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={() => setHoveredSalon(index)}
                onMouseLeave={() => setHoveredSalon(null)}
              >
                {/* Animated border gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-sm -z-10"></div>
                
                <div className="relative h-64 bg-neutral-100 overflow-hidden">
                  <img
                    src={salon.image || salon.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'}
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Hover overlay icons */}
                  <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <button
                      onClick={(e) => toggleFavorite(e, salon)}
                      className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-125 transition-transform duration-300 shadow-xl z-10"
                    >
                      <Heart className={`w-6 h-6 transition-all ${isFav ? 'text-pink-500 fill-pink-500' : 'text-pink-500 hover:fill-pink-500'}`} />
                    </button>
                    <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-125 transition-transform duration-300 cursor-pointer shadow-xl">
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
                <div className="p-7 bg-white group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-neutral-50 transition-all duration-500">
                  <h3 className="text-2xl font-black text-black mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {salon.name}
                  </h3>
                  <div className="flex items-center justify-between pt-5 border-t border-neutral-100 group-hover:border-neutral-200 transition-colors">
                    <span className="text-sm font-bold text-black group-hover:text-purple-600 transition-colors">View Details</span>
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90">
                      <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all duration-500 group">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
            <svg
              className="relative mx-auto h-20 w-20 text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-slate-900 font-bold text-2xl mb-2">
            {search ? 'No salons found matching your search' : 'No salons available'}
          </p>
          <p className="text-slate-600 text-lg mb-6">
            {search ? 'Try a different search term or clear filters' : 'Check back soon for new salons'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

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
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-30px, 30px) scale(0.9);
          }
          66% {
            transform: translate(20px, -20px) scale(1.1);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.1;
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}