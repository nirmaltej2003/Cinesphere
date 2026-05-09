import React from 'react'
import { useNavigate } from 'react-router-dom'
import { posterUrl } from '../api/imdb'
import './MovieCard.css'

const GENRE_COLORS = [
  '#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c',
  '#3498db','#9b59b6','#e91e8c','#00bcd4','#ff5722',
]

function PlaceholderPoster({ title, index = 0 }) {
  const color = GENRE_COLORS[index % GENRE_COLORS.length]
  const initials = title?.split(' ').slice(0, 2).map(w => w[0]).join('') || '??'
  return (
    <div className="poster-placeholder" style={{ background: `linear-gradient(135deg, ${color}33, ${color}66)` }}>
      <span className="poster-initials" style={{ color }}>{initials}</span>
    </div>
  )
}

export default function MovieCard({ movie, style }) {
  const navigate = useNavigate()
  const poster  = posterUrl(movie)
  const rating  = movie.vote_average != null ? Number(movie.vote_average).toFixed(1) : null
  const year    = movie.year || movie.release_date?.slice(0, 4)

  return (
    <div
      className="movie-card"
      style={style}
      onClick={() => navigate(`/movies/${movie.id}`, { state: { movie } })}
    >
      <div className="movie-card__poster">
        {poster
          ? <img src={poster} alt={movie.title} loading="lazy" />
          : <PlaceholderPoster title={movie.title} index={Math.abs(movie.id?.charCodeAt?.(2) || 0)} />
        }
        {rating && (
          <span className="movie-card__rating">
            <span className="star">★</span> {rating}
          </span>
        )}
      </div>
      <div className="movie-card__info">
        <p className="movie-card__title">{movie.title}</p>
        <p className="movie-card__year">{year}</p>
      </div>
    </div>
  )
}
