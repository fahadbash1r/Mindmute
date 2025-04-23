import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import mindmuteDark from '../assets/mindmute-dark.png';
import mindmuteLight from '../assets/mindmute-light.png';

export default function Header({ theme, toggleTheme, user, onSignOut }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header>
      <button 
        className="menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {isMenuOpen && (
        <div className="dropdown-menu">
          <nav>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/thoughts" onClick={() => setIsMenuOpen(false)}>My Thoughts</Link>
            <Link to="/settings" onClick={() => setIsMenuOpen(false)}>Settings</Link>
            {user && (
              <button onClick={() => { onSignOut(); setIsMenuOpen(false); }}>
                Sign Out
              </button>
            )}
          </nav>
        </div>
      )}

      <div className="header-center">
        <Link to="/" className="logo">
          <img 
            src={theme === 'light' ? mindmuteLight : mindmuteDark} 
            alt="Mindmute Logo" 
          />
          <span className="tagline">Finding balance in the journey</span>
        </Link>
      </div>

      <div className="header-right">
        <button 
          onClick={toggleTheme} 
          className="mode-switcher"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {user && (
          <button onClick={onSignOut} className="sign-out-btn">
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
} 