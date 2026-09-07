import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";

interface Listing {
  _id: string;
  title: string;
  slug: string;
  city: string;
  locality: string;
  rentFrom: number;
  rentTo: number;
  genderPreference: "any" | "male" | "female";
  foodIncluded: boolean;
  acAvailable: boolean;
  wifiAvailable: boolean;
  availableBeds: number;
  photos: string[];
  amenities: string[];
}

const GENDER_LABELS: Record<string, string> = {
  any: "Any",
  male: "👨 Boys",
  female: "👩 Girls"
};

const GENDER_BADGE: Record<string, string> = {
  any: "badge-blue",
  male: "badge-blue",
  female: "badge-pink"
};

const PGCard = ({ pg }: { pg: Listing }) => (
  <Link to={`/pg/${pg.slug}`} className="pg-card">
    {pg.photos && pg.photos.length > 0 ? (
      <img src={pg.photos[0]} alt={pg.title} className="pg-card-img" loading="lazy" />
    ) : (
      <div className="pg-card-img-placeholder">🏠</div>
    )}
    <div className="pg-card-body">
      <p className="pg-card-title">{pg.title}</p>
      <p className="pg-card-loc">
        📍 {pg.locality ? `${pg.locality}, ` : ""}{pg.city.charAt(0).toUpperCase() + pg.city.slice(1)}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        <div>
          <span className="pg-card-rent">₹{pg.rentFrom.toLocaleString()}</span>
          {pg.rentTo > pg.rentFrom && <span className="pg-card-rent" style={{ fontSize: 13 }}> – ₹{pg.rentTo.toLocaleString()}</span>}
          <span className="pg-card-rent"><span>/mo</span></span>
        </div>
        <span className={`badge ${GENDER_BADGE[pg.genderPreference]}`}>{GENDER_LABELS[pg.genderPreference]}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {pg.availableBeds > 0
          ? <span className="badge badge-green">✓ {pg.availableBeds} beds available</span>
          : <span className="badge badge-red">✗ Full</span>}
        {pg.foodIncluded && <span className="badge badge-amber">🍽️ Food</span>}
        {pg.acAvailable && <span className="badge badge-blue">❄️ AC</span>}
        {pg.wifiAvailable && <span className="badge badge-purple">📶 WiFi</span>}
      </div>
    </div>
  </Link>
);

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [food, setFood] = useState(searchParams.get("food") === "true");
  const [ac, setAc] = useState(searchParams.get("ac") === "true");
  const [rentMin, setRentMin] = useState(searchParams.get("rentMin") || "");
  const [rentMax, setRentMax] = useState(searchParams.get("rentMax") || "");

  const fetchCities = async () => {
    try {
      const res = await api.get("/listings/cities");
      setCities(res.data || []);
    } catch { /* silent */ }
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (city) params.city = city;
      if (gender) params.gender = gender;
      if (food) params.food = "true";
      if (ac) params.ac = "true";
      if (rentMin) params.rentMin = rentMin;
      if (rentMax) params.rentMax = rentMax;

      const res = await api.get("/listings", { params });
      setListings(res.data.listings || []);
      setTotal(res.data.total || 0);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [city, gender, food, ac, rentMin, rentMax]);

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchListings();
    // Sync URL
    const p: Record<string, string> = {};
    if (city) p.city = city;
    if (gender) p.gender = gender;
    if (food) p.food = "true";
    if (ac) p.ac = "true";
    if (rentMin) p.rentMin = rentMin;
    if (rentMax) p.rentMax = rentMax;
    setSearchParams(p, { replace: true });
  }, [fetchListings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const clearFilters = () => {
    setCity(""); setGender(""); setFood(false); setAc(false);
    setRentMin(""); setRentMax("");
  };

  const hasFilters = !!(city || gender || food || ac || rentMin || rentMax);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="container">
          <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 16 }}>
            🏠 India's PG Discovery Portal
          </p>
          <h1 style={{ marginBottom: 16 }}>
            Find Your Perfect<br />
            <span style={{ color: "#a5b4fc" }}>PG Accommodation</span>
          </h1>
          <p style={{ marginBottom: 36 }}>
            Browse verified PG listings from trusted owners. Filter by city, rent, gender preference and more.
          </p>

          {/* Search box */}
          <form className="search-box" onSubmit={handleSearch}>
            <select value={city} onChange={e => setCity(e.target.value)} style={{ flex: "1.5" }}>
              <option value="">📍 All Cities</option>
              {cities.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>

            <select value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">👥 Any Gender</option>
              <option value="male">👨 Boys Only</option>
              <option value="female">👩 Girls Only</option>
            </select>

            <input
              type="number" placeholder="Min ₹" value={rentMin}
              onChange={e => setRentMin(e.target.value)}
              style={{ maxWidth: 100 }}
            />
            <input
              type="number" placeholder="Max ₹" value={rentMax}
              onChange={e => setRentMax(e.target.value)}
              style={{ maxWidth: 100 }}
            />

            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
              🔍 Search
            </button>
          </form>

          {/* Quick stats */}
          <div style={{ marginTop: 28, display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { icon: "🏠", label: `${total || "1000+"}`, sub: "PG Listings" },
              { icon: "🌆", label: `${cities.length || "50+"}`, sub: "Cities" },
              { icon: "✅", label: "100%", sub: "Verified Owners" }
            ].map(s => (
              <div key={s.sub} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 18, color: "#fff", lineHeight: 1 }}>{s.label}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LISTING RESULTS ─── */}
      <section style={{ padding: "48px 0" }}>
        <div className="container">

          {/* Filter chips */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>Filters:</span>
            <button
              className={`chip ${food ? "active" : ""}`}
              onClick={() => setFood(f => !f)}
            >
              🍽️ Food Included
            </button>
            <button
              className={`chip ${ac ? "active" : ""}`}
              onClick={() => setAc(a => !a)}
            >
              ❄️ AC
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{ fontSize: 12, color: "var(--red)", cursor: "pointer", background: "none", border: "none", padding: "4px 8px", fontWeight: 600 }}
              >
                ✕ Clear all
              </button>
            )}
          </div>

          {/* Results header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontSize: 20, color: "var(--text)" }}>
              {loading ? "Searching…" : `${total} PG${total !== 1 ? "s" : ""} Found`}
              {city && ` in ${city.charAt(0).toUpperCase() + city.slice(1)}`}
            </h2>
            {cities.length > 0 && !city && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {cities.slice(0, 6).map(c => (
                  <Link
                    key={c}
                    to={`/city/${c}`}
                    style={{ fontSize: 12, color: "var(--brand)", textDecoration: "none", padding: "4px 10px", borderRadius: 999, border: "1px solid var(--brand-light)", background: "var(--brand-light)" }}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="pg-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 320 }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <p style={{ fontSize: 60, marginBottom: 16 }}>🏚️</p>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>No PGs found</h3>
              <p style={{ color: "var(--muted)" }}>Try adjusting your filters or search in a different city.</p>
              {hasFilters && (
                <button onClick={clearFilters} className="btn btn-outline" style={{ marginTop: 20 }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="pg-grid">
              {listings.map(pg => <PGCard key={pg._id} pg={pg} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─── CITY EXPLORE ─── */}
      {cities.length > 0 && (
        <section style={{ padding: "40px 0 60px", background: "#fff", borderTop: "1px solid var(--border)" }}>
          <div className="container">
            <h2 style={{ fontSize: 22, marginBottom: 20 }}>🌆 Browse by City</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {cities.map(c => (
                <Link
                  key={c}
                  to={`/city/${c}`}
                  className="btn btn-white"
                  style={{ fontSize: 13 }}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomePage;
