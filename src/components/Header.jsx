import React from 'react';
import { Link } from 'react-router-dom';
import SideMenu from './SideMenu';

export default function Header({ theme, toggleTheme, user, onSignOut }) {
  return (
    <header>
      <SideMenu onSignOut={onSignOut} />
      
      <Link to="/" className="logo">
        <img 
          src={theme === 'light' ? '/mindmute-light.png' : '/mindmute-dark.png'} 
          alt="Mindmute Logo" 
        />
      </Link>

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