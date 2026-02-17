// src/services/favoritesService.ts

import { Salon } from '../types'

const FAVORITES_KEY = 'luxebook_favorites'

export const getFavorites = (): Salon[] => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY)
    return favorites ? JSON.parse(favorites) : []
  } catch (error) {
    console.error('Failed to get favorites:', error)
    return []
  }
}

export const addToFavorites = (salon: Salon): void => {
  try {
    const favorites = getFavorites()
    const exists = favorites.some(fav => fav.id === salon.id)
    
    if (!exists) {
      favorites.push(salon)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
      console.log('✅ Added to favorites:', salon.name)
    }
  } catch (error) {
    console.error('Failed to add to favorites:', error)
  }
}

export const removeFromFavorites = (salonId: string): void => {
  try {
    const favorites = getFavorites()
    const filtered = favorites.filter(fav => fav.id !== salonId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered))
    console.log('✅ Removed from favorites:', salonId)
  } catch (error) {
    console.error('Failed to remove from favorites:', error)
  }
}

export const toggleFavorite = (salon: Salon): boolean => {
  const favorites = getFavorites()
  const isFavorite = favorites.some(fav => fav.id === salon.id)
  
  if (isFavorite) {
    removeFromFavorites(salon.id)
    return false
  } else {
    addToFavorites(salon)
    return true
  }
}

export const isFavorite = (salonId: string): boolean => {
  const favorites = getFavorites()
  return favorites.some(fav => fav.id === salonId)
}

export const getFavoritesCount = (): number => {
  return getFavorites().length
}

export const clearAllFavorites = (): void => {
  try {
    localStorage.removeItem(FAVORITES_KEY)
    console.log('✅ Cleared all favorites')
  } catch (error) {
    console.error('Failed to clear favorites:', error)
  }
}