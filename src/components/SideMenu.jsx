import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
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
          <Link to="/" className="menu-item" onClick={() => setIsOpen(false)}>
            <span className="menu-icon">🧠</span>
            Today's Session
          </Link>
          <Link to="/thoughts" className="menu-item" onClick={() => setIsOpen(false)}>
            <span className="menu-icon">📁</span>
            My Thoughts
          </Link>
          <Link to="/tasks" className="menu-item" onClick={() => setIsOpen(false)}>
            <span className="menu-icon">✓</span>
            Task Tracker
          </Link>
          <Link to="/upgrade" className="menu-item" onClick={() => setIsOpen(false)}>
            <span className="menu-icon">⭐</span>
            Upgrade
          </Link>
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