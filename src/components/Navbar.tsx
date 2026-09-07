import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="nav">
    <div className="container">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          Stanzo <span>PG Portal</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>🏠 Find your perfect PG</span>
          <a
            href={import.meta.env.VITE_DASHBOARD_URL || "https://stayyo.netlify.app"}
            className="btn btn-outline"
            style={{ padding: "8px 18px", fontSize: 13 }}
          >
            Owner Login
          </a>
        </div>
      </div>
    </div>
  </nav>
);

export default Navbar;
