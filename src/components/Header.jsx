import React from 'react';
import darkLogo from '../assets/mindmute-dark.png';
import lightLogo from '../assets/mindmute-light.png';
import SideMenu from './SideMenu';

export default function Header({ theme, toggleTheme, user, onSignOut }) {
  return (
    <header>
      <SideMenu onSignOut={onSignOut} />
      
      <div className="logo-container">
        {theme === 'light' ? (
          <img 
            src={darkLogo}
            alt="Mindmute"
            className="logo"
            width="600"
            height="160"
            loading="eager"
          />
        ) : (
          <img 
            src={lightLogo}
            alt="Mindmute"
            className="logo"
            width="600"
            height="160"
            loading="eager"
          />
        )}
        <p className="tagline">Finding balance in the journey</p>
      </div>

      <button 
        className="mode-switcher" 
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>
    </header>
  );
} 