import React, { createContext, useContext, useState, useEffect } from 'react'

const WatchlistContext = createContext(null)

export function WatchlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cs_watchlist')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cs_watchlist', JSON.stringify(items))
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

  const isInWatchlist = (id) => items.some(m => m.id === id)

  return (
    <WatchlistContext.Provider value={{ items, add, remove, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be inside WatchlistProvider')
  return ctx
}
