import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
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
  totalBeds?: number;
  photos: string[];
  amenities: string[];
}

const GENDER_LABELS: Record<string, string> = {
  any: "Co-Living",
  male: "Boys PG",
  female: "Girls PG",
};

// Fallback high quality stay photos if listing has none
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

/* ─── OYO HORIZONTAL LISTING CARD COMPONENT ─── */
const OYOLabelCard = ({ pg }: { pg: Listing }) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const navigate = useNavigate();

  const photosList = pg.photos && pg.photos.length > 0 ? pg.photos : FALLBACK_PHOTOS;
  const currentPhoto = photosList[activePhotoIdx] || photosList[0];
  const cityLabel = pg.city.charAt(0).toUpperCase() + pg.city.slice(1);

  // Realistic strike-through price calculation (25-30% higher for that OYO discount kick)
  const originalPrice = Math.round((pg.rentFrom * 1.33) / 100) * 100;
  const discountPercent = Math.round(((originalPrice - pg.rentFrom) / originalPrice) * 100);

  // Generate consistent social proof tag based on id
  const enquiryCount = (pg._id.charCodeAt(pg._id.length - 1) % 15) + 6;

  return (
    <div className="oyo-card">
      {/* Left Media Area: Main Image + 3-4 Thumbnails */}
      <div className="oyo-card-media">
        <img
          src={currentPhoto}
          alt={pg.title}
          className="oyo-card-main-img"
          loading="lazy"
        />
        <div className="card-badge-assured">
          <span className="card-badge-assured-dot" />
          STANZO ASSURED
        </div>

        {/* Thumbnail Preview Strip */}
        <div className="oyo-card-thumb-strip">
          {photosList.slice(0, 4).map((thumb, idx) => (
            <img
              key={idx}
              src={thumb}
              alt=""
              className={`oyo-card-thumb ${idx === activePhotoIdx ? "active" : ""}`}
              onMouseEnter={() => setActivePhotoIdx(idx)}
              onClick={() => setActivePhotoIdx(idx)}
            />
          ))}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="oyo-card-info">
        <div>
          {/* Top Row: Title + Urgency */}
          <div className="oyo-card-top-row">
            <Link to={`/pg/${pg.slug}`} style={{ textDecoration: "none" }}>
              <h3 className="oyo-card-title">{pg.title}</h3>
            </Link>
            <div className="urgency-badge">
              🔥 {enquiryCount} enquired recently
            </div>
          </div>

          {/* Location */}
          <div className="oyo-card-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14, color: "var(--brand-600)", flexShrink: 0 }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span>{pg.locality ? `${pg.locality}, ` : ""}{cityLabel}</span>
          </div>

          {/* Rating Pill + Category */}
          <div className="oyo-card-rating-row">
            <span className="rating-pill-green">
              4.6 ★
            </span>
            <span className="rating-pill-meta">
              (78 Ratings) · <span className="rating-descriptor">Excellent</span>
            </span>
            <span style={{ color: "var(--border)" }}>•</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)" }}>
              {GENDER_LABELS[pg.genderPreference]}
            </span>
            {pg.availableBeds > 0 ? (
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--oyo-green)" }}>
                • {pg.availableBeds} beds left
              </span>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-600)" }}>
                • Filling fast
              </span>
            )}
          </div>

          {/* Amenities Strip */}
          <div className="oyo-card-amenities">
            {pg.wifiAvailable && (
              <div className="amenity-pill-inline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12.55a11 11 0 0114.08 0" /><path d="M1.42 9a16 16 0 0121.16 0" /><circle cx="12" cy="20" r="1" fill="currentColor" />
                </svg>
                <span>Free WiFi</span>
              </div>
            )}
            {pg.acAvailable && (
              <div className="amenity-pill-inline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="1" y="3" width="22" height="11" rx="2" /><path d="M5 14v7M12 14v7M19 14v7" />
                </svg>
                <span>AC Room</span>
              </div>
            )}
            {pg.foodIncluded && (
              <div className="amenity-pill-inline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                </svg>
                <span>Meals Included</span>
              </div>
            )}
            <div className="amenity-pill-inline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Power Backup</span>
            </div>
            <div className="amenity-pill-inline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>24/7 Security</span>
            </div>
          </div>

          {/* Wizard Badge */}
          <div className="wizard-member-tag">
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 13, height: 13 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            WIZARD MEMBER · EXTRA 10% OFF
          </div>
        </div>

        {/* Bottom Pricing & Actions */}
        <div className="oyo-card-bottom">
          <div className="oyo-pricing-block">
            <div className="price-main-line">
              <span className="price-current">₹{pg.rentFrom.toLocaleString()}</span>
              <span className="price-original">₹{originalPrice.toLocaleString()}</span>
              <span className="price-discount-tag">{discountPercent}% off</span>
            </div>
            <div className="price-subtext">
              per month · Zero Brokerage · Free Maintenance
            </div>
          </div>

          <div className="oyo-card-actions">
            <Link to={`/pg/${pg.slug}`} className="btn-card-outline">
              View Details
            </Link>
            <button
              onClick={() => navigate(`/pg/${pg.slug}`)}
              className="btn-card-primary"
            >
              Book Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── HOMEPAGE MAIN COMPONENT ─── */
const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);

  // Search & Filter State
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [food, setFood] = useState(searchParams.get("food") === "true");
  const [ac, setAc] = useState(searchParams.get("ac") === "true");
  const [wifi, setWifi] = useState(searchParams.get("wifi") === "true");
  const [rentMin, setRentMin] = useState(searchParams.get("rentMin") || "");
  const [rentMax, setRentMax] = useState(searchParams.get("rentMax") || "");
  const [selectedLocality, setSelectedLocality] = useState(searchParams.get("locality") || "");
  const [sortBy, setSortBy] = useState("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFiltersCount = [
    Boolean(city),
    Boolean(gender),
    food,
    ac,
    wifi,
    Boolean(rentMin || rentMax),
    Boolean(selectedLocality),
  ].filter(Boolean).length;

  // Keep local city state in sync when URL search params change (e.g. from navbar city strip)
  useEffect(() => {
    const paramCity = searchParams.get("city") || "";
    if (paramCity !== city) {
      setCity(paramCity);
    }
  }, [searchParams]);

  useEffect(() => {
    api.get("/listings/cities")
      .then(r => setCities(r.data && r.data.length > 0 ? r.data : ["bangalore", "delhi", "gurgaon", "hyderabad", "mumbai", "pune", "chennai"]))
      .catch(() => setCities(["bangalore", "delhi", "gurgaon", "hyderabad", "mumbai", "pune", "chennai"]));
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
      let results: Listing[] = res.data?.listings || [];

      // Filter by locality if selected
      if (selectedLocality) {
        results = results.filter(item =>
          item.locality?.toLowerCase().includes(selectedLocality.toLowerCase()) ||
          item.title?.toLowerCase().includes(selectedLocality.toLowerCase())
        );
      }

      // Sort results
      if (sortBy === "price_asc") {
        results.sort((a, b) => a.rentFrom - b.rentFrom);
      } else if (sortBy === "price_desc") {
        results.sort((a, b) => b.rentFrom - a.rentFrom);
      } else if (sortBy === "beds") {
        results.sort((a, b) => (b.availableBeds || 0) - (a.availableBeds || 0));
      }

      setListings(results);
      setTotal(results.length);

      // Sync URL
      const p: Record<string, string> = {};
      if (city) p.city = city;
      if (gender) p.gender = gender;
      if (food) p.food = "true";
      if (ac) p.ac = "true";
      if (wifi) p.wifi = "true";
      if (rentMin) p.rentMin = rentMin;
      if (rentMax) p.rentMax = rentMax;
      if (selectedLocality) p.locality = selectedLocality;
      setSearchParams(p, { replace: true });
    } catch (err) {
      console.error("Fetch listings error:", err);
      setListings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [city, gender, food, ac, wifi, rentMin, rentMax, selectedLocality, sortBy]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const clearAllFilters = () => {
    setCity("");
    setGender("");
    setFood(false);
    setAc(false);
    setWifi(false);
    setRentMin("");
    setRentMax("");
    setSelectedLocality("");
    setSortBy("popular");
  };

  const copyCouponCode = () => {
    navigator.clipboard.writeText("STANZO20");
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const activeLocalities = city && LOCALITY_PRESETS[city.toLowerCase()]
    ? LOCALITY_PRESETS[city.toLowerCase()]
    : LOCALITY_PRESETS["bangalore"];

  return (
    <>
      {/* ─── HERO SECTION (OYO DARK + RED AMBIENT GLOW) ─── */}
      <section className="oyo-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-pill-tag">
              <span className="hero-pill-dot" />
              Over 1,000+ Verified PGs & Hostels in India
            </div>

            <h1 className="hero-heading">
              World's Leading <span>PG & Co-Living</span> Network
            </h1>

            <p className="hero-subtext">
              Standardized rooms with nutritious meals, high-speed Wi-Fi, and 24/7 security.
              Zero brokerage guaranteed.
            </p>

            {/* ─── FLOATING MULTI-SEGMENT OYO SEARCH BAR ─── */}
            <div className="oyo-search-bar">
              {/* Segment 1: City / Location */}
              <div className="search-segment">
                <span className="search-segment-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13, color: "var(--brand-600)" }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  Location / City
                </span>
                <div className="search-segment-control">
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setSelectedLocality("");
                    }}
                  >
                    <option value="">All Cities in India</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Segment 2: Gender / Stay Type */}
              <div className="search-segment">
                <span className="search-segment-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13, color: "var(--brand-600)" }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Sharing / Gender
                </span>
                <div className="search-segment-control">
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">All (Co-Living & Any)</option>
                    <option value="male">Boys PG</option>
                    <option value="female">Girls PG</option>
                  </select>
                </div>
              </div>

              {/* Segment 3: Price Range */}
              <div className="search-segment">
                <span className="search-segment-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13, color: "var(--brand-600)" }}>
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  Monthly Budget
                </span>
                <div className="search-rent-inputs">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={rentMin}
                    onChange={(e) => setRentMin(e.target.value)}
                  />
                  <span className="search-rent-dash">–</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={rentMax}
                    onChange={(e) => setRentMax(e.target.value)}
                  />
                </div>
              </div>

              {/* Search CTA */}
              <button className="search-btn-cta" onClick={fetchListings}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 18, height: 18 }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search PGs
              </button>
            </div>

            {/* Hero Trust Badges */}
            <div className="hero-trust-row">
              <div className="hero-trust-item">
                <svg className="hero-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>100% Verified Photos & Owners</span>
              </div>
              <div className="hero-trust-item">
                <svg className="hero-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Zero Brokerage Forever</span>
              </div>
              <div className="hero-trust-item">
                <svg className="hero-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 14 14" />
                </svg>
                <span>Instant Move-In Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STANZO WIZARD PROMO STRIP ─── */}
      <section className="promo-strip-section">
        <div className="container">
          <div className="wizard-promo-card">
            <div className="wizard-promo-left">
              <div className="wizard-badge-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                WIZARD
              </div>
              <div className="wizard-promo-text">
                <h4>Stanzo Wizard Membership Deal</h4>
                <p>Get flat 20% OFF on your 1st month rent + Free Maintenance. Valid across all verified stays.</p>
              </div>
            </div>

            <div className="wizard-promo-right">
              <span className="coupon-pill">CODE: STANZO20</span>
              <button className="btn-copy-code" onClick={copyCouponCode}>
                {codeCopied ? "✓ Copied!" : "Copy Code"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN RESULTS SECTION (2-COLUMN OYO LAYOUT) ─── */}
      <section className="results-page-section">
        <div className="container">
          <div className="results-layout">
            {/* Backdrop for mobile drawer */}
            {mobileFiltersOpen && (
              <div
                className="filter-drawer-backdrop"
                onClick={() => setMobileFiltersOpen(false)}
              />
            )}

            {/* ─── LEFT STICKY FILTERS SIDEBAR / MOBILE DRAWER ─── */}
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

              {/* Popular Localities */}
              <div className="filter-group">
                <span className="filter-group-label">
                  Popular Localities {city ? `in ${city.charAt(0).toUpperCase() + city.slice(1)}` : ""}
                </span>
                <div className="locality-chips-wrap">
                  {activeLocalities.map((loc) => (
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

              {/* Gender Preference */}
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

              {/* Quick Budget Ranges */}
              <div className="filter-group">
                <span className="filter-group-label">Budget Ranges</span>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={rentMax === "7000"}
                    onChange={() => {
                      if (rentMax === "7000") {
                        setRentMin("");
                        setRentMax("");
                      } else {
                        setRentMin("0");
                        setRentMax("7000");
                      }
                    }}
                  />
                  <span>Under ₹7,000 / month</span>
                </label>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={rentMin === "7000" && rentMax === "12000"}
                    onChange={() => {
                      if (rentMin === "7000") {
                        setRentMin("");
                        setRentMax("");
                      } else {
                        setRentMin("7000");
                        setRentMax("12000");
                      }
                    }}
                  />
                  <span>₹7,000 – ₹12,000 / month</span>
                </label>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={rentMin === "12000"}
                    onChange={() => {
                      if (rentMin === "12000") {
                        setRentMin("");
                        setRentMax("");
                      } else {
                        setRentMin("12000");
                        setRentMax("");
                      }
                    }}
                  />
                  <span>₹12,000+ / month (Premium)</span>
                </label>
              </div>
            </aside>

            {/* ─── RIGHT RESULTS COLUMN ─── */}
            <main>
              {/* Header Bar: Count + Mobile Filter Trigger + Sort */}
              <div className="results-header-bar">
                <div className="results-header-left">
                  <h2 className="results-count-title">
                    {loading
                      ? "Searching verified PGs..."
                      : `${total > 0 ? total : listings.length} PG${(total || listings.length) !== 1 ? "s" : ""} Available${city ? ` in ${city.charAt(0).toUpperCase() + city.slice(1)}` : " across India"}`}
                  </h2>
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
                    <span className="results-sort-label">Sort By:</span>
                    <select
                      className="results-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="popular">Popularity</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="beds">Available Beds</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Listings Stack */}
              {loading ? (
                <div className="listings-stack">
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
                  <h3 className="empty-results-title">No PGs Found Matching Your Criteria</h3>
                  <p className="empty-results-sub">
                    Try broadening your budget range, clearing filters, or browsing other popular areas.
                  </p>
                  <button onClick={clearAllFilters} className="btn-card-primary">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="listings-stack">
                  {listings.map((pg) => (
                    <OYOLabelCard key={pg._id} pg={pg} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* ─── WHY STANZO PG (VALUE HIGHLIGHTS) ─── */}
      <section className="why-section">
        <div className="container">
          <div className="section-headline">
            <h2>Why Choose Stanzo PG?</h2>
            <p>India's most trusted network of student and professional accommodations</p>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 24, height: 24 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>100% Verified Stays</h3>
              <p>Every PG is personally inspected by our ground team for hygiene, safety, and standardized amenities.</p>
            </div>

            <div className="why-card">
              <div className="why-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 24, height: 24 }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3>Zero Brokerage Always</h3>
              <p>Connect directly with property managers. No middlemen, no commissions, no hidden fees ever.</p>
            </div>

            <div className="why-card">
              <div className="why-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 24, height: 24 }}>
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 01-4-4V8z" />
                </svg>
              </div>
              <h3>Fresh Homestyle Meals</h3>
              <p>Nutritious breakfast, lunch, and dinner cooked fresh daily with clean RO drinking water.</p>
            </div>

            <div className="why-card">
              <div className="why-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 24, height: 24 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Safe & Secure Living</h3>
              <p>Equipped with 24/7 CCTV surveillance, biometric locks, professional wardens, and power backup.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
