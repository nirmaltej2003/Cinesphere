import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WatchlistProvider } from './contexts/WatchlistContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { ToastProvider } from './contexts/ToastContext'
import RootLayout from './components/RootLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DiscoverPage from './pages/DiscoverPage'
import MovieDetailPage from './pages/MovieDetailPage'
import WatchlistPage from './pages/WatchlistPage'
import FavoritesPage from './pages/FavoritesPage'

export default function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <FavoritesProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<RootLayout />}>
                <Route index element={<Navigate to="/discover" replace />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/movies/:id" element={<MovieDetailPage />} />
                <Route
                  path="/watchlist"
                  element={
                    <ProtectedRoute>
                      <WatchlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/discover" replace />} />
              </Route>
            </Routes>
          </ToastProvider>
        </FavoritesProvider>
      </WatchlistProvider>
    </AuthProvider>
  )
}
