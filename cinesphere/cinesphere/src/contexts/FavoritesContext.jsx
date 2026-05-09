import React, { createContext, useContext, useState, useEffect } from 'react'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cs_favorites')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cs_favorites', JSON.stringify(items))
  }, [items])

  const add = (movie) => {
    setItems(prev => {
      if (prev.find(m => m.id === movie.id)) return prev
      return [movie, ...prev]
    })
  }

  const remove = (id) => {
    setItems(prev => prev.filter(m => m.id !== id))
  }

  const isInFavorites = (id) => items.some(m => m.id === id)

  return (
    <FavoritesContext.Provider value={{ items, add, remove, isInFavorites }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be inside FavoritesProvider')
  return ctx
}
