import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const TOP_CITIES = [
  { name: "All Cities", slug: "" },
  { name: "Bangalore", slug: "bangalore" },
  { name: "Gurgaon", slug: "gurgaon" },
  { name: "Hyderabad", slug: "hyderabad" },
  { name: "Pune", slug: "pune" },
  { name: "Mumbai", slug: "mumbai" },
  { name: "Delhi", slug: "delhi" },
  { name: "Chennai", slug: "chennai" },
  { name: "Noida", slug: "noida" },
  { name: "Kolkata", slug: "kolkata" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || "https://stanzo.in";

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const searchParams = new URLSearchParams(location.search);
  const currentParamCity = searchParams.get("city") || "";
  const isCityPage = location.pathname.startsWith("/city/");
  const currentPathCity = isCityPage ? location.pathname.split("/")[2] : "";
  const activeCitySlug = currentParamCity || currentPathCity;

  const handleCityClick = (slug: string) => {
    if (!slug) {
      navigate("/");
    } else {
      navigate(`/city/${slug}`);
    }
  };

  return (
    <header className="nav-wrapper">
      {/* Top Navbar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-inner">
            {/* Logo */}
            <Link to="/" className="brand-logo" onClick={() => setMenuOpen(false)}>
              <svg style={{ width: 38, height: 38, flexShrink: 0 }} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="stanzo-nav-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="50%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                  <linearGradient id="stanzo-nav-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                  <linearGradient id="stanzo-nav-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
                <path d="M22 6L32 11V34L22 29V6Z" fill="url(#stanzo-nav-grad-2)" opacity="0.9" />
                <path d="M8 14L18 9V32L8 37V14Z" fill="url(#stanzo-nav-grad-3)" opacity="0.85" />
                <path d="M18 9L32 16V22L18 15V9Z" fill="url(#stanzo-nav-grad-1)" />
                <path d="M8 24L22 31V37L8 30V24Z" fill="url(#stanzo-nav-grad-1)" />
                <path d="M18 17L22 19V31L18 29V17Z" fill="#312E81" opacity="0.4" />
              </svg>
              <div className="brand-logo-text">
                <span className="brand-logo-title">
                  STAN<span>Z</span>O
                </span>
                <span className="brand-logo-sub">
                  PG & LIVING
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="top-bar-nav">
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link-item"
              >
                <div className="nav-link-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={{ width: 16, height: 16 }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <span style={{ display: "block", lineHeight: 1.2 }}>List Your Property</span>
                  <span style={{ fontSize: 11, color: "var(--slate-400)", fontWeight: 500 }}>Zero Commission</span>
                </div>
              </a>

              <a href="tel:08045678900" className="nav-link-item">
                <div className="nav-link-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={{ width: 16, height: 16 }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <span style={{ display: "block", lineHeight: 1.2 }}>080-4567-8900</span>
                  <span style={{ fontSize: 11, color: "var(--slate-400)", fontWeight: 500 }}>24x7 Helpline</span>
                </div>
              </a>
            </div>

            {/* Actions */}
            <div className="top-bar-actions">
              <a
                href={`${dashboardUrl}/login`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-owner-login"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Owner Portal
              </a>

              <a
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-list-property-nav"
              >
                <span>+ List PG</span>
              </a>

              {/* Mobile Hamburger Toggle */}
              <button
                className="nav-toggle-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle Navigation"
              >
                {menuOpen ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 22, height: 22 }}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 22, height: 22 }}>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-nav-drawer ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>
          <span>Explore All PGs</span>
          <span>→</span>
        </Link>
        <a
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-nav-item"
          onClick={() => setMenuOpen(false)}
        >
          <span>List Your Property</span>
          <span>→</span>
        </a>
        <a
          href="tel:08045678900"
          className="mobile-nav-item"
          onClick={() => setMenuOpen(false)}
        >
          <span>24x7 Helpline: 080-4567-8900</span>
          <span>📞</span>
        </a>
        <a
          href={`${dashboardUrl}/login`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-card-visit"
          style={{ textAlign: "center", display: "block", textDecoration: "none", padding: "12px" }}
          onClick={() => setMenuOpen(false)}
        >
          Owner Portal Login
        </a>
      </div>

      {/* City Quick Navigation Strip */}
      <div className="city-strip-nav">
        <div className="container">
          <div className="city-strip-inner">
            {TOP_CITIES.map((c) => {
              const isActive = (!activeCitySlug && c.slug === "") || activeCitySlug.toLowerCase() === c.slug.toLowerCase();
              return (
                <button
                  key={c.name}
                  onClick={() => handleCityClick(c.slug)}
                  className={`city-strip-pill ${isActive ? "active" : ""}`}
                >
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
