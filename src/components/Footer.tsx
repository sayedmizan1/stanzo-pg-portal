const Footer = () => (
  <footer className="footer">
    <div className="container">
      <p style={{ marginBottom: 8 }}>
        <strong style={{ color: "#e2e8f0" }}>Stanzo PG Portal</strong> — India's trusted PG discovery platform
      </p>
      <p>
        <a href="https://stayyo.netlify.app">Owner Dashboard</a>
        &nbsp;·&nbsp;
        <a href="https://stayyo.netlify.app/privacy">Privacy Policy</a>
        &nbsp;·&nbsp;
        <a href="https://stayyo.netlify.app/terms">Terms of Use</a>
      </p>
      <p style={{ marginTop: 12, fontSize: 12, color: "#475569" }}>
        © {new Date().getFullYear()} Stanzo. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
