import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="nav">
    <div className="container">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          Stanzo <span>PG</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Find PG</Link>
          <a
            href={import.meta.env.VITE_DASHBOARD_URL || "https://stanzo.in"}
            className="nav-link"
          >
            List Your PG
          </a>
        </div>
        <a
          href={import.meta.env.VITE_DASHBOARD_URL || "https://stanzo.in/login"}
          className="nav-cta"
        >
          Owner Login
        </a>
      </div>
    </div>
  </nav>
);

export default Navbar;
