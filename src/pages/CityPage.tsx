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

const GENDER_TAGS: Record<string, string> = { any: "tag-blue", male: "tag-blue", female: "tag-purple" };
const GENDER_LABELS: Record<string, string> = { any: "Co-living", male: "Boys PG", female: "Girls PG" };

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z"/>
    <path d="M9 22V12h6v10"/>
  </svg>
);

const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get("/listings", { params: { city } })
      .then(r => { setListings(r.data.listings || []); setTotal(r.data.total || 0); })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [city]);

  const cityLabel = city ? city.charAt(0).toUpperCase() + city.slice(1) : "";

  return (
    <>
      {/* City Hero */}
      <section className="city-hero">
        <div className="container">
          <Link to="/" className="city-hero-back"><IconBack /> Back to all cities</Link>
          <h1>PG accommodation in {cityLabel}</h1>
          <p>{loading ? "Loading..." : `${total} verified PG listing${total !== 1 ? "s" : ""} in ${cityLabel}`}</p>
        </div>
      </section>

      {/* Listings */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div className="pg-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 300 }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><IconHome /></div>
              <div className="empty-title">No PGs listed in {cityLabel} yet</div>
              <div className="empty-text">Check back soon or browse other cities.</div>
              <Link to="/" className="empty-cta">Browse all PGs</Link>
            </div>
          ) : (
            <div className="pg-grid">
              {listings.map(pg => {
                const cl = pg.city.charAt(0).toUpperCase() + pg.city.slice(1);
                return (
                  <Link key={pg._id} to={`/pg/${pg.slug}`} className="pg-card">
                    {pg.photos?.length > 0 ? (
                      <img src={pg.photos[0]} alt={pg.title} className="pg-card-img" loading="lazy" />
                    ) : (
                      <div className="pg-card-img-placeholder"><IconHome /></div>
                    )}
                    <div className="pg-card-body">
                      <div className="pg-card-top">
                        <h3 className="pg-card-title">{pg.title}</h3>
                      </div>
                      <div className="pg-card-loc">
                        <IconPin />
                        {pg.locality ? `${pg.locality}, ` : ""}{cl}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
                        <span className="pg-card-price">₹{pg.rentFrom.toLocaleString()}</span>
                        <span className="pg-card-price-unit">/month</span>
                      </div>
                      <div className="pg-card-tags">
                        <span className={`tag ${GENDER_TAGS[pg.genderPreference]}`}>
                          {GENDER_LABELS[pg.genderPreference]}
                        </span>
                        {pg.availableBeds > 0 ? (
                          <span className="tag tag-green">
                            <span className="avail-dot green" style={{ marginRight: 4 }} />
                            {pg.availableBeds} beds available
                          </span>
                        ) : (
                          <span className="tag tag-red">Fully occupied</span>
                        )}
                        {pg.foodIncluded && <span className="tag tag-amber">Meals included</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CityPage;
