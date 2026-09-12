import { Link } from "react-router-dom";

const FOOTER_CITIES = [
  "Bangalore", "Gurgaon", "Hyderabad", "Pune", "Mumbai",
  "Delhi", "Chennai", "Noida", "Kolkata", "Ahmedabad",
  "Chandigarh", "Jaipur", "Kochi", "Indore"
];

const Footer = () => {
  const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || "https://stanzo.in";

  return (
    <footer className="luxury-footer">
      <div className="container">
        {/* Popular Cities Directory */}
        <div className="footer-city-strip">
          <div className="footer-city-title">
            Popular PG & Co-Living Destinations Across India
          </div>
          <div className="footer-city-links">
            {FOOTER_CITIES.map((c) => (
              <Link
                key={c}
                to={`/city/${c.toLowerCase()}`}
                className="footer-city-link"
              >
                PG in {c}
              </Link>
            ))}
          </div>
        </div>

        {/* 4-Column Layout */}
        <div className="footer-columns-grid">
          {/* Brand Info */}
          <div className="footer-col-brand">
            <h3>
              STAN<span style={{ color: "#818CF8" }}>Z</span>O <span style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8" }}>PG & LIVING</span>
            </h3>
            <p>
              India's premier student & working professional living network.
              Standardized rooms, wholesome meals, high-speed Wi-Fi, and 100% zero brokerage guaranteed.
            </p>
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", padding: "6px 14px", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>
                <span>✦ 100% Verified Accommodations</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col-nav">
            <h4>Explore Accommodations</h4>
            <ul className="footer-nav-list">
              <li><Link to="/?gender=male">Boys PGs & Hostels</Link></li>
              <li><Link to="/?gender=female">Girls PGs & Hostels</Link></li>
              <li><Link to="/?gender=any">Co-Living Spaces</Link></li>
              <li><Link to="/?food=true">Stays with Meals Included</Link></li>
              <li><Link to="/?ac=true">AC Room PGs</Link></li>
            </ul>
          </div>

          {/* For Property Owners */}
          <div className="footer-col-nav">
            <h4>For Property Owners</h4>
            <ul className="footer-nav-list">
              <li>
                <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">
                  List Your Property Free
                </a>
              </li>
              <li>
                <a href={`${dashboardUrl}/login`} target="_blank" rel="noopener noreferrer">
                  Owner Portal Login
                </a>
              </li>
              <li>
                <a href={dashboardUrl} target="_blank" rel="noopener noreferrer">
                  Stanzo Property Partner
                </a>
              </li>
              <li>
                <a href="tel:08045678900">
                  Partner Helpdesk
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="footer-col-nav">
            <h4>Support & Help</h4>
            <ul className="footer-nav-list">
              <li><a href="tel:08045678900">24x7 Helpline: 080-4567-8900</a></li>
              <li><a href="mailto:support@stanzo.in">support@stanzo.in</a></li>
              <li><a href={`${dashboardUrl}/privacy`} target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><a href={`${dashboardUrl}/terms`} target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
              <li><a href={`${dashboardUrl}/guest-policy`} target="_blank" rel="noopener noreferrer">Guest Safety Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>
            &copy; {new Date().getFullYear()} Stanzo Living Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span>Zero Brokerage Promise</span>
            <span>·</span>
            <span>Security & Privacy</span>
            <span>·</span>
            <span>Verified Stays</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
