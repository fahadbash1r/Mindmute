import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mindmuteDark from '../assets/mindmute-dark.png';
import mindmuteLight from '../assets/mindmute-light.png';

export default function Header({ theme, toggleTheme, user, onSignOut }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuVisible(true);
    } else {
      const timer = setTimeout(() => setIsMenuVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen]);

  return (
    <>
      <header>
        <div className="header-left">
          <button 
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {isMenuVisible && (
            <>
              <div className={`dropdown-menu ${!isMenuOpen ? 'closed' : ''}`}>
                <button className="close-menu" onClick={() => setIsMenuOpen(false)}>×</button>
                <nav>
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>
                    <span className="menu-icon">🧠</span>
                    Today's Session
                  </Link>
                  <Link to="/thoughts" onClick={() => setIsMenuOpen(false)}>
                    <span className="menu-icon">📁</span>
                    My Thoughts
                  </Link>
                  <Link to="/tasks" onClick={() => setIsMenuOpen(false)}>
                    <span className="menu-icon">✓</span>
                    Task Tracker
                  </Link>
                  <Link to="/upgrade" onClick={() => setIsMenuOpen(false)}>
                    <span className="menu-icon">⭐</span>
                    Upgrade
                  </Link>
                  {user && (
                    <button onClick={() => { onSignOut(); setIsMenuOpen(false); }}>
                      <span className="menu-icon">📱</span>
                      Sign Out
                    </button>
                  )}
                </nav>
              </div>
              <div 
                className={`menu-overlay ${isMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              />
            </>
          )}
        </div>

        <div className="header-center">
          <Link to="/" className="logo">
            <img 
              src={theme === 'dark' ? mindmuteLight : mindmuteDark} 
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
    </>
  );
} 