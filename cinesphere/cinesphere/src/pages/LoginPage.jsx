import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

const MOCK_CARDS = [
  { title: 'Cosmic', rating: 8.4, color: '#e8a020', accent: '#b5400a', offsetX: 0 },
  { title: 'Neon City', rating: 7.9, color: '#d4267a', accent: '#7b1fa2', offsetX: 80 },
  { title: 'Deep Blue', rating: 8.1, color: '#0097a7', accent: '#01579b', offsetX: 0 },
]

function DemoCard({ title, rating, color, accent, offsetX, style }) {
  return (
    <div className="demo-card" style={{ background: `linear-gradient(145deg, ${color}, ${accent})`, marginLeft: offsetX, ...style }}>
      <div className="demo-card__inner" />
      <div className="demo-card__label">
        <span className="demo-card__title">{title}</span>
        <span className="demo-card__rating">★ {rating}</span>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/discover'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    try {
      login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left hero */}
      <div className="login-hero">
        <div className="login-hero__cards">
          {MOCK_CARDS.map((card, i) => (
            <DemoCard key={card.title} {...card} style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <div className="login-hero__gradient" />
      </div>

      {/* Right form */}
      <div className="login-form-wrap">
        <div className="login-form-card fade-in">
          <div className="login-brand">
            <div className="login-brand__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="var(--amber)" />
              </svg>
            </div>
            <span className="login-brand__name">CineSphere</span>
          </div>

          <h1 className="login-title">Welcome to the show</h1>
          <p className="login-sub">Sign in to track movies you love</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">EMAIL</label>
              <input
                className="form-input"
                type="email"
                placeholder="cinephile@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">PASSWORD</label>
                <button type="button" className="forgot-link">Forgot password?</button>
              </div>
              <input
                className="form-input form-input--password"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In to CineSphere'}
            </button>
          </form>

          <p className="login-register">
            New here? <button className="register-link" onClick={() => navigate('/discover')}>Create an account</button>
          </p>
          <p className="login-demo">Demo: cinema@demo.com / movie123</p>
        </div>
      </div>
    </div>
  )
}
