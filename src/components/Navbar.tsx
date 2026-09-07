import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || "https://stanzo.in";

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-inner">
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            Stanzo <span>PG</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            <Link to="/" className="nav-link">
              Find Stays
            </Link>
            <a
              href={dashboardUrl}
              className="nav-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              List Your Property
            </a>
          </div>

          <div className="nav-actions">
            <a
              href={`${dashboardUrl}/login`}
              className="nav-cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              Owner Login
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              className="nav-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 22, height: 22 }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 22, height: 22 }}
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          <div className="nav-mobile-inner">
            <Link to="/" className="nav-mobile-link" onClick={closeMenu}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
                <path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
                <path d="M9 22V12h6v10" />
              </svg>
              Find Stays / PG
            </Link>
            <a
              href={dashboardUrl}
              className="nav-mobile-link"
              onClick={closeMenu}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              List Your Property
            </a>
            <div className="nav-mobile-divider" />
            <a
              href={`${dashboardUrl}/login`}
              className="nav-mobile-cta"
              onClick={closeMenu}
              target="_blank"
              rel="noopener noreferrer"
            >
              Owner Login
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
