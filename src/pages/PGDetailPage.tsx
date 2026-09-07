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

const GENDER_LABEL = { any: "Any Gender", male: "Boys Only", female: "Girls Only" };

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
    const load = async () => {
      try {
        const res = await api.get(`/listings/slug/${slug}`);
        setListing(res.data);
      } catch {
        setListing(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      setError("Name and phone are required.");
      return;
    }
    setSubmitting(true);
    setError("");
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
      <div className="container" style={{ padding: "40px 20px" }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 14, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 60 }}>😕</p>
        <h2 style={{ fontSize: 24, margin: "16px 0 8px" }}>Listing Not Found</h2>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>This PG listing may have been removed or is no longer available.</p>
        <Link to="/" className="btn btn-primary">← Browse All PGs</Link>
      </div>
    );
  }

  const photos = listing.photos?.length > 0 ? listing.photos : [];
  const cityLabel = listing.city.charAt(0).toUpperCase() + listing.city.slice(1);

  return (
    <div className="container" style={{ padding: "32px 20px 60px" }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 16, fontSize: 13, color: "var(--muted)" }}>
        <Link to="/" style={{ color: "var(--brand)", textDecoration: "none" }}>Home</Link>
        {" / "}
        <Link to={`/city/${listing.city}`} style={{ color: "var(--brand)", textDecoration: "none" }}>{cityLabel}</Link>
        {" / "} {listing.title}
      </div>

      {/* Detail layout */}
      <div className="detail-layout" style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* Left — Details */}
        <div style={{ flex: "1 1 560px", minWidth: 0 }}>

          {/* Photo gallery */}
          {photos.length > 0 ? (
            <div>
              <img src={photos[activePhoto]} alt={listing.title} className="detail-photo" />
              {photos.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
                  {photos.map((url, i) => (
                    <img
                      key={i} src={url} alt=""
                      onClick={() => setActivePhoto(i)}
                      style={{
                        width: 70, height: 55, borderRadius: 8, objectFit: "cover", cursor: "pointer", flexShrink: 0,
                        border: i === activePhoto ? "2.5px solid var(--brand)" : "2.5px solid transparent"
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="detail-photo-placeholder">🏠</div>
          )}

          {/* Title + badges */}
          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h1 style={{ fontSize: 26, marginBottom: 8 }}>{listing.title}</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>
              📍 {listing.address}{listing.locality ? `, ${listing.locality}` : ""}, {cityLabel} {listing.pincode}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {listing.availableBeds > 0
                ? <span className="badge badge-green" style={{ fontSize: 13, padding: "5px 14px" }}>✓ {listing.availableBeds} beds available</span>
                : <span className="badge badge-red" style={{ fontSize: 13, padding: "5px 14px" }}>✗ Fully Occupied</span>}
              <span className="badge badge-blue" style={{ fontSize: 13, padding: "5px 14px" }}>
                {GENDER_LABEL[listing.genderPreference]}
              </span>
              <span className="badge badge-gray" style={{ fontSize: 13, padding: "5px 14px" }}>👁️ {listing.views} views</span>
            </div>
          </div>

          {/* Rent */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Monthly Rent</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: "var(--brand)" }}>
              ₹{listing.rentFrom.toLocaleString()}
              {listing.rentTo > listing.rentFrom && (
                <span style={{ fontSize: 20, color: "var(--muted)" }}> – ₹{listing.rentTo.toLocaleString()}</span>
              )}
            </p>
            <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 4 }}>Per bed/month · Excluding security deposit</p>
          </div>

          {/* Quick feature flags */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Quick Facts</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
              {[
                { icon: "🍽️", label: "Food Included", val: listing.foodIncluded },
                { icon: "❄️", label: "AC Available", val: listing.acAvailable },
                { icon: "📶", label: "WiFi", val: listing.wifiAvailable },
                { icon: "🚗", label: "Parking", val: listing.parkingAvailable },
                { icon: "👕", label: "Laundry", val: listing.laundryAvailable }
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                    borderRadius: 10, background: val ? "#f0fdf4" : "#f8fafc",
                    border: `1px solid ${val ? "#bbf7d0" : "#e2e8f0"}`
                  }}
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: val ? "#15803d" : "var(--muted)" }}>{label}</p>
                    <p style={{ fontSize: 11, color: val ? "#16a34a" : "var(--subtle)" }}>{val ? "Available" : "Not Available"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>About This PG</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: 14, whiteSpace: "pre-wrap" }}>{listing.description}</p>
            </div>
          )}

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Amenities</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {listing.amenities.map(a => (
                  <span key={a} className="amenity-tag">✓ {a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Enquiry sidebar */}
        <div style={{ width: "100%", maxWidth: 360, flexShrink: 0 }}>
          <div className="enquiry-card">
            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>Enquiry Sent!</h3>
                <p style={{ color: "var(--muted)", fontSize: 14 }}>
                  The PG owner will contact you shortly on <strong>{form.phone}</strong>.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", email: "", message: "" }); }}
                  className="btn btn-outline"
                  style={{ marginTop: 20, width: "100%" }}
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Interested? Send Enquiry</h3>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Free & instant. Owner will call you back.</p>

                {error && (
                  <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <label className="field">
                    <span>Your Name *</span>
                    <input
                      type="text" required placeholder="e.g. Riya Sharma"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Phone Number *</span>
                    <input
                      type="tel" required placeholder="e.g. 9876543210"
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Email (optional)</span>
                    <input
                      type="email" placeholder="e.g. riya@gmail.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Message (optional)</span>
                    <textarea
                      rows={3} placeholder="Move-in date, any questions…"
                      style={{ resize: "none" }}
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </label>

                  <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }} disabled={submitting}>
                    {submitting ? "Sending…" : "📩 Send Enquiry"}
                  </button>
                </form>

                {/* WhatsApp CTA */}
                {listing.whatsappEnabled && listing.contactPhone && (
                  <a
                    href={`https://wa.me/${listing.contactPhone.replace(/\D/g, "")}?text=Hi! I saw your PG "${listing.title}" on Stanzo and I'm interested.`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 10 }}
                  >
                    💬 Chat on WhatsApp
                  </a>
                )}

                {listing.contactPhone && (
                  <a
                    href={`tel:${listing.contactPhone}`}
                    className="btn btn-outline"
                    style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 10 }}
                  >
                    📞 Call Owner
                  </a>
                )}

                <p style={{ fontSize: 11, color: "var(--subtle)", textAlign: "center", marginTop: 14 }}>
                  🔒 Your details are kept private and only shared with the PG owner.
                </p>
              </>
            )}
          </div>

          {/* PG Summary card */}
          <div className="card" style={{ padding: 16, marginTop: 16, fontSize: 13 }}>
            <p style={{ fontWeight: 600, marginBottom: 10, color: "var(--text)" }}>PG Summary</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, color: "var(--muted)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Beds</span><span style={{ fontWeight: 600, color: "var(--text)" }}>{listing.totalBeds}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Available Beds</span>
                <span style={{ fontWeight: 600, color: listing.availableBeds > 0 ? "#16a34a" : "#dc2626" }}>
                  {listing.availableBeds}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Gender</span><span style={{ fontWeight: 600, color: "var(--text)" }}>{GENDER_LABEL[listing.genderPreference]}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>City</span><span style={{ fontWeight: 600, color: "var(--text)" }}>{cityLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGDetailPage;
