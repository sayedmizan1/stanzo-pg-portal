import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
}

const GENDER_BADGE: Record<string, string> = { any: "badge-blue", male: "badge-blue", female: "badge-pink" };
const GENDER_LABELS: Record<string, string> = { any: "Any", male: "👨 Boys", female: "👩 Girls" };

const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/listings", { params: { city } });
        setListings(res.data.listings || []);
        setTotal(res.data.total || 0);
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [city]);

  const cityLabel = city ? city.charAt(0).toUpperCase() + city.slice(1) : "";

  return (
    <div>
      {/* City hero banner */}
      <section style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)",
        padding: "48px 0 40px", color: "#fff"
      }}>
        <div className="container">
          <div style={{ marginBottom: 8, fontSize: 13 }}>
            <Link to="/" style={{ color: "rgba(255,255,255,.6)", textDecoration: "none" }}>← All Cities</Link>
          </div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>PG in {cityLabel}</h1>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 15 }}>
            {loading ? "Loading…" : `${total} verified PG listing${total !== 1 ? "s" : ""} in ${cityLabel}`}
          </p>
        </div>
      </section>

      {/* Listings */}
      <div className="container" style={{ padding: "36px 20px 60px" }}>
        {loading ? (
          <div className="pg-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 300 }} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ fontSize: 60 }}>🏚️</p>
            <h3 style={{ fontSize: 20, margin: "16px 0 8px" }}>No PGs in {cityLabel} yet</h3>
            <p style={{ color: "var(--muted)" }}>Be the first to list your PG here!</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>
              Browse All PGs
            </Link>
          </div>
        ) : (
          <div className="pg-grid">
            {listings.map(pg => (
              <Link key={pg._id} to={`/pg/${pg.slug}`} className="pg-card">
                {pg.photos?.length > 0 ? (
                  <img src={pg.photos[0]} alt={pg.title} className="pg-card-img" loading="lazy" />
                ) : (
                  <div className="pg-card-img-placeholder">🏠</div>
                )}
                <div className="pg-card-body">
                  <p className="pg-card-title">{pg.title}</p>
                  <p className="pg-card-loc">📍 {pg.locality ? `${pg.locality}, ` : ""}{cityLabel}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <span className="pg-card-rent">₹{pg.rentFrom.toLocaleString()}</span>
                      <span className="pg-card-rent"><span>/mo</span></span>
                    </div>
                    <span className={`badge ${GENDER_BADGE[pg.genderPreference]}`}>{GENDER_LABELS[pg.genderPreference]}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {pg.availableBeds > 0
                      ? <span className="badge badge-green">✓ {pg.availableBeds} beds</span>
                      : <span className="badge badge-red">✗ Full</span>}
                    {pg.foodIncluded && <span className="badge badge-amber">🍽️</span>}
                    {pg.acAvailable && <span className="badge badge-blue">❄️</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityPage;
