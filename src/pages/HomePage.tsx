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

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
];

const POPULAR_CITY_HUBS = [
  {
    name: "Bangalore",
    slug: "bangalore",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80",
    areas: "Koramangala, HSR Layout, Indiranagar",
  },
  {
    name: "Gurgaon",
    slug: "gurgaon",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80",
    areas: "Cyber City, DLF Phase 3, Sector 48",
  },
  {
    name: "Hyderabad",
    slug: "hyderabad",
    image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600&auto=format&fit=crop&q=80",
    areas: "Hitec City, Madhapur, Gachibowli",
  },
  {
    name: "Pune",
    slug: "pune",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
    areas: "Hinjewadi, Viman Nagar, Wakad",
  },
  {
    name: "Mumbai",
    slug: "mumbai",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=80",
    areas: "Andheri, Powai, Bandra",
  },
  {
    name: "Delhi",
    slug: "delhi",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80",
    areas: "North Campus, Saket, Hauz Khas",
  },
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

/* ─── MODERN LUXURY STAY CARD COMPONENT ─── */
const StayCard = ({ pg }: { pg: Listing }) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const navigate = useNavigate();

  const photosList = pg.photos && pg.photos.length > 0 ? pg.photos : FALLBACK_PHOTOS;
  const currentPhoto = photosList[activePhotoIdx] || photosList[0];
  const cityLabel = pg.city.charAt(0).toUpperCase() + pg.city.slice(1);

  return (
    <div className="stay-card-luxury">
      {/* Media Container */}
      <div className="stay-card-media">
        <Link to={`/pg/${pg.slug}`}>
          <img
            src={currentPhoto}
            alt={pg.title}
            className="stay-card-img"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="stay-card-badges-top">
          <div className="badge-verified-pill">
            <span className="badge-verified-dot" />
            <span>Stanzo Verified</span>
          </div>

          <div className={`badge-gender-pill ${pg.genderPreference}`}>
            {GENDER_LABELS[pg.genderPreference] || "Co-Living"}
          </div>
        </div>

        {/* Dots on Hover */}
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

      {/* Card Body */}
      <div className="stay-card-body">
        {/* Locality */}
        <div className="stay-card-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14, color: "var(--brand-600)", flexShrink: 0 }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span>{pg.locality ? `${pg.locality}, ` : ""}{cityLabel}</span>
        </div>

        {/* Title */}
        <Link to={`/pg/${pg.slug}`}>
          <h3 className="stay-card-title">{pg.title}</h3>
        </Link>

        {/* Micro Amenities */}
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
                <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
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
              {pg.availableBeds} beds left
            </span>
          ) : (
            <span className="amenity-chip-micro" style={{ color: "var(--brand-700)", background: "var(--brand-50)" }}>
              Filling fast
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="stay-card-footer">
          <div className="stay-card-price-wrap">
            <div className="stay-card-rent">₹{pg.rentFrom.toLocaleString("en-IN")}</div>
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

/* ─── HOMEPAGE COMPONENT ─── */
const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

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

  const activeFiltersCount = [
    Boolean(city),
    Boolean(gender),
    food,
    ac,
    wifi,
    Boolean(rentMin || rentMax),
    Boolean(selectedLocality),
  ].filter(Boolean).length;

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

      if (selectedLocality) {
        results = results.filter(item =>
          item.locality?.toLowerCase().includes(selectedLocality.toLowerCase()) ||
          item.title?.toLowerCase().includes(selectedLocality.toLowerCase())
        );
      }

      if (sortBy === "price_asc") {
        results.sort((a, b) => a.rentFrom - b.rentFrom);
      } else if (sortBy === "price_desc") {
        results.sort((a, b) => b.rentFrom - a.rentFrom);
      } else if (sortBy === "beds") {
        results.sort((a, b) => (b.availableBeds || 0) - (a.availableBeds || 0));
      }

      setListings(results);
      setTotal(results.length);

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

  const activeLocalities = city && LOCALITY_PRESETS[city.toLowerCase()]
    ? LOCALITY_PRESETS[city.toLowerCase()]
    : LOCALITY_PRESETS["bangalore"];

  return (
    <>
      {/* ─── HERO SECTION ─── */}
      <section className="luxury-hero">
        <div className="hero-ambient-glow-1" />
        <div className="hero-ambient-glow-2" />
        
        <div className="container">
          <div className="hero-container-inner">
            <div className="hero-tag-pill">
              <span className="hero-tag-pulse" />
              Verified Accommodations Across India
            </div>

            <h1 className="hero-headline">
              Find PGs & Co-Living Spaces <br />
              <span className="hero-headline-gradient">Where You Truly Belong</span>
            </h1>

            <p className="hero-subhead">
              Standardized rooms, freshly cooked meals, high-speed Wi-Fi, and 24/7 security.
              Zero brokerage guaranteed.
            </p>

            {/* ─── FLOATING SEARCH CARD ─── */}
            <div className="search-card-float">
              {/* Segment 1: City */}
              <div className="search-field-box">
                <span className="search-field-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13, color: "var(--brand-600)" }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  Location / City
                </span>
                <select
                  className="search-field-select"
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

              {/* Segment 2: Stay Type */}
              <div className="search-field-box">
                <span className="search-field-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13, color: "var(--brand-600)" }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  </svg>
                  Stay Category
                </span>
                <select
                  className="search-field-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">All Stays</option>
                  <option value="male">Boys PG & Hostel</option>
                  <option value="female">Girls PG & Hostel</option>
                  <option value="any">Co-Living Space</option>
                </select>
              </div>

              {/* Segment 3: Budget in Indian Rupees */}
              <div className="search-field-box">
                <span className="search-field-label">
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--brand-600)", marginRight: 2 }}>₹</span>
                  Monthly Budget
                </span>
                <div className="search-field-budget-inputs">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={rentMin}
                    onChange={(e) => setRentMin(e.target.value)}
                  />
                  <span style={{ color: "var(--slate-400)" }}>–</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={rentMax}
                    onChange={(e) => setRentMax(e.target.value)}
                  />
                </div>
              </div>

              {/* CTA */}
              <button className="search-btn-primary" onClick={fetchListings}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 17, height: 17 }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Find Stays
              </button>
            </div>

            {/* Trust Badges */}
            <div className="hero-trust-bar">
              <div className="hero-trust-badge">
                <svg className="hero-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>100% Verified Properties</span>
              </div>
              <div className="hero-trust-badge">
                <svg className="hero-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Zero Brokerage Ever</span>
              </div>
              <div className="hero-trust-badge">
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

      {/* ─── POPULAR CITIES HUB EXPLORER ─── */}
      <section className="cities-explorer-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Explore Top Tech & Student Hubs</h2>
              <p className="section-subtitle">Curated premium accommodations close to major tech parks & colleges</p>
            </div>
          </div>

          <div className="cities-grid">
            {POPULAR_CITY_HUBS.map((hub) => (
              <Link
                key={hub.slug}
                to={`/city/${hub.slug}`}
                className="city-card-tile"
              >
                <img src={hub.image} alt={hub.name} className="city-tile-img" loading="lazy" />
                <div className="city-tile-overlay">
                  <div className="city-tile-name">{hub.name}</div>
                  <div className="city-tile-count">{hub.areas}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MAIN RESULTS & FILTERS SECTION ─── */}
      <section className="results-page-section">
        <div className="container">
          {/* Quick Filter Collections Bar */}
          <div className="quick-collections-bar">
            <button
              onClick={() => { setGender(""); setFood(false); setAc(false); }}
              className={`quick-tab-pill ${!gender && !food && !ac ? "active" : ""}`}
            >
              All Stays
            </button>
            <button
              onClick={() => setGender(gender === "male" ? "" : "male")}
              className={`quick-tab-pill ${gender === "male" ? "active" : ""}`}
            >
              Boys PGs
            </button>
            <button
              onClick={() => setGender(gender === "female" ? "" : "female")}
              className={`quick-tab-pill ${gender === "female" ? "active" : ""}`}
            >
              Girls PGs
            </button>
            <button
              onClick={() => setGender(gender === "any" ? "" : "any")}
              className={`quick-tab-pill ${gender === "any" ? "active" : ""}`}
            >
              Co-Living
            </button>
            <button
              onClick={() => setFood(!food)}
              className={`quick-tab-pill ${food ? "active" : ""}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 01-4-4V8z" />
              </svg>
              Meals Included
            </button>
            <button
              onClick={() => setAc(!ac)}
              className={`quick-tab-pill ${ac ? "active" : ""}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14 }}>
                <rect x="1" y="3" width="22" height="11" rx="2" /><path d="M5 14v7M12 14v7M19 14v7" />
              </svg>
              AC Rooms
            </button>
          </div>

          <div className="results-layout">
            {/* Left Filter Sidebar */}
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
              <div className="filter-group">
                <span className="filter-group-label">
                  Localities {city ? `in ${city.charAt(0).toUpperCase() + city.slice(1)}` : ""}
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

              {/* Budget */}
              <div className="filter-group">
                <span className="filter-group-label">Budget Ranges</span>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={rentMax === "8000"}
                    onChange={() => {
                      if (rentMax === "8000") {
                        setRentMin("");
                        setRentMax("");
                      } else {
                        setRentMin("0");
                        setRentMax("8000");
                      }
                    }}
                  />
                  <span>Under ₹8,000 / month</span>
                </label>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={rentMin === "8000" && rentMax === "15000"}
                    onChange={() => {
                      if (rentMin === "8000") {
                        setRentMin("");
                        setRentMax("");
                      } else {
                        setRentMin("8000");
                        setRentMax("15000");
                      }
                    }}
                  />
                  <span>₹8,000 – ₹15,000 / month</span>
                </label>
                <label className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={rentMin === "15000"}
                    onChange={() => {
                      if (rentMin === "15000") {
                        setRentMin("");
                        setRentMax("");
                      } else {
                        setRentMin("15000");
                        setRentMax("");
                      }
                    }}
                  />
                  <span>₹15,000+ (Premium Stays)</span>
                </label>
              </div>
            </aside>

            {/* Right Listings Column */}
            <main>
              {/* Header Bar */}
              <div className="results-header-bar">
                <h2 className="results-count-title">
                  {loading
                    ? "Searching verified stays..."
                    : `${total > 0 ? total : listings.length} Verified Stay${(total || listings.length) !== 1 ? "s" : ""}${city ? ` in ${city.charAt(0).toUpperCase() + city.slice(1)}` : " Across India"}`}
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
                    <option value="beds">Available Beds</option>
                  </select>
                </div>
              </div>

              {/* Grid or Skeletons */}
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
                  <h3 className="empty-results-title">No Stays Found Matching Filters</h3>
                  <p className="empty-results-sub">
                    Try broadening your budget range, clearing filters, or browsing other popular areas.
                  </p>
                  <button onClick={clearAllFilters} className="btn-card-visit">
                    Clear All Filters
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
      </section>

      {/* ─── WHY CHOOSE STANZO ─── */}
      <section className="why-stanzo-section">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
            <h2 className="section-title">The Stanzo Living Experience</h2>
            <p className="section-subtitle">Standardized quality and complete peace of mind in every home</p>
          </div>

          <div className="why-stanzo-grid">
            <div className="why-feature-card">
              <div className="why-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={{ width: 24, height: 24 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="why-feature-title">100% Verified Stays</h3>
              <p className="why-feature-desc">Every property is personally audited for safety, water supply, hygiene, and room standards.</p>
            </div>

            <div className="why-feature-card">
              <div className="why-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={{ width: 24, height: 24 }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className="why-feature-title">Zero Brokerage Always</h3>
              <p className="why-feature-desc">Deal directly with verified property managers. No middlemen fees or hidden charges ever.</p>
            </div>

            <div className="why-feature-card">
              <div className="why-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={{ width: 24, height: 24 }}>
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 01-4-4V8z" />
                </svg>
              </div>
              <h3 className="why-feature-title">Fresh Homestyle Food</h3>
              <p className="why-feature-desc">Nutritious meals cooked fresh daily in hygienic kitchens with clean RO drinking water.</p>
            </div>

            <div className="why-feature-card">
              <div className="why-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={{ width: 24, height: 24 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="why-feature-title">3-Tier Safety & CCTV</h3>
              <p className="why-feature-desc">24/7 CCTV surveillance, biometric access, and on-ground emergency support teams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── OWNER PARTNER CTA ─── */}
      <section className="owner-cta-section">
        <div className="container">
          <div className="owner-cta-card">
            <div className="owner-cta-content">
              <div className="owner-cta-tag">
                <span>Property Owners & Landlords</span>
              </div>
              <h2 className="owner-cta-title">
                Have a PG or Hostel? <br />
                Partner with Stanzo & Get 100% Occupancy
              </h2>
              <p className="owner-cta-sub">
                List your property for free, receive verified tenant inquiries, manage bookings, and automate rent collection seamlessly.
              </p>
            </div>

            <a
              href="https://stanzo.in"
              target="_blank"
              rel="noopener noreferrer"
              className="owner-cta-btn"
            >
              <span>List Your Property Free →</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
