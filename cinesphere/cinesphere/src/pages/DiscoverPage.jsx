import React, { useState, useEffect } from 'react'
import { imdb, posterUrl } from '../api/imdb'
import { useDebounce } from '../hooks/useDebounce'
import MovieCard from '../components/MovieCard'
import './DiscoverPage.css'

const GENRES = [
  { id: null, name: 'All' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 10749, name: 'Romance' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
]

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'rating_desc', label: 'Rating ↓' },
  { value: 'rating_asc', label: 'Rating ↑' },
  { value: 'year_desc', label: 'Newest' },
  { value: 'year_asc', label: 'Oldest' },
  { value: 'title_asc', label: 'A → Z' },
]

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ width: '100%', aspectRatio: '2/3' }} />
      <div className="skeleton" style={{ width: '80%', height: 12, marginTop: 8 }} />
      <div className="skeleton" style={{ width: '50%', height: 10, marginTop: 6 }} />
    </div>
  )
}

function HeroBanner({ movie }) {
  const poster = posterUrl(movie)
  const year = movie?.year
  const rating = movie?.vote_average != null ? Number(movie.vote_average).toFixed(1) : null
  const runtime = movie?.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null

  return (
    <div className="hero-banner">
      <div className="hero-banner__gradient" />
      <div className="hero-banner__content">
        <div className="hero-meta">
          <span className="hero-featured">★ FEATURED</span>
        </div>
        <h1 className="hero-title">{movie?.title}</h1>
        <div className="hero-info">
          {year && <span>{year}</span>}
          {movie?.genres?.slice(0, 3).map(g => <span key={g.id}>{g.name}</span>)}
          {runtime && <span>{runtime}</span>}
        </div>
        {rating && <div className="hero-rating">★ {rating}/10</div>}
        {movie?.overview ? (
          <p className="hero-overview">
            {movie.overview.slice(0, 160)}{movie.overview.length > 160 ? '…' : ''}
          </p>
        ) : movie?.actors ? (
          <p className="hero-overview">Starring: {movie.actors}</p>
        ) : null}
        <div className="hero-actions">
          <a
            className="hero-btn hero-btn--primary"
            href={movie?.imdb_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            ↗ View on IMDB
          </a>
        </div>
      </div>
      <div className="hero-poster-wrap">
        {poster && <img src={poster} alt={movie?.title} className="hero-poster" />}
      </div>
    </div>
  )
}

function sortMovies(movies, sortValue) {
  if (sortValue === 'default') return movies
  return [...movies].sort((a, b) => {
    switch (sortValue) {
      case 'rating_desc': return (b.vote_average || 0) - (a.vote_average || 0)
      case 'rating_asc':  return (a.vote_average || 0) - (b.vote_average || 0)
      case 'year_desc':   return (b.year || 0) - (a.year || 0)
      case 'year_asc':    return (a.year || 0) - (b.year || 0)
      case 'title_asc':   return (a.title || '').localeCompare(b.title || '')
      default: return 0
    }
  })
}

function filterByGenre(movies, genreId) {
  if (!genreId) return movies
  return movies.filter(m => m.genre_ids?.includes(genreId) || m.genres?.some(g => g.id === genreId))
}

export default function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [featured, setFeatured] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeGenre, setActiveGenre] = useState(null)
  const [sortValue, setSortValue] = useState('default')
  const debouncedQuery = useDebounce(query, 450)

  useEffect(() => {
    imdb.search('Inception')
      .then(results => { if (results.length > 0) setFeatured(results[0]) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (trimmed.length === 0) {
      setLoading(true)
      setError(null)
      imdb.popular('the')
        .then(results => { setMovies(results); setLoading(false) })
        .catch(() => { setError('Could not load movies.'); setMovies([]); setLoading(false) })
    } else {
      setSearchLoading(true)
      setError(null)
      imdb.search(trimmed)
        .then(results => { setMovies(results); setSearchLoading(false) })
        .catch(() => { setError('Search failed.'); setMovies([]); setSearchLoading(false) })
    }
  }, [debouncedQuery])

  const isSearching = debouncedQuery.trim().length > 0
  const isLoading = loading || searchLoading

  const displayMovies = sortMovies(filterByGenre(movies, activeGenre), sortValue)

  return (
    <div className="discover-page">
      {!isSearching && featured && <HeroBanner movie={featured} />}

      <div className="discover-main">
        <div className="search-wrap">
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search movies & shows…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button className="search-clear" onClick={() => setQuery('')}>✕</button>}
          </div>
        </div>

        {/* Genre filters */}
        {!isSearching && (
          <div className="genre-filters">
            {GENRES.map(g => (
              <button
                key={g.name}
                className={`genre-chip${activeGenre === g.id ? ' active' : ''}`}
                onClick={() => setActiveGenre(g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        <div className="section-header">
          <h2 className="section-title">
            {isSearching ? `Results for "${debouncedQuery}"` : activeGenre ? GENRES.find(g => g.id === activeGenre)?.name : 'Popular Now'}
          </h2>
          {!isLoading && displayMovies.length > 0 && (
            <select
              className="sort-select"
              value={sortValue}
              onChange={e => setSortValue(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}
        </div>

        {error && !isLoading && (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="movie-grid">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !error && displayMovies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎬</div>
            <h3>No results found</h3>
            <p>{isSearching ? 'Try a different search term' : 'No movies in this genre right now'}</p>
          </div>
        ) : !error ? (
          <div className="movie-grid fade-in">
            {displayMovies.map((m, i) => (
              <MovieCard key={m.id} movie={m} style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
