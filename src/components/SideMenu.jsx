import { useState, useEffect } from 'react';
import './SideMenu.css';

export default function SideMenu({ onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.side-menu') && !event.target.closest('.hamburger-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <button 
          className="close-button"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          ×
        </button>

        <nav className="menu-items">
          <a href="/" className="menu-item">
            <span className="menu-icon">🧠</span>
            Today's Session
          </a>
          <a href="/thoughts" className="menu-item">
            <span className="menu-icon">📁</span>
            My Thoughts
          </a>
          <a href="/upgrade" className="menu-item">
            <span className="menu-icon">⭐</span>
            Upgrade
          </a>
          <button onClick={onSignOut} className="menu-item sign-out">
            <span className="menu-icon">🚪</span>
            Sign Out
          </button>
        </nav>
      </div>

      <button 
        className="hamburger-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <span className="hamburger-icon">☰</span>
      </button>
    </>
  );
} 