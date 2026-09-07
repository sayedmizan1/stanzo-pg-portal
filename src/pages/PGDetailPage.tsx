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

interface LeadForm { name: string; phone: string; email: string; message: string; }

const GENDER_LABEL: Record<string, string> = {
  any: "Co-living (Male & Female)",
  male: "Boys PG",
  female: "Girls PG"
};

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z"/>
    <path d="M9 22V12h6v10"/>
  </svg>
);

const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.77 9.75 19.79 19.79 0 01.7 1.11 2 2 0 012.7 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.08-1.08a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const IconWA = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const PGDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [form, setForm] = useState<LeadForm>({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/listings/slug/${slug}`)
      .then(r => setListing(r.data))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    setSubmitting(true); setError("");
    try {
      await api.post("/leads", { listingId: listing!._id, ...form });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "32px 24px" }}>
        <div className="skeleton" style={{ height: 420, borderRadius: 14, marginBottom: 24 }} />
        <div style={{ display: "flex", gap: 24 }}>
          <div className="skeleton" style={{ flex: 1, height: 200, borderRadius: 14 }} />
          <div className="skeleton" style={{ width: 340, height: 300, borderRadius: 14 }} />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container" style={{ padding: "80px 24px" }}>
        <div className="empty-state">
          <div className="empty-icon"><IconHome /></div>
          <div className="empty-title">Listing not found</div>
          <div className="empty-text">This PG listing may no longer be available or has been removed.</div>
          <Link to="/" className="empty-cta">Browse all PGs</Link>
        </div>
      </div>
    );
  }

  const photos = listing.photos?.length > 0 ? listing.photos : [];
  const cityLabel = listing.city.charAt(0).toUpperCase() + listing.city.slice(1);
  const rentRange = listing.rentTo > listing.rentFrom
    ? `₹${listing.rentFrom.toLocaleString()} – ₹${listing.rentTo.toLocaleString()}`
    : `₹${listing.rentFrom.toLocaleString()}`;

  const facts = [
    { label: "Food / Meals", value: listing.foodIncluded },
    { label: "Air Conditioning", value: listing.acAvailable },
    { label: "WiFi", value: listing.wifiAvailable },
    { label: "Parking", value: listing.parkingAvailable },
    { label: "Laundry", value: listing.laundryAvailable },
  ];

  return (
    <div className="container detail-container">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to={`/city/${listing.city}`}>{cityLabel}</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: "var(--muted)" }}>{listing.title}</span>
      </div>

      <div className="detail-wrap">
        {/* ─── MAIN CONTENT ─── */}
        <div className="detail-main">

          {/* Gallery */}
          {photos.length > 0 ? (
            <>
              <img src={photos[activePhoto]} alt={listing.title} className="detail-gallery-main" />
              {photos.length > 1 && (
                <div className="detail-thumbs">
                  {photos.map((url, i) => (
                    <img
                      key={i} src={url} alt=""
                      className={`detail-thumb ${i === activePhoto ? "active" : ""}`}
                      onClick={() => setActivePhoto(i)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="detail-gallery-placeholder">
              <div style={{ width: 60, height: 60, color: "#93c5fd" }}><IconHome /></div>
            </div>
          )}

          {/* Title block */}
          <h1 className="detail-title">{listing.title}</h1>
          <div className="detail-loc">
            <IconPin />
            {listing.address}{listing.locality ? `, ${listing.locality}` : ""}, {cityLabel}
            {listing.pincode ? ` — ${listing.pincode}` : ""}
          </div>
          <div className="detail-tags">
            {listing.availableBeds > 0 ? (
              <span className="tag tag-green">
                <span className="avail-dot green" style={{ marginRight: 4 }} />
                {listing.availableBeds} of {listing.totalBeds} beds available
              </span>
            ) : (
              <span className="tag tag-red">Fully occupied</span>
            )}
            <span className="tag tag-blue">{GENDER_LABEL[listing.genderPreference]}</span>
            <span className="tag tag-gray">{listing.views} views</span>
          </div>

          {/* Rent */}
          <div className="info-block" style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text)" }}>{rentRange}</span>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>per month</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 4 }}>
              Per bed · Security deposit may apply
            </p>
          </div>

          {/* Facilities */}
          <div className="info-block">
            <h2 className="info-block-title">Facilities</h2>
            <div className="fact-grid">
              {facts.map(({ label, value }) => (
                <div key={label} className="fact-item">
                  <div className="fact-item-label">{label}</div>
                  <div
                    className={`fact-item-value ${value ? "yes" : "no"}`}
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {value ? <IconCheck /> : <IconX />}
                    {value ? "Available" : "Not available"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="info-block">
              <h2 className="info-block-title">About this PG</h2>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                {listing.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div className="info-block">
              <h2 className="info-block-title">Amenities</h2>
              <div className="amenity-list">
                {listing.amenities.map(a => <span key={a} className="amenity">{a}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* ─── SIDEBAR ─── */}
        <div className="detail-aside">

          {/* Enquiry card */}
          <div className="enquiry-card" id="enquiry-card">
            <div className="enquiry-card-header">
              <h3>Request a callback</h3>
              <p>Free enquiry · No brokerage</p>
              <div className="enquiry-card-price">
                {rentRange} <span>/month</span>
              </div>
            </div>

            <div className="enquiry-card-body">
              {submitted ? (
                <div className="success-box">
                  <div className="success-icon"><IconCheck /></div>
                  <div className="success-title">Enquiry sent successfully</div>
                  <p className="success-text">
                    The PG owner will contact you shortly on <strong>{form.phone}</strong>.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", email: "", message: "" }); }}
                    style={{ marginTop: 16, background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && <div className="error-box">{error}</div>}

                  <div className="field-group">
                    <label>Full name *</label>
                    <input
                      type="text" required placeholder="Your name"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="field-group">
                    <label>Phone number *</label>
                    <input
                      type="tel" required placeholder="10-digit mobile number"
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="field-group">
                    <label>Email address</label>
                    <input
                      type="email" placeholder="Optional"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="field-group">
                    <label>Message</label>
                    <textarea
                      rows={3} placeholder="Move-in date, any questions..."
                      style={{ resize: "none" }}
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>

                  <button type="submit" className="btn-submit" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Enquiry"}
                  </button>
                </form>
              )}

              {/* WhatsApp */}
              {listing.whatsappEnabled && listing.contactPhone && (
                <a
                  href={`https://wa.me/${listing.contactPhone.replace(/\D/g, "")}?text=Hi, I found your PG "${listing.title}" on Stanzo and I am interested.`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-wa"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <IconWA /> Chat on WhatsApp
                </a>
              )}

              {/* Call */}
              {listing.contactPhone && (
                <a
                  href={`tel:${listing.contactPhone}`}
                  className="btn-call"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <IconPhone /> {listing.contactPhone}
                </a>
              )}

              <p className="privacy-note">
                Your contact details are only shared with the PG owner.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="summary-card">
            <div className="summary-row">
              <span className="summary-key">Total beds</span>
              <span className="summary-val">{listing.totalBeds}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Available beds</span>
              <span className="summary-val" style={{ color: listing.availableBeds > 0 ? "var(--green)" : "var(--red)" }}>
                {listing.availableBeds}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-key">Gender preference</span>
              <span className="summary-val">{GENDER_LABEL[listing.genderPreference]}</span>
            </div>
            <div className="summary-row">
              <span className="summary-key">City</span>
              <span className="summary-val">{cityLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="mobile-action-bar">
        <div className="mobile-action-price">
          <div className="mobile-price-val">{rentRange}</div>
          <div className="mobile-price-sub">/month</div>
        </div>
        <div className="mobile-action-buttons">
          {listing.whatsappEnabled && listing.contactPhone && (
            <a
              href={`https://wa.me/${listing.contactPhone.replace(/\D/g, "")}?text=Hi, I found your PG "${listing.title}" on Stanzo and I am interested.`}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-btn-wa"
              aria-label="WhatsApp"
            >
              <IconWA />
              <span>WhatsApp</span>
            </a>
          )}
          {listing.contactPhone ? (
            <a
              href={`tel:${listing.contactPhone}`}
              className="mobile-btn-call"
              aria-label="Call Owner"
            >
              <IconPhone />
              <span>Call</span>
            </a>
          ) : (
            <button
              onClick={() => {
                document.getElementById("enquiry-card")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mobile-btn-call"
            >
              Enquire Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PGDetailPage;
