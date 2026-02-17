import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFavorites, removeFromFavorites } from '../services/favoritesService'
import { Salon } from '../types'
import { Heart, MapPin, Star, ArrowRight, Trash2 } from 'lucide-react'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    setLoading(true)
    const favs = getFavorites()
    setFavorites(favs)
    setLoading(false)
  }

  const handleRemove = (salonId: string) => {
    removeFromFavorites(salonId)
    setFavorites(prev => prev.filter(s => s.id !== salonId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/" 
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-gray-700 rotate-180" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-gray-900">My Favorites</h1>
              <p className="text-gray-600 mt-1">
                {favorites.length} {favorites.length === 1 ? 'salon' : 'salons'} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {favorites.length === 0 ? (
          // Empty State
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Start adding salons to your favorites to see them here
            </p>
            <Link
              to="/salons"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full font-bold hover:shadow-lg transition-all"
            >
              Browse Salons
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          // Favorites Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((salon) => (
              <div
                key={salon.id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(salon.id)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg group/remove"
                  aria-label="Remove from favorites"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500 group-hover/remove:text-white group-hover/remove:fill-white transition-all" />
                </button>

                {/* Image */}
                <Link to={`/salons/${salon.id}`} className="block">
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    <img
                      src={salon.image || salon.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'}
                      alt={salon.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Rating Badge */}
                    {salon.rating > 0 && (
                      <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 bg-white rounded-full shadow-lg">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-gray-900">{salon.rating}</span>
                      </div>
                    )}

                    {/* Location on Hover */}
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-gray-900">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">{salon.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-500 group-hover:bg-clip-text transition-all">
                      {salon.name}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors">
                        View Details
                      </span>
                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-500 transition-all">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}