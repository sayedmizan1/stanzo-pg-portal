import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  any: "Co-Living",
  male: "Boys PG",
  female: "Girls PG",
};

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
];

const LOCALITY_PRESETS: Record<string, string[]> = {
  bangalore: ["Koramangala", "HSR Layout", "Indiranagar", "Marathahalli", "Whitefield", "BTM Layout"],
  chennai: ["OMR", "Velachery", "Adyar", "Guindy", "T Nagar"],
  delhi: ["North Campus", "South Extension", "Laxmi Nagar", "Saket", "Hauz Khas"],
  gurgaon: ["DLF Phase 3", "Cyber City", "Sector 14", "Sector 48", "Sohna Road"],
  hyderabad: ["Madhapur", "Gachibowli", "Hitec City", "Kondapur", "Kukatpally"],
  mumbai: ["Andheri", "Bandra", "Powai", "Goregaon", "Malad"],
  pune: ["Hinjewadi", "Viman Nagar", "Kothrud", "Wakad", "Baner"],
};

const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedLocality, setSelectedLocality] = useState("");
  const [gender, setGender] = useState("");
  const [food, setFood] = useState(false);
  const [ac, setAc] = useState(false);
  const [wifi, setWifi] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFiltersCount = [
    Boolean(gender),
    food,
    ac,
    wifi,
    Boolean(selectedLocality),
  ].filter(Boolean).length;

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { city: city || "" };
    if (gender) params.gender = gender;
    if (food) params.food = "true";
    if (ac) params.ac = "true";
    if (wifi) params.wifi = "true";

    api.get("/listings", { params })
      .then((r) => {
        let results: Listing[] = r.data?.listings || [];
        if (selectedLocality) {
          results = results.filter((item) =>
            item.locality?.toLowerCase().includes(selectedLocality.toLowerCase()) ||
            item.title?.toLowerCase().includes(selectedLocality.toLowerCase())
          );
        }
        if (sortBy === "price_asc") {
          results.sort((a, b) => a.rentFrom - b.rentFrom);
        } else if (sortBy === "price_desc") {
          results.sort((a, b) => b.rentFrom - a.rentFrom);
        }
        setListings(results);
        setTotal(results.length);
      })
      .catch((err) => {
        console.error("City fetch error:", err);
        setListings([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [city, gender, food, ac, wifi, selectedLocality, sortBy]);

  const clearAllFilters = () => {
    setSelectedLocality("");
    setGender("");
    setFood(false);
    setAc(false);
    setWifi(false);
  };

  const cityLabel = city ? city.charAt(0).toUpperCase() + city.slice(1) : "";
  const localities = city && LOCALITY_PRESETS[city.toLowerCase()] ? LOCALITY_PRESETS[city.toLowerCase()] : [];

  return (
    <div className="results-page-section" style={{ minHeight: "80vh" }}>
      <div className="container">
        {/* City Breadcrumbs & Header */}
        <div style={{ marginBottom: 24 }}>
          <div className="detail-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span style={{ color: "var(--brand-600)", fontWeight: 700 }}>{cityLabel}</span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 900, color: "var(--slate-900)", letterSpacing: "-0.5px" }}>
                PGs & Hostels in {cityLabel}
              </h1>
              <p style={{ color: "var(--slate-600)", fontSize: 14, fontWeight: 500, marginTop: 4 }}>
                {loading ? "Searching verified stays..." : `${total} Stanzo Assured verified accommodations with meals & zero brokerage`}
              </p>
            </div>
            <Link to="/" className="btn-card-outline" style={{ fontSize: 13 }}>
              ← View All Cities
            </Link>
          </div>
        </div>

        {/* 2-Column Results Layout */}
        <div className="results-layout">
          {/* Backdrop for mobile drawer */}
          {mobileFiltersOpen && (
            <div
              className="filter-drawer-backdrop"
              onClick={() => setMobileFiltersOpen(false)}
            />
          )}

          {/* Filters Sidebar */}
          <aside className={`filter-sidebar ${mobileFiltersOpen ? "drawer-open" : ""}`}>
            <div className="filter-sidebar-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 className="filter-sidebar-title">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="filter-count-badge">{activeFiltersCount}</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {activeFiltersCount > 0 && (
                  <button className="filter-sidebar-reset" onClick={clearAllFilters}>
                    Clear All
                  </button>
                )}
                <button
                  className="filter-drawer-close-btn"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Localities */}
            {localities.length > 0 && (
              <div className="filter-group">
                <span className="filter-group-label">Popular Localities</span>
                <div className="locality-chips-wrap">
                  {localities.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocality(selectedLocality === loc ? "" : loc)}
                      className={`locality-chip ${selectedLocality === loc ? "active" : ""}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gender */}
            <div className="filter-group">
              <span className="filter-group-label">Stay Category</span>
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={gender === "male"}
                  onChange={() => setGender(gender === "male" ? "" : "male")}
                />
                <span>Boys PG</span>
              </label>
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={gender === "female"}
                  onChange={() => setGender(gender === "female" ? "" : "female")}
                />
                <span>Girls PG</span>
              </label>
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={gender === "any"}
                  onChange={() => setGender(gender === "any" ? "" : "any")}
                />
                <span>Co-Living</span>
              </label>
            </div>

            {/* Amenities */}
            <div className="filter-group">
              <span className="filter-group-label">Key Amenities</span>
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={food}
                  onChange={() => setFood(!food)}
                />
                <span>Food / Meals Included</span>
              </label>
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={ac}
                  onChange={() => setAc(!ac)}
                />
                <span>Air Conditioning (AC)</span>
              </label>
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={wifi}
                  onChange={() => setWifi(!wifi)}
                />
                <span>High-Speed Wi-Fi</span>
              </label>
            </div>
          </aside>

          {/* Results List */}
          <main>
            <div className="results-header-bar">
              <div className="results-header-left">
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--slate-900)" }}>
                  {loading ? "Finding stays..." : `${listings.length} Stay${listings.length !== 1 ? "s" : ""} in ${cityLabel}`}
                </span>
              </div>

              <div className="results-header-actions">
                <button
                  className="mobile-filter-trigger-btn"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="filter-count-badge">{activeFiltersCount}</span>
                  )}
                </button>

                <div className="results-sort-wrap">
                  <span className="results-sort-label">Sort:</span>
                  <select
                    className="results-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="popular">Popularity</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="listings-stack">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="empty-results-box">
                <svg className="empty-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
                  <path d="M9 22V12h6v10" />
                </svg>
                <h3 className="empty-results-title">No PGs listed in {cityLabel} matching criteria</h3>
                <p className="empty-results-sub">
                  Try clearing your filters or explore verified accommodations across other cities.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearAllFilters} className="btn-card-outline">
                      Clear Filters
                    </button>
                  )}
                  <Link to="/" className="btn-card-primary">
                    Browse All Cities
                  </Link>
                </div>
              </div>
            ) : (
              <div className="listings-stack">
                {listings.map((pg) => {
                  const photosList = pg.photos && pg.photos.length > 0 ? pg.photos : FALLBACK_PHOTOS;
                  const originalPrice = Math.round((pg.rentFrom * 1.33) / 100) * 100;
                  const discountPercent = Math.round(((originalPrice - pg.rentFrom) / originalPrice) * 100);

                  return (
                    <div key={pg._id} className="oyo-card">
                      <div className="oyo-card-media">
                        <img
                          src={photosList[0]}
                          alt={pg.title}
                          className="oyo-card-main-img"
                        />
                        <div className="card-badge-assured">
                          <span className="card-badge-assured-dot" />
                          STANZO ASSURED
                        </div>
                        <div className="oyo-card-thumb-strip">
                          {photosList.slice(0, 4).map((t, idx) => (
                            <img key={idx} src={t} alt="" className="oyo-card-thumb" />
                          ))}
                        </div>
                      </div>

                      <div className="oyo-card-info">
                        <div>
                          <div className="oyo-card-top-row">
                            <Link to={`/pg/${pg.slug}`}>
                              <h3 className="oyo-card-title">{pg.title}</h3>
                            </Link>
                            <div className="urgency-badge">🔥 Popular</div>
                          </div>

                          <div className="oyo-card-location">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14, color: "var(--brand-600)", flexShrink: 0 }}>
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                              <circle cx="12" cy="9" r="2.5" />
                            </svg>
                            <span>{pg.locality ? `${pg.locality}, ` : ""}{cityLabel}</span>
                          </div>

                          <div className="oyo-card-rating-row">
                            <span className="rating-pill-green">4.6 ★</span>
                            <span className="rating-pill-meta">
                              (62 Reviews) · <span className="rating-descriptor">Excellent</span>
                            </span>
                            <span style={{ color: "var(--border)" }}>•</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-600)" }}>
                              {GENDER_LABELS[pg.genderPreference]}
                            </span>
                          </div>

                          <div className="oyo-card-amenities">
                            {pg.wifiAvailable && <span className="amenity-pill-inline">📶 Free WiFi</span>}
                            {pg.acAvailable && <span className="amenity-pill-inline">❄️ AC Room</span>}
                            {pg.foodIncluded && <span className="amenity-pill-inline">🍱 Meals Included</span>}
                            <span className="amenity-pill-inline">⚡ Power Backup</span>
                            <span className="amenity-pill-inline">🧹 Daily Cleaning</span>
                          </div>

                          <div className="wizard-member-tag">
                            WIZARD MEMBER · EXTRA 10% OFF
                          </div>
                        </div>

                        <div className="oyo-card-bottom">
                          <div className="oyo-pricing-block">
                            <div className="price-main-line">
                              <span className="price-current">₹{pg.rentFrom.toLocaleString()}</span>
                              <span className="price-original">₹{originalPrice.toLocaleString()}</span>
                              <span className="price-discount-tag">{discountPercent}% off</span>
                            </div>
                            <div className="price-subtext">per month · Zero Brokerage</div>
                          </div>

                          <div className="oyo-card-actions">
                            <Link to={`/pg/${pg.slug}`} className="btn-card-outline">
                              View Details
                            </Link>
                            <button onClick={() => navigate(`/pg/${pg.slug}`)} className="btn-card-primary">
                              Book Visit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CityPage;
