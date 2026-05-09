import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { imdb, posterUrl } from '../api/imdb'
import { useWatchlist } from '../contexts/WatchlistContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import './MovieDetailPage.css'

const AVATAR_COLORS = ['#e74c3c','#e67e22','#2ecc71','#3498db','#9b59b6','#1abc9c','#e91e8c','#f39c12']

function CastAvatar({ person, i }) {
  const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
  const initials = person.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
  return (
    <div className="cast-avatar" title={`${person.name}${person.character ? ` as ${person.character}` : ''}`}>
      <span style={{ background: color }}>{initials}</span>
    </div>
  )
}

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { add: addWatchlist, remove: removeWatchlist, isInWatchlist } = useWatchlist()
  const { add: addFavorite, remove: removeFavorite, isInFavorites } = useFavorites()
  const { isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Use route state as immediate fallback while API loads
    const routeMovie = location.state?.movie
    if (routeMovie) {
      setMovie(routeMovie)
      setLoading(false)
    }

    // Always try to fetch full details to enrich the data
    imdb.detail(id, routeMovie || {})
      .then(data => {
        // Merge: prefer API data but fall back to route state fields
        setMovie(prev => ({ ...(prev || {}), ...data }))
        setLoading(false)
      })
      .catch(() => {
        if (!routeMovie) {
          setError('Could not load movie details')
        }
        setLoading(false)
      })
  }, [id])

  if (loading && !movie) return (
    <div className="spinner-wrap" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  if (error || !movie) return (
    <div className="detail-error">
      <h2>Movie not found</h2>
      <button className="btn-amber" onClick={() => navigate('/discover')}>Back to Discover</button>
    </div>
  )

  const poster   = posterUrl(movie)
  const year     = movie.year
  const runtime  = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null
  const rating   = movie.vote_average != null ? Number(movie.vote_average).toFixed(1) : null
  const votes    = movie.vote_count
    ? movie.vote_count > 1000 ? `${(movie.vote_count / 1000).toFixed(1)}K` : String(movie.vote_count)
    : null
  const genres   = movie.genres || []
  const cast     = movie.cast || []
  const director = movie.director
  const inWatchlist = isInWatchlist(movie.id)
  const inFavorites = isInFavorites(movie.id)

  const movieSnapshot = {
    id: movie.id,
    title: movie.title,
    poster_url: movie.poster_url,
    poster_path: null,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    year: movie.year,
    genre_ids: genres.map(g => g.id),
  }

  const handleWatchlist = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (inWatchlist) { removeWatchlist(movie.id); addToast('Removed from Watchlist', 'info') }
    else { addWatchlist(movieSnapshot); addToast('Added to Watchlist ✓', 'success') }
  }

  const handleFavorite = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (inFavorites) { removeFavorite(movie.id); addToast('Removed from Favorites', 'info') }
    else { addFavorite(movieSnapshot); addToast('Added to Favorites ♥', 'success') }
  }

  return (
    <div className="detail-page">
      <div className="detail-backdrop-overlay" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', position: 'fixed', inset: 0, zIndex: 0 }} />

      <div className="detail-inner fade-in">
        <button className="detail-back" onClick={() => navigate('/discover')}>← Back to Discover</button>

        <div className="detail-main">
          {/* Poster */}
          <div className="detail-poster-col">
            <div className="detail-poster-wrap">
              {poster
                ? <img src={poster} alt={movie.title} className="detail-poster" />
                : <div className="detail-poster-placeholder">{movie.title?.slice(0, 2).toUpperCase()}</div>
              }
            </div>
          </div>

          {/* Info */}
          <div className="detail-info-col">
            {/* Genres */}
            <div className="detail-genres">
              {genres.map((g, i) => (
                <React.Fragment key={g.id}>
                  <span className="genre-tag">{g.name.toUpperCase()}</span>
                  {i < genres.length - 1 && <span className="genre-sep">·</span>}
                </React.Fragment>
              ))}
            </div>

            <h1 className="detail-title">{movie.title}</h1>
            <p className="detail-meta-line">
              {director && `Directed by ${director} · `}{year}{runtime && ` · ${runtime}`}
            </p>

            {/* Stats */}
            <div className="detail-stats">
              {rating && (
                <div className="stat-box stat-box--amber">
                  <span className="stat-label">RATING</span>
                  <span className="stat-value">★ {rating}</span>
                </div>
              )}
              {votes && (
                <div className="stat-box">
                  <span className="stat-label">VOTES</span>
                  <span className="stat-value">{votes}</span>
                </div>
              )}
              {runtime && (
                <div className="stat-box">
                  <span className="stat-label">RUNTIME</span>
                  <span className="stat-value">{runtime}</span>
                </div>
              )}
              {year && (
                <div className="stat-box">
                  <span className="stat-label">YEAR</span>
                  <span className="stat-value">{year}</span>
                </div>
              )}
              {movie.rank && (
                <div className="stat-box">
                  <span className="stat-label">IMDB RANK</span>
                  <span className="stat-value">#{movie.rank}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="detail-actions">
              {movie.imdb_url && (
                <a
                  className="detail-btn detail-btn--primary"
                  href={movie.imdb_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ↗ View on IMDB
                </a>
              )}
              <button
                className={`detail-btn detail-btn--outline ${inWatchlist ? 'in-watchlist' : ''}`}
                onClick={handleWatchlist}
              >
                {inWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
              </button>
              <button
                className={`detail-btn detail-btn--icon ${inFavorites ? 'favored' : ''}`}
                onClick={handleFavorite}
                title={inFavorites ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                {inFavorites ? '♥' : '♡'}
              </button>
            </div>

            {/* Synopsis / Overview */}
            {movie.overview && (
              <div className="detail-section">
                <h2 className="detail-section-title">Synopsis</h2>
                <p className="detail-synopsis">{movie.overview}</p>
              </div>
            )}

            {/* Actors fallback */}
            {!movie.overview && movie.actors && (
              <div className="detail-section">
                <h2 className="detail-section-title">Stars</h2>
                <p className="detail-synopsis">{movie.actors}</p>
              </div>
            )}

            {/* Cast avatars */}
            {cast.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">Cast</h2>
                <div className="cast-row">
                  {cast.slice(0, 8).map((person, i) => (
                    <CastAvatar key={person.id} person={person} i={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
