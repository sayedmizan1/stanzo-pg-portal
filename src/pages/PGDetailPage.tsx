import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

interface Listing {
  _id: string;
  title: string;
  slug: string;
  description: string;
  photos: string[];
  address: string;
  locality: string;
  city: string;
  pincode: string;
  genderPreference: "any" | "male" | "female";
  foodIncluded: boolean;
  acAvailable: boolean;
  wifiAvailable: boolean;
  parkingAvailable: boolean;
  laundryAvailable: boolean;
  rentFrom: number;
  rentTo: number;
  contactPhone: string;
  whatsappEnabled: boolean;
  amenities: string[];
  availableBeds: number;
  totalBeds: number;
  views: number;
}

interface LeadForm {
  name: string;
  phone: string;
  email: string;
  message: string;
}

const GENDER_LABEL: Record<string, string> = {
  any: "Co-living (Male & Female)",
  male: "Boys PG & Hostel",
  female: "Girls PG & Hostel",
};

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
];

const PGDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [selectedSharing, setSelectedSharing] = useState<"single" | "double" | "triple">("double");
  const [form, setForm] = useState<LeadForm>({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get(`/listings/slug/${slug}`)
      .then((r) => {
        if (r.data) {
          setListing(r.data);
          const l = r.data;
          const cityLabel = l.city.charAt(0).toUpperCase() + l.city.slice(1);
          document.title = `${l.title} | PG in ${cityLabel} - Stanzo`;

          const setMeta = (property: string, content: string) => {
            let el = document.querySelector(`meta[property="${property}"]`);
            if (!el) {
              el = document.createElement("meta");
              el.setAttribute("property", property);
              document.head.appendChild(el);
            }
            el.setAttribute("content", content);
          };
          setMeta("og:title", `${l.title} | PG in ${cityLabel} - Stanzo`);
          setMeta("og:description", l.description || `Affordable PG accommodation in ${l.locality || cityLabel}. Starting from ₹${l.rentFrom?.toLocaleString("en-IN")}/month.`);
          setMeta("og:image", l.photos?.[0] || "");
          setMeta("og:type", "website");
          setMeta("og:url", window.location.href);
        } else {
          setListing(null);
          document.title = "PG Not Found - Stanzo";
        }
      })
      .catch((err) => {
        console.error("Listing fetch error:", err);
        setListing(null);
        document.title = "PG Not Found - Stanzo";
      })
      .finally(() => setLoading(false));

    return () => {
      document.title = "Stanzo - Find PGs & Hostels";
    };
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    const digitsOnly = form.phone.replace(/[^0-9]/g, "");
    if (digitsOnly.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/leads", {
        listingId: listing!._id,
        sharingType: selectedSharing,
        ...form,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please call or WhatsApp directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "40px 24px" }}>
        <div className="skeleton-card" style={{ height: 420, marginBottom: 24 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
          <div className="skeleton-card" style={{ height: 320 }} />
          <div className="skeleton-card" style={{ height: 400 }} />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <div className="empty-results-box">
          <h2 className="empty-results-title">Stay Listing Not Found</h2>
          <p className="empty-results-sub">
            The property you are looking for may have been moved or is currently not published.
          </p>
          <Link to="/" className="btn-card-visit">
            Explore All Available PGs
          </Link>
        </div>
      </div>
    );
  }

  const rawPhotos = listing.photos && listing.photos.length > 0 ? listing.photos : [];
  const galleryPhotos = rawPhotos.length >= 5
    ? rawPhotos
    : [...rawPhotos, ...FALLBACK_PHOTOS.slice(rawPhotos.length)];

  const cityLabel = listing.city.charAt(0).toUpperCase() + listing.city.slice(1);

  const baseRent = listing.rentFrom || 7000;
  const sharingRents = {
    single: Math.round(baseRent * 1.55),
    double: baseRent,
    triple: Math.round(baseRent * 0.78),
  };

  const currentRent = sharingRents[selectedSharing];

  const nextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % galleryPhotos.length);
  };
  const prevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  return (
    <div className="detail-page-wrap">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="detail-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/city/${listing.city}`}>{cityLabel}</Link>
          <span>/</span>
          <span>{listing.locality || cityLabel}</span>
          <span>/</span>
          <span style={{ color: "var(--slate-900)", fontWeight: 700 }}>{listing.title}</span>
        </div>

        {/* ─── 5-PHOTO MOSAIC GALLERY ─── */}
        <div className="mosaic-gallery">
          <img
            src={galleryPhotos[activePhotoIdx]}
            alt={listing.title}
            className="mosaic-img-hero"
          />
          {galleryPhotos.slice(1, 5).map((imgUrl, i) => (
            <img
              key={i}
              src={imgUrl}
              alt={`${listing.title} photo ${i + 2}`}
              className="mosaic-img-item"
              onClick={() => setActivePhotoIdx(i + 1)}
            />
          ))}

          {/* Mobile Navigation Arrows */}
          <div className="mosaic-nav-controls">
            <button
              type="button"
              className="mosaic-nav-arrow"
              onClick={prevPhoto}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <span className="mosaic-photo-indicator">
              {activePhotoIdx + 1} / {galleryPhotos.length}
            </span>
            <button
              type="button"
              className="mosaic-nav-arrow"
              onClick={nextPhoto}
              aria-label="Next photo"
            >
              ›
            </button>
          </div>
        </div>

        {/* ─── DETAIL CONTENT + STICKY SIDEBAR ─── */}
        <div className="detail-columns">
          {/* Main Content Column */}
          <div>
            {/* Header Block */}
            <div className="detail-header-block">
              <h1 className="detail-header-title">{listing.title}</h1>
              <div className="detail-header-loc">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16, color: "var(--brand-600)", flexShrink: 0 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span>
                  {listing.address ? `${listing.address}, ` : ""}
                  {listing.locality ? `${listing.locality}, ` : ""}
                  {cityLabel} {listing.pincode ? `– ${listing.pincode}` : ""}
                </span>
              </div>

              {/* Badges */}
              <div className="detail-badges-row">
                <div className="badge-verified-pill" style={{ padding: "6px 12px", fontSize: 12 }}>
                  <span className="badge-verified-dot" />
                  Stanzo Verified Property
                </div>
                <div className={`badge-gender-pill ${listing.genderPreference}`} style={{ padding: "6px 12px", fontSize: 12 }}>
                  {GENDER_LABEL[listing.genderPreference]}
                </div>
                {listing.availableBeds > 0 ? (
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--emerald-600)" }}>
                    • {listing.availableBeds} beds available
                  </span>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-600)" }}>
                    • Inquire for upcoming vacancy
                  </span>
                )}
              </div>
            </div>

            {/* Room Sharing Type Selector */}
            <div className="detail-section-block">
              <h2 className="detail-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20, color: "var(--brand-600)" }}>
                  <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
                </svg>
                Select Room Sharing Option
              </h2>
              <div className="room-sharing-grid">
                <button
                  type="button"
                  onClick={() => setSelectedSharing("single")}
                  className={`sharing-card-btn ${selectedSharing === "single" ? "active" : ""}`}
                >
                  <div className="sharing-type-name">Single Private Room</div>
                  <div className="sharing-price">₹{sharingRents.single.toLocaleString()}</div>
                  <div className="sharing-sub">Private room with attached washroom</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSharing("double")}
                  className={`sharing-card-btn ${selectedSharing === "double" ? "active" : ""}`}
                >
                  <div className="sharing-type-name">2 Sharing (Double)</div>
                  <div className="sharing-price">₹{sharingRents.double.toLocaleString()}</div>
                  <div className="sharing-sub">Most Popular · Shared with 1 roommate</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSharing("triple")}
                  className={`sharing-card-btn ${selectedSharing === "triple" ? "active" : ""}`}
                >
                  <div className="sharing-type-name">3 Sharing (Triple)</div>
                  <div className="sharing-price">₹{sharingRents.triple.toLocaleString()}</div>
                  <div className="sharing-sub">Budget Friendly · Shared with 2 roommates</div>
                </button>
              </div>
            </div>

            {/* Included Amenities */}
            <div className="detail-section-block">
              <h2 className="detail-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20, color: "var(--brand-600)" }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Standard Living Amenities
              </h2>

              <div className="amenities-group-grid">
                <div className="amenity-item-row">
                  <span className="amenity-item-icon">📶</span>
                  <div>
                    <strong>High-Speed Wi-Fi</strong>
                    <div className="amenity-item-sub">Unlimited high-speed optical fiber</div>
                  </div>
                </div>

                <div className="amenity-item-row">
                  <span className="amenity-item-icon">🍱</span>
                  <div>
                    <strong>Nutritious Daily Food</strong>
                    <div className="amenity-item-sub">Breakfast, Lunch & Dinner included</div>
                  </div>
                </div>

                <div className="amenity-item-row">
                  <span className="amenity-item-icon">❄️</span>
                  <div>
                    <strong>Air Conditioning (AC)</strong>
                    <div className="amenity-item-sub">Energy-efficient climate control</div>
                  </div>
                </div>

                <div className="amenity-item-row">
                  <span className="amenity-item-icon">⚡</span>
                  <div>
                    <strong>100% Power Backup</strong>
                    <div className="amenity-item-sub">Automatic DG power fallback</div>
                  </div>
                </div>

                <div className="amenity-item-row">
                  <span className="amenity-item-icon">🧹</span>
                  <div>
                    <strong>Daily Housekeeping</strong>
                    <div className="amenity-item-sub">Professional deep cleaning</div>
                  </div>
                </div>

                <div className="amenity-item-row">
                  <span className="amenity-item-icon">🔒</span>
                  <div>
                    <strong>3-Tier Security</strong>
                    <div className="amenity-item-sub">24/7 CCTV surveillance & warden</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="detail-section-block">
              <h2 className="detail-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20, color: "var(--brand-600)" }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                About This Stay
              </h2>
              <div className="detail-description-text">
                {listing.description || (
                  <p>
                    Welcome to {listing.title}, an exclusive Stanzo verified property in the heart of {listing.locality || cityLabel}.
                    Thoughtfully crafted for working professionals and students who value comfort, clean spaces, and seamless connectivity.
                    All rooms are furnished with ergonomic beds, dedicated study desks, and individual wardrobe storage.
                  </p>
                )}
              </div>
            </div>

            {/* House Guidelines */}
            <div className="detail-section-block">
              <h2 className="detail-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20, color: "var(--brand-600)" }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                House Guidelines
              </h2>
              <div className="house-rules-list">
                <div className="rule-item">✓ Zero Brokerage & direct verified owner pricing</div>
                <div className="rule-item">✓ Notice period: 30 days prior notice required</div>
                <div className="rule-item">✓ Visitors allowed in designated community areas</div>
                <div className="rule-item">✓ 100% refundable security deposit on checkout</div>
                <div className="rule-item">✓ Clean & smoke-free indoor environment</div>
              </div>
            </div>
          </div>

          {/* ─── STICKY ENQUIRY / BOOKING SIDEBAR ─── */}
          <aside className="sticky-enquiry-card" id="enquiry-section">
            <div className="booking-price-header">
              <div className="booking-price-line">
                <span className="booking-price-current">₹{currentRent.toLocaleString()}</span>
                <span style={{ fontSize: 14, color: "var(--slate-500)", fontWeight: 600 }}>/ month</span>
              </div>
              <div className="booking-price-sub">
                {selectedSharing} sharing · Zero Brokerage · Free Wi-Fi & Maintenance
              </div>
            </div>

            {/* WhatsApp & Call Direct Actions */}
            <div className="booking-action-buttons">
              {listing.whatsappEnabled && listing.contactPhone && (
                <a
                  href={`https://wa.me/${listing.contactPhone.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20am%20interested%20in%20${encodeURIComponent(listing.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-large"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
                    <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.3-.778.98-.954 1.18-.175.2-.351.225-.652.075-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.5-1.787-1.676-2.088-.175-.3-.019-.462.132-.612.136-.135.301-.351.452-.527.15-.175.2-.3.301-.5.101-.2.051-.376-.025-.526-.075-.15-.678-1.633-.93-2.242-.244-.593-.493-.513-.678-.522-.175-.009-.376-.01-.577-.01-.201 0-.527.075-.803.376s-1.054 1.03-1.054 2.513 1.079 2.914 1.23 3.115c.15.2 2.122 3.24 5.14 4.544.718.31 1.278.495 1.714.634.721.23 1.378.197 1.898.12.58-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.125-.276-.2-.577-.35z" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.434 5.18L2 22l4.98-1.399C8.423 21.499 10.153 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.174c-1.662 0-3.21-.502-4.507-1.365l-.323-.215-2.964.833.844-2.89-.236-.339C3.896 14.854 3.4 13.47 3.4 12c0-4.742 3.858-8.6 8.6-8.6 4.741 0 8.6 3.858 8.6 8.6 0 4.741-3.859 8.174-8.6 8.174z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              )}

              {listing.contactPhone && (
                <a href={`tel:${listing.contactPhone}`} className="btn-call-outline">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Call Property Manager
                </a>
              )}
            </div>

            {/* Callback Form */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border-light)" }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--slate-900)", marginBottom: 4 }}>
                Schedule a Free Guided Visit
              </div>
              <div style={{ fontSize: 12.5, color: "var(--slate-500)", marginBottom: 14 }}>
                Our on-ground manager will assist you with room tour.
              </div>

              {submitted ? (
                <div style={{ background: "var(--emerald-50)", border: "1px solid var(--emerald-500)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ color: "var(--emerald-700)", fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                    ✓ Visit Request Received!
                  </div>
                  <div style={{ fontSize: 13, color: "var(--emerald-700)" }}>
                    The property manager will contact you shortly on <strong>{form.phone}</strong>.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {error && (
                    <div style={{ background: "#FEE2E2", color: "#DC2626", fontSize: 12, padding: 8, borderRadius: 6, fontWeight: 600 }}>
                      {error}
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    placeholder="Your Full Name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ padding: "11px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 13.5, outline: "none" }}
                  />

                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number (10 digits) *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ padding: "11px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 13.5, outline: "none" }}
                  />

                  <textarea
                    rows={2}
                    placeholder="Preferred move-in date or questions (optional)"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ padding: "11px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: 13.5, resize: "none", outline: "none" }}
                  />

                  <button type="submit" disabled={submitting} className="btn-book-green">
                    {submitting ? "Submitting..." : "Book Free Visit"}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <div className="mobile-detail-bottom-bar">
        <div>
          <div className="mobile-bottom-rent">₹{currentRent.toLocaleString()}</div>
          <div className="mobile-bottom-sub">/ month · zero brokerage</div>
        </div>
        <div className="mobile-bottom-actions">
          {listing.whatsappEnabled && listing.contactPhone && (
            <a
              href={`https://wa.me/${listing.contactPhone.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20am%20interested%20in%20${encodeURIComponent(listing.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-mobile-whatsapp"
            >
              WhatsApp
            </a>
          )}
          <a
            href="#enquiry-section"
            className="btn-card-visit"
            style={{ padding: "9px 16px", fontSize: 13.5 }}
          >
            Book Visit
          </a>
        </div>
      </div>
    </div>
  );
};

export default PGDetailPage;
