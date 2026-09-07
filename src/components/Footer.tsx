const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">Stanzo <span>PG</span></div>
          <div className="footer-tagline">India's trusted PG discovery platform</div>
        </div>
        <div className="footer-links">
          <a href={`${import.meta.env.VITE_DASHBOARD_URL || "https://stayyo.netlify.app"}/login`}>
            List Your PG
          </a>
          <a href={`${import.meta.env.VITE_DASHBOARD_URL || "https://stayyo.netlify.app"}/privacy`}>
            Privacy Policy
          </a>
          <a href={`${import.meta.env.VITE_DASHBOARD_URL || "https://stayyo.netlify.app"}/terms`}>
            Terms of Use
          </a>
        </div>
      </div>
      <div className="footer-copy">
        &copy; {new Date().getFullYear()} Stanzo Technologies Pvt. Ltd. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
