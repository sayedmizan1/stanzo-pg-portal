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

/* ─── STAY CARD COMPONENT ─── */
const StayCard = ({ pg }: { pg: Listing }) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const navigate = useNavigate();

  const photosList = pg.photos && pg.photos.length > 0 ? pg.photos : FALLBACK_PHOTOS;
  const currentPhoto = photosList[activePhotoIdx] || photosList[0];
  const cityLabel = pg.city.charAt(0).toUpperCase() + pg.city.slice(1);

  return (
    <div className="stay-card-luxury">
      <div className="stay-card-media">
        <Link to={`/pg/${pg.slug}`}>
          <img
            src={currentPhoto}
            alt={pg.title}
            className="stay-card-img"
            loading="lazy"
          />
        </Link>

        <div className="stay-card-badges-top">
          <div className="badge-verified-pill">
            <span className="badge-verified-dot" />
            <span>Stanzo Verified</span>
          </div>

          <div className={`badge-gender-pill ${pg.genderPreference}`}>
            {GENDER_LABELS[pg.genderPreference] || "Co-Living"}
          </div>
        </div>

        {photosList.length > 1 && (
          <div className="stay-card-dots">
            {photosList.slice(0, 4).map((_, idx) => (
              <span
                key={idx}
                className={`stay-card-dot ${idx === activePhotoIdx ? "active" : ""}`}
                onMouseEnter={() => setActivePhotoIdx(idx)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="stay-card-body">
        <div className="stay-card-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14, color: "var(--brand-600)", flexShrink: 0 }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span>{pg.locality ? `${pg.locality}, ` : ""}{cityLabel}</span>
        </div>

        <Link to={`/pg/${pg.slug}`}>
          <h3 className="stay-card-title">{pg.title}</h3>
        </Link>

        <div className="stay-card-amenity-strip">
          {pg.wifiAvailable && (
            <span className="amenity-chip-micro">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 12, height: 12 }}>
                <path d="M5 12.55a11 11 0 0114.08 0" /><path d="M1.42 9a16 16 0 0121.16 0" /><circle cx="12" cy="20" r="1" fill="currentColor" />
              </svg>
              WiFi
            </span>
          )}
          {pg.foodIncluded && (
            <span className="amenity-chip-micro">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 12, height: 12 }}>
                <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
              </svg>
              Meals Included
            </span>
          )}
          {pg.acAvailable && (
            <span className="amenity-chip-micro">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 12, height: 12 }}>
                <rect x="1" y="3" width="22" height="11" rx="2" /><path d="M5 14v7M12 14v7M19 14v7" />
              </svg>
              AC
            </span>
          )}
          {pg.availableBeds > 0 ? (
            <span className="amenity-chip-micro" style={{ color: "var(--emerald-700)", background: "var(--emerald-50)", borderColor: "var(--emerald-100)" }}>
              ✓ {pg.availableBeds} beds left
            </span>
          ) : (
            <span className="amenity-chip-micro" style={{ color: "var(--brand-700)", background: "var(--brand-50)" }}>
              Filling fast
            </span>
          )}
        </div>

        <div className="stay-card-footer">
          <div className="stay-card-price-wrap">
            <div className="stay-card-rent">₹{pg.rentFrom.toLocaleString()}</div>
            <div className="stay-card-rent-sub">per month · Zero Brokerage</div>
          </div>

          <div className="stay-card-actions">
            <button
              onClick={() => navigate(`/pg/${pg.slug}`)}
              className="btn-card-visit"
            >
              View Stay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── CITY PAGE COMPONENT ─── */
const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedLocality, setSelectedLocality] = useState("");
  const [gender, setGender] = useState("");
  const [food, setFood] = useState(false);
  const [ac, setAc] = useState(false);
  const [wifi, setWifi] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  const cityLabel = city ? city.charAt(0).toUpperCase() + city.slice(1) : "";
  const localities = city && LOCALITY_PRESETS[city.toLowerCase()] ? LOCALITY_PRESETS[city.toLowerCase()] : [];

  const activeFiltersCount = [
    Boolean(gender),
    food,
    ac,
    wifi,
    Boolean(selectedLocality),
  ].filter(Boolean).length;

  useEffect(() => {
    document.title = cityLabel
      ? `PG in ${cityLabel} | Find Rooms & Hostels - Stanzo`
      : "Stanzo — Find PGs & Hostels Across India";

    return () => {
      document.title = "Stanzo — Find PGs & Hostels Across India";
    };
  }, [cityLabel]);

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

  return (
    <div className="results-page-section" style={{ minHeight: "80vh" }}>
      <div className="container">
        {/* City Breadcrumbs & Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="detail-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span style={{ color: "var(--brand-600)", fontWeight: 700 }}>{cityLabel}</span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "var(--slate-900)", letterSpacing: "-0.02em" }}>
                PGs & Co-Living in {cityLabel}
              </h1>
              <p style={{ color: "var(--slate-600)", fontSize: 14.5, fontWeight: 500, marginTop: 4 }}>
                {loading ? "Searching verified stays..." : `${total} Stanzo Verified accommodations with homestyle meals & zero brokerage`}
              </p>
            </div>
            <Link to="/" className="quick-tab-pill" style={{ fontSize: 13 }}>
              ← All Cities
            </Link>
          </div>
        </div>

        {/* 2-Column Results Layout */}
        <div className="results-layout">
          {/* Left Sidebar */}
          <aside className="filter-sidebar">
            <div className="filter-sidebar-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 className="filter-sidebar-title">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="filter-count-badge">{activeFiltersCount}</span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button className="filter-sidebar-reset" onClick={clearAllFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Localities */}
            {localities.length > 0 && (
              <div className="filter-group">
                <span className="filter-group-label">Popular Areas in {cityLabel}</span>
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

            {/* Category */}
            <div className="filter-group">
              <span className="filter-group-label">Stay Category</span>
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={gender === "male"}
                  onChange={() => setGender(gender === "male" ? "" : "male")}
                />
                <span>Boys PG & Hostels</span>
              </label>
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={gender === "female"}
                  onChange={() => setGender(gender === "female" ? "" : "female")}
                />
                <span>Girls PG & Hostels</span>
              </label>
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={gender === "any"}
                  onChange={() => setGender(gender === "any" ? "" : "any")}
                />
                <span>Co-Living (Any Gender)</span>
              </label>
            </div>

            {/* Amenities */}
            <div className="filter-group">
              <span className="filter-group-label">Amenities</span>
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={food}
                  onChange={() => setFood(!food)}
                />
                <span>Meals Included</span>
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

          {/* Right Results Column */}
          <main>
            <div className="results-header-bar">
              <h2 className="results-count-title">
                {loading
                  ? `Searching stays in ${cityLabel}...`
                  : `${total} Stay${total !== 1 ? "s" : ""} in ${cityLabel}`}
              </h2>

              <div className="results-sort-wrap">
                <span className="results-sort-label">Sort:</span>
                <select
                  className="results-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="listings-grid-layout">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="empty-results-box">
                <svg className="empty-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" />
                  <path d="M9 22V12h6v10" />
                </svg>
                <h3 className="empty-results-title">No Stays Found in {cityLabel}</h3>
                <p className="empty-results-sub">
                  We are actively onboarding new verified properties here. Check back soon or browse nearby cities.
                </p>
                <button onClick={clearAllFilters} className="btn-card-visit">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="listings-grid-layout">
                {listings.map((pg) => (
                  <StayCard key={pg._id} pg={pg} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CityPage;
