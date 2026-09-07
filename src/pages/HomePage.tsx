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

const GENDER_LABELS: Record<string, string> = { any: "Co-living", male: "Boys PG", female: "Girls PG" };
const GENDER_TAGS: Record<string, string> = { any: "tag-blue", male: "tag-blue", female: "tag-purple" };

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z"/><path d="M9 22V12h6v10"/>
  </svg>
);

const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

const IconWifi = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>
  </svg>
);

const IconFood = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const IconAC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="22" height="11" rx="2"/><path d="M5 14v7"/><path d="M12 14v7"/><path d="M19 14v7"/><path d="M3 18h4"/><path d="M10 18h4"/><path d="M17 18h4"/>
  </svg>
);

const IconBed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/><path d="M2 8h18a2 2 0 012 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>
  </svg>
);

const PGCard = ({ pg }: { pg: Listing }) => {
  const cityLabel = pg.city.charAt(0).toUpperCase() + pg.city.slice(1);
  return (
    <Link to={`/pg/${pg.slug}`} className="pg-card">
      {pg.photos && pg.photos.length > 0 ? (
        <img src={pg.photos[0]} alt={pg.title} className="pg-card-img" loading="lazy" />
      ) : (
        <div className="pg-card-img-placeholder">
          <IconHome />
        </div>
      )}
      <div className="pg-card-body">
        <div className="pg-card-top">
          <h3 className="pg-card-title">{pg.title}</h3>
        </div>
        <div className="pg-card-loc">
          <IconPin />
          {pg.locality ? `${pg.locality}, ` : ""}{cityLabel}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
          <span className="pg-card-price">₹{pg.rentFrom.toLocaleString()}</span>
          {pg.rentTo > pg.rentFrom && (
            <span style={{ fontSize: 14, color: "var(--muted)" }}>– ₹{pg.rentTo.toLocaleString()}</span>
          )}
          <span className="pg-card-price-unit">/month</span>
        </div>
        <div className="pg-card-tags">
          <span className={`tag ${GENDER_TAGS[pg.genderPreference]}`}>{GENDER_LABELS[pg.genderPreference]}</span>
          {pg.availableBeds > 0 ? (
            <span className="tag tag-green">
              <span className="avail-dot green" style={{ marginRight: 4 }} />
              {pg.availableBeds} beds available
            </span>
          ) : (
            <span className="tag tag-red">Fully occupied</span>
          )}
          {pg.foodIncluded && <span className="tag tag-amber">Meals included</span>}
          {pg.acAvailable && <span className="tag tag-gray">AC</span>}
          {pg.wifiAvailable && <span className="tag tag-gray">WiFi</span>}
        </div>
      </div>
    </Link>
  );
};

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
  const [wifi, setWifi] = useState(searchParams.get("wifi") === "true");
  const [rentMin, setRentMin] = useState(searchParams.get("rentMin") || "");
  const [rentMax, setRentMax] = useState(searchParams.get("rentMax") || "");

  useEffect(() => {
    api.get("/listings/cities").then(r => setCities(r.data || [])).catch(() => {});
  }, []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (city) params.city = city;
      if (gender) params.gender = gender;
      if (food) params.food = "true";
      if (ac) params.ac = "true";
      if (wifi) params.wifi = "true";
      if (rentMin) params.rentMin = rentMin;
      if (rentMax) params.rentMax = rentMax;
      const res = await api.get("/listings", { params });
      setListings(res.data.listings || []);
      setTotal(res.data.total || 0);
      const p: Record<string, string> = {};
      if (city) p.city = city;
      if (gender) p.gender = gender;
      if (food) p.food = "true";
      if (ac) p.ac = "true";
      if (wifi) p.wifi = "true";
      if (rentMin) p.rentMin = rentMin;
      if (rentMax) p.rentMax = rentMax;
      setSearchParams(p, { replace: true });
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [city, gender, food, ac, wifi, rentMin, rentMax]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const clearAll = () => {
    setCity(""); setGender(""); setFood(false); setAc(false);
    setWifi(false); setRentMin(""); setRentMax("");
  };

  const hasFilters = !!(city || gender || food || ac || wifi || rentMin || rentMax);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">India's PG Discovery Platform</div>
          <h1>Find the right PG,<br /><span>anywhere in India</span></h1>
          <p className="hero-sub">
            Browse verified PG accommodations from trusted owners. No brokerage, no hidden charges.
          </p>

          {/* Search */}
          <div className="search-wrap">
            <select value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {cities.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <div className="search-divider" />
            <select value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">Any Gender</option>
              <option value="male">Boys PG</option>
              <option value="female">Girls PG</option>
            </select>
            <div className="search-divider" />
            <input
              type="number" placeholder="Min rent (₹)"
              value={rentMin} onChange={e => setRentMin(e.target.value)}
              style={{ maxWidth: 130 }}
            />
            <input
              type="number" placeholder="Max rent (₹)"
              value={rentMax} onChange={e => setRentMax(e.target.value)}
              style={{ maxWidth: 130 }}
            />
            <button className="search-btn" onClick={fetchListings}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconSearch /> Search
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div>
              <div className="hero-stat-val">{total > 0 ? total : "—"}</div>
              <div className="hero-stat-lbl">Active listings</div>
            </div>
            <div>
              <div className="hero-stat-val">{cities.length > 0 ? cities.length : "—"}</div>
              <div className="hero-stat-lbl">Cities covered</div>
            </div>
            <div>
              <div className="hero-stat-val">Free</div>
              <div className="hero-stat-lbl">No brokerage fee</div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="section">
        <div className="container">

          {/* Filter bar */}
          <div className="filter-bar">
            <span className="filter-label">Filter by</span>
            <button
              className={`filter-chip ${food ? "active" : ""}`}
              onClick={() => setFood(f => !f)}
            >
              <IconFood /> Meals included
            </button>
            <button
              className={`filter-chip ${ac ? "active" : ""}`}
              onClick={() => setAc(a => !a)}
            >
              <IconAC /> AC room
            </button>
            <button
              className={`filter-chip ${wifi ? "active" : ""}`}
              onClick={() => setWifi(w => !w)}
            >
              <IconWifi /> WiFi
            </button>
            <button
              className={`filter-chip ${gender === "male" ? "active" : ""}`}
              onClick={() => setGender(g => g === "male" ? "" : "male")}
            >
              Boys PG
            </button>
            <button
              className={`filter-chip ${gender === "female" ? "active" : ""}`}
              onClick={() => setGender(g => g === "female" ? "" : "female")}
            >
              Girls PG
            </button>
            {hasFilters && (
              <button className="filter-clear" onClick={clearAll}>Clear all</button>
            )}
          </div>

          {/* Results header */}
          <div className="section-header">
            <h2 className="section-title">
              {loading
                ? "Searching..."
                : `${total} PG${total !== 1 ? "s" : ""} found${city ? ` in ${city.charAt(0).toUpperCase() + city.slice(1)}` : ""}`}
            </h2>
            {cities.length > 0 && !city && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {cities.slice(0, 5).map(c => (
                  <Link key={c} to={`/city/${c}`} className="section-link" style={{ fontSize: 13 }}>
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
                <div key={i} className="skeleton" style={{ height: 310 }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <IconBed />
              </div>
              <div className="empty-title">No PGs found</div>
              <div className="empty-text">Try adjusting your filters or selecting a different city.</div>
              {hasFilters && (
                <button onClick={clearAll} className="empty-cta">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="pg-grid">
              {listings.map(pg => <PGCard key={pg._id} pg={pg} />)}
            </div>
          )}
        </div>
      </section>

      {/* CITY BROWSE */}
      {cities.length > 0 && (
        <div className="city-strip">
          <div className="container">
            <h2 className="section-title">Browse by city</h2>
            <div className="city-grid">
              {cities.map(c => (
                <Link key={c} to={`/city/${c}`} className="city-btn">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
