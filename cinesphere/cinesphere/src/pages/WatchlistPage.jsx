import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatchlist } from '../contexts/WatchlistContext'
import { posterUrl } from '../api/imdb'
import './WatchlistPage.css'

function WatchlistCard({ movie, onRemove, listView }) {
  const navigate = useNavigate()
  const poster = posterUrl(movie)
  const rating = movie.vote_average != null ? Number(movie.vote_average).toFixed(1) : null
  const year   = movie.year || movie.release_date?.slice(0, 4)

  return (
    <div className="wl-card">
      <div className="wl-card__poster" onClick={() => navigate(`/movies/${movie.id}`, { state: { movie } })}>
        {poster
          ? <img src={poster} alt={movie.title} loading="lazy" />
          : <div className="wl-poster-placeholder" />
        }
        {rating && !listView && <span className="wl-rating">★ {rating}</span>}
      </div>
      <div className="wl-card__info">
        <p className="wl-title">{movie.title}</p>
        <p className="wl-year">{year}{rating && listView ? ` · ★ ${rating}` : ''}</p>
      </div>
      <button className="wl-remove" onClick={() => onRemove(movie.id)} title="Remove from watchlist">✕</button>
    </div>
  )
}

export default function WatchlistPage() {
  const { items, remove } = useWatchlist()
  const navigate = useNavigate()
  const [listView, setListView] = useState(false)

  return (
    <div className="watchlist-page">
      <div className="watchlist-inner">
        <div className="watchlist-header">
          <h1 className="watchlist-title">My Watchlist</h1>
          <p className="watchlist-count">{items.length} {items.length === 1 ? 'title' : 'titles'}</p>
          {items.length > 0 && (
            <div className="watchlist-controls">
              <div className="view-toggle">
                <button className={`view-btn${!listView ? ' active' : ''}`} onClick={() => setListView(false)} title="Grid view">⊞</button>
                <button className={`view-btn${listView ? ' active' : ''}`} onClick={() => setListView(true)} title="List view">☰</button>
              </div>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="wl-empty fade-in">
            <div className="wl-empty__icon">🎬</div>
            <h2>Your watchlist is empty</h2>
            <p>Start adding movies you want to watch</p>
            <button className="btn-amber" onClick={() => navigate('/discover')}>Browse Movies</button>
          </div>
        ) : (
          <div className={`wl-grid fade-in${listView ? ' list-view' : ''}`}>
            {items.map(movie => (
              <WatchlistCard key={movie.id} movie={movie} onRemove={remove} listView={listView} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
