import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase() || 'U'

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand" onClick={() => { navigate('/discover'); closeMenu() }}>
          <div className="header__logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polygon points="5,3 19,12 5,21" fill="var(--amber)" />
            </svg>
          </div>
          <span className="header__name">CineSphere</span>
        </div>

        {/* Desktop nav */}
        <nav className="header__nav">
          <NavLink to="/discover" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Discover
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/watchlist" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                Watchlist
              </NavLink>
              <NavLink to="/favorites" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
                Favorites
              </NavLink>
            </>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="header__actions">
          {isAuthenticated ? (
            <div className="header__user-area">
              <div className="header__avatar" title={user?.name}>{initials}</div>
              <button className="btn-ghost" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="btn-amber" onClick={() => navigate('/login')}>Sign In</button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`header__hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`header__mobile-menu${menuOpen ? ' open' : ''}`}>
        <NavLink to="/discover" className={({isActive}) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
          🎬 Discover
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/watchlist" className={({isActive}) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
              📋 Watchlist
            </NavLink>
            <NavLink to="/favorites" className={({isActive}) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
              ❤️ Favorites
            </NavLink>
          </>
        )}
        <div className="mobile-divider" />
        {isAuthenticated ? (
          <div className="mobile-user-row">
            <div className="header__avatar">{initials}</div>
            <span className="mobile-user-name">{user?.name || user?.email}</span>
            <button className="btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button className="btn-amber" style={{ margin: '4px 14px' }} onClick={() => { navigate('/login'); closeMenu() }}>
            Sign In
          </button>
        )}
      </div>
    </header>
  )
}
