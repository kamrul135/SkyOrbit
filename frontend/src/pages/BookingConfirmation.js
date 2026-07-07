import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/* ── inject global CSS once ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Courier+Prime:wght@400;700&family=Lato:wght@300;400;700;900&display=swap');

.bc-page{
  min-height:100vh;
  background:var(--bg-color);
  background-image:var(--hero-radial);
  padding:36px 20px;
  font-family:'Lato',sans-serif;
  color:var(--text-color);
}
.bc-inner{ max-width:780px; margin:0 auto; }

/* SUCCESS HEADER */
.bc-suc{ text-align:center; margin-bottom:24px; }
.bc-suc-icon{
  width:60px; height:60px; border-radius:50%;
  background:var(--success-soft);
  border:1.5px solid var(--success-ring);
  display:inline-flex; align-items:center; justify-content:center;
  font-size:30px; color:var(--success-strong); margin-bottom:12px;
  box-shadow:0 0 26px var(--success-ring);
  animation:bc-pop .5s cubic-bezier(.175,.885,.32,1.275);
}
@keyframes bc-pop{ from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
.bc-suc h1{
  font-family:'IM Fell English',serif;
  font-size:30px; color:var(--success-strong); margin:0 0 6px; font-weight:600;
  letter-spacing:.5px;
  text-shadow:0 1px 0 var(--success-soft);
}
.bc-suc p{ color:var(--text-muted); font-size:13px; margin:0; }

/* ═══ TICKET CARD ═══ */
.bc-ticket{
  background:var(--bp-paper);
  border-radius:14px; overflow:hidden;
  margin-bottom:18px;
  border:1px solid var(--bp-gold-soft);
  box-shadow:0 18px 50px var(--shadow-color);
  animation:bc-up .5s ease both;
}
@keyframes bc-up{ from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

/* TOP DARK HEADER */
.bc-t-header{
  background:var(--bp-navy-grad);
  padding:12px 18px;
  display:flex; justify-content:space-between; align-items:center;
}
.bc-conf-lbl{
  font-size:9px; color:var(--bp-on-navy-muted); letter-spacing:2.5px;
  text-transform:uppercase; font-family:'Courier Prime',monospace; margin-bottom:3px;
}
.bc-conf-num{
  font-family:'Courier Prime',monospace;
  font-size:12px; font-weight:700; color:var(--bp-accent); letter-spacing:.5px;
}
.bc-qr-wrap{ display:flex; flex-direction:column; align-items:center; gap:3px; }
.bc-qr-grid{
  display:grid; grid-template-columns:repeat(7,1fr);
  width:48px; height:48px;
  background:var(--bp-paper); padding:3px;
  border-radius:3px; border:1px solid var(--bp-gold-soft);
}
.bc-qr-lbl{ font-size:7.5px; color:var(--bp-on-navy-muted); letter-spacing:1.5px; font-family:'Courier Prime',monospace; }

/* BODY: LEFT + RIGHT */
.bc-t-body{ display:flex; }

/* LEFT PASSENGER PANEL */
.bc-t-left{
  width:200px; flex-shrink:0;
  background:var(--bp-paper-strong);
  border-right:1px dashed var(--bp-gold-line);
  padding:16px 14px;
  display:flex; flex-direction:column; gap:12px;
}
.bc-compass{
  width:56px; height:56px; border-radius:50%;
  border:2px solid var(--bp-gold-soft);
  background:rgba(255,255,255,0.4);
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 2px;
}
.bc-pax-section{}
.bc-pax-lbl{
  font-size:8.5px; color:var(--bp-ink-soft); letter-spacing:2px;
  text-transform:uppercase; font-family:'Courier Prime',monospace;
  border-bottom:1px solid var(--bp-gold-soft);
  padding-bottom:4px; margin-bottom:8px;
}
.bc-pax-name{
  font-family:'IM Fell English',serif;
  font-size:15px; color:var(--bp-ink);
  text-transform:uppercase; line-height:1.2; margin-bottom:8px;
}
.bc-pf-lbl{ font-size:8px; color:var(--bp-ink-soft); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:1px; }
.bc-pf-val{ font-family:'Courier Prime',monospace; font-size:11px; color:var(--bp-ink); font-weight:700; margin-bottom:6px; }

.bc-seat-block{
  background:rgba(255,255,255,0.5);
  border:1px solid var(--bp-gold-soft);
  border-radius:8px; padding:10px 12px; text-align:center;
}
.bc-seat-num{
  font-family:'IM Fell English',serif;
  font-size:30px; color:var(--bp-navy); line-height:1;
}
.bc-seat-meta{
  display:flex; justify-content:center; gap:8px; margin-top:4px;
  font-size:9px; color:var(--bp-ink-soft); letter-spacing:1px;
  text-transform:uppercase; font-family:'Courier Prime',monospace;
}

/* RIGHT PANEL */
.bc-t-right{ flex:1; display:flex; flex-direction:column; }

/* ROUTE BAR */
.bc-route-bar{
  background:var(--bp-navy-grad);
  padding:14px 18px;
  display:flex; align-items:center;
}
.bc-r-airport{ text-align:center; min-width:64px; }
.bc-r-iata{
  font-family:'IM Fell English',serif;
  font-size:32px; color:var(--bp-on-navy); line-height:1; letter-spacing:2px;
}
.bc-r-city{ font-size:9px; color:var(--bp-on-navy-muted); text-transform:uppercase; letter-spacing:1px; margin-top:2px; }
.bc-r-mid{
  flex:1; display:flex; flex-direction:column;
  align-items:center; gap:3px; padding:0 10px;
}
.bc-r-line-wrap{ width:100%; display:flex; align-items:center; gap:3px; }
.bc-r-line{ flex:1; height:1px; background:var(--bp-gold-line); opacity:0.6; }
.bc-r-plane{ font-size:15px; color:var(--bp-on-navy-muted); }
.bc-r-via{
  font-size:8.5px; color:var(--bp-on-navy-muted);
  letter-spacing:1.5px; font-family:'Courier Prime',monospace;
}

/* LEGS */
.bc-legs{ padding:12px 16px; display:flex; flex-direction:column; gap:8px; flex:1; }
.bc-leg-card{
  background:var(--bp-leg-card);
  border:1px solid var(--bp-gold-soft);
  border-radius:8px; padding:10px 12px;
}
.bc-leg-top{
  display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;
}
.bc-leg-badge{
  font-size:8px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
  font-family:'Courier Prime',monospace; color:var(--bp-navy);
  background:var(--bp-gold-soft); border:1px solid var(--bp-gold-soft);
  border-radius:3px; padding:2px 6px;
}
body.dark .bc-leg-badge{ color:#0f1e35; }
.bc-leg-bid{ font-size:9px; color:var(--bp-gold); font-family:'Courier Prime',monospace; }
.bc-leg-fno{ font-size:14px; font-weight:700; color:var(--bp-ink); font-family:'Courier Prime',monospace; }
.bc-leg-al{ font-size:10px; color:var(--bp-ink-soft); margin-top:2px; }
.bc-gate-pill{
  font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
  background:var(--bp-navy); color:var(--bp-accent);
  border-radius:4px; padding:2px 7px;
  font-family:'Courier Prime',monospace; margin-left:auto; flex-shrink:0;
}

/* TEAR LINE */
.bc-tear{
  position:relative; height:18px; background:var(--bp-paper-strong);
  display:flex; align-items:center; justify-content:space-between; overflow:visible;
}
.bc-tear::before{
  content:''; position:absolute; left:12px; right:12px; top:50%; height:0;
  border-top:1.5px dashed var(--bp-gold-line);
}
.bc-tear-l, .bc-tear-r{
  width:20px; height:20px; border-radius:50%;
  background:var(--bp-perforation); flex-shrink:0; position:relative; z-index:1;
}
.bc-tear-l{ margin-left:-10px; }
.bc-tear-r{ margin-right:-10px; }

/* STUB */
.bc-stub{
  background:var(--bp-stub); padding:10px 16px;
  display:flex; align-items:center; gap:14px; flex-wrap:wrap;
}
.bc-sf-lbl{ font-size:7.5px; color:var(--bp-ink-soft); letter-spacing:2px; text-transform:uppercase; font-family:'Courier Prime',monospace; margin-bottom:1px; }
.bc-sf-val{ font-family:'Courier Prime',monospace; font-size:12px; font-weight:700; color:var(--bp-ink); }
.bc-sf-val.navy{ color:var(--bp-navy); font-size:15px; }
.bc-sf-val.green{ color:#2d7a3a; }
.bc-barcode{ display:flex; gap:2px; align-items:flex-end; height:36px; margin-left:auto; }
.bc-bar{ width:2px; border-radius:1px; background:var(--bp-ink); }

/* QR cell + Compass themed via tokens */
.bc-qr-cell{ background:transparent; border-radius:0; }
.bc-qr-cell-on{ background:var(--bp-ink); }
.bc-qr-cell-corner{ border-radius:1px; }
.bc-compass-svg .bc-compass-ring-1{ stroke:var(--bp-gold); stroke-width:0.8; opacity:0.5; }
.bc-compass-svg .bc-compass-ring-2{ stroke:var(--bp-gold); stroke-width:0.5; opacity:0.35; }
.bc-compass-svg .bc-compass-axis{ stroke:var(--bp-gold); stroke-width:0.5; opacity:0.4; }
.bc-compass-svg .bc-compass-diag{ stroke:var(--bp-gold); stroke-width:0.3; opacity:0.3; }
.bc-compass-svg .bc-compass-needle-n{ fill:var(--bp-navy); }
.bc-compass-svg .bc-compass-needle{ fill:var(--bp-gold); opacity:0.7; }
.bc-compass-svg .bc-compass-needle-soft{ fill:var(--bp-gold); opacity:0.5; }
.bc-compass-svg .bc-compass-center{ fill:var(--bp-navy); }
.bc-compass-svg .bc-compass-letter{ fill:var(--bp-navy); }
.bc-compass-svg .bc-compass-letter-soft{ fill:var(--bp-ink-soft); }

/* PAYMENT */
.bc-pay{
  background:var(--card-bg);
  border:1px solid var(--border-color);
  border-radius:12px; padding:18px 22px;
  display:flex; justify-content:space-between; align-items:center;
  flex-wrap:wrap; gap:14px; margin-bottom:16px;
  box-shadow:var(--card-shadow);
}
.bc-pay-lbl{ font-size:10px; color:var(--text-muted); letter-spacing:2px; text-transform:uppercase; margin-bottom:3px; }
.bc-pay-amt{ font-family:'IM Fell English',serif; font-size:30px; color:var(--success-strong); font-weight:600; letter-spacing:.3px; }
.bc-pay-sub{ font-size:11px; color:var(--text-subtle); margin-top:3px; }
.bc-pay-ok{
  font-size:13px; font-weight:700; color:var(--success-strong);
  background:var(--success-soft); border:1px solid var(--success-ring);
  border-radius:8px; padding:8px 16px;
  box-shadow:0 0 0 3px var(--success-soft);
}

/* BUTTONS */
.bc-btn-row{ display:flex; gap:14px; flex-wrap:wrap; margin-top:8px; }
.bc-btn-row button{
  flex:1; min-width:190px; padding:15px 22px; border-radius:14px;
  font-weight:600; font-size:0.95rem; letter-spacing:0.2px;
  border:none; cursor:pointer; position:relative; overflow:hidden;
  display:inline-flex; align-items:center; justify-content:center; gap:10px;
  transition: transform .25s cubic-bezier(.2,.8,.2,1),
              box-shadow .25s ease,
              filter .25s ease;
  box-shadow: 0 6px 14px -4px rgba(15,23,42,0.18),
              0 2px 4px -2px rgba(15,23,42,0.12),
              inset 0 1px 0 rgba(255,255,255,0.18);
}
.bc-btn-row button::after{
  content:""; position:absolute; inset:0;
  background:linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 70%);
  transform:translateX(-120%);
  transition: transform .7s ease;
}
.bc-btn-row button:hover{ transform: translateY(-3px); filter: brightness(1.08); }
.bc-btn-row button:hover::after{ transform: translateX(120%); }
.bc-btn-row button:active{ transform: translateY(-1px); box-shadow: 0 4px 10px -4px rgba(15,23,42,0.2); }
.bc-btn-row button:focus-visible{ outline:none; box-shadow: 0 0 0 4px var(--success-ring), 0 6px 14px -4px rgba(15,23,42,0.18); }
.bc-btn-pdf{ background:linear-gradient(135deg,#3b82f6 0%,#2563eb 50%,#1d4ed8 100%); color:#fff; }
.bc-btn-dash{ background:linear-gradient(135deg,#22c55e 0%,#16a34a 50%,#15803d 100%); color:#fff; }
.bc-btn-more{
  background:var(--surface-2) !important; color:var(--text-color);
  border:1px solid var(--border-color) !important;
  box-shadow: 0 4px 10px -6px rgba(15,23,42,0.18);
}
.bc-btn-more:hover{ background:var(--surface-3) !important; color:var(--primary-color); border-color:var(--primary-color) !important; }
`;

/* ── QR grid generator ── */
const QRGrid = ({ seed }) => {
  const cells = Array.from({ length: 49 }, (_, i) => {
    const r = Math.floor(i / 7), c = i % 7;
    const corner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2) || (r > 4 && c > 4);
    const rand = ((i * 31 + seed) % 4) === 0;
    return (
      <div key={i} className={`bc-qr-cell ${(corner || rand) ? 'bc-qr-cell-on' : ''}${corner ? ' bc-qr-cell-corner' : ''}`} />
    );
  });
  return <div className="bc-qr-grid">{cells}</div>;
};

/* ── Barcode generator ── */
const Barcode = ({ seed }) => (
  <div className="bc-barcode">
    {Array.from({ length: 36 }, (_, i) => {
      const h = 10 + ((seed * (i + 5) * 13) % 24);
      return <div key={i} className="bc-bar" style={{ height: `${h}px` }} />;
    })}
  </div>
);

/* ── Compass Rose SVG (themed) ── */
const CompassRose = () => (
  <svg width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="bc-compass-svg">
    <circle cx="20" cy="20" r="18" className="bc-compass-ring-1" />
    <circle cx="20" cy="20" r="12" className="bc-compass-ring-2" />
    <line x1="20" y1="2" x2="20" y2="38" className="bc-compass-axis" />
    <line x1="2" y1="20" x2="38" y2="20" className="bc-compass-axis" />
    <line x1="5.86" y1="5.86" x2="34.14" y2="34.14" className="bc-compass-diag" />
    <line x1="34.14" y1="5.86" x2="5.86" y2="34.14" className="bc-compass-diag" />
    <polygon points="20,3 22,18 20,22 18,18" className="bc-compass-needle-n" />
    <polygon points="20,37 22,22 20,18 18,22" className="bc-compass-needle" />
    <polygon points="3,20 18,18 22,20 18,22" className="bc-compass-needle" />
    <polygon points="37,20 22,18 18,20 22,22" className="bc-compass-needle-soft" />
    <circle cx="20" cy="20" r="2.5" className="bc-compass-center" />
    <text x="20" y="13" textAnchor="middle" fontSize="5" className="bc-compass-letter" fontFamily="Lato,sans-serif" fontWeight="700">N</text>
    <text x="20" y="30.5" textAnchor="middle" fontSize="4.5" className="bc-compass-letter-soft" fontFamily="Lato,sans-serif">S</text>
    <text x="8" y="21.5" textAnchor="middle" fontSize="4.5" className="bc-compass-letter-soft" fontFamily="Lato,sans-serif">W</text>
    <text x="33" y="21.5" textAnchor="middle" fontSize="4.5" className="bc-compass-letter-soft" fontFamily="Lato,sans-serif">E</text>
  </svg>
);

/* ── Single Boarding Pass ── */
const BoardingPass = ({ passenger, bookingEntries, seatNumber, pIdx, defaultClass }) => {
  const legs = bookingEntries || [];
  const firstLeg = legs[0] || {};
  const lastLeg  = legs[legs.length - 1] || {};

  const origin      = firstLeg.origin      || firstLeg.departure || 'JFK';
  const destination = lastLeg.destination  || lastLeg.arrival    || 'SIN';
  const viaCity     = legs.length > 1 ? (firstLeg.destination || firstLeg.arrival || 'DXB') : null;

  const fullName  = `${passenger.first_name || ''} ${passenger.last_name || ''}`.trim().toUpperCase();
  const passport  = passenger.passport_number || 'N/A';
  const nationality = passenger.nationality || 'N/A';
  const seat      = seatNumber || passenger.seat_number || 'N/A';
  
  // ডাইনামিক ক্লাস লজিক আপডেট
  const classType = (firstLeg.seat_class || defaultClass || (String(seat).startsWith('1') ? 'FIRST' : String(seat).startsWith('2') ? 'BUSINESS' : 'ECONOMY')).toUpperCase();
  const bookingRef = firstLeg.booking_id || (8874 + pIdx);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleString('en-US', {
          month: '2-digit', day: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        });
      }
      return d;
    } catch {
      return d;
    }
  };

  return (
    <div className="bc-ticket" style={{ animationDelay: `${pIdx * 0.1}s` }}>

      {/* TOP HEADER */}
      <div className="bc-t-header">
        <div>
          <div className="bc-conf-lbl">Confirmation</div>
          <div className="bc-conf-num">#BOOKING-CONFIRMED-{bookingRef}</div>
        </div>
        <div className="bc-qr-wrap">
          <QRGrid seed={bookingRef} />
          <div className="bc-qr-lbl">SCAN</div>
        </div>
      </div>

      {/* BODY */}
      <div className="bc-t-body">

        {/* LEFT: PASSENGER PANEL */}
        <div className="bc-t-left">
          <div className="bc-compass"><CompassRose /></div>

          <div className="bc-pax-section">
            <div className="bc-pax-lbl">Passenger Profile</div>
            <div className="bc-pax-name">{fullName}</div>
            <div className="bc-pf-lbl">Passport</div>
            <div className="bc-pf-val">{passport}</div>
            <div className="bc-pf-lbl">Nationality</div>
            <div className="bc-pf-val">{nationality}</div>
          </div>

          <div className="bc-seat-block">
            <div className="bc-seat-num">{seat}</div>
            <div className="bc-seat-meta">
              <span>{classType}</span>
              <span>·</span>
              <span>ADULT</span>
            </div>
          </div>
        </div>

        {/* RIGHT: ROUTE + LEGS */}
        <div className="bc-t-right">

          {/* ROUTE BAR */}
          <div className="bc-route-bar">
            <div className="bc-r-airport">
              <div className="bc-r-iata">{origin}</div>
              <div className="bc-r-city">({firstLeg.origin_city || origin})</div>
            </div>
            <div className="bc-r-mid">
              <div className="bc-r-line-wrap">
                <div className="bc-r-line" />
                <span className="bc-r-plane">✈</span>
                <div className="bc-r-line" />
              </div>
              {viaCity && <div className="bc-r-via">via {viaCity}</div>}
              {viaCity && (
                <div className="bc-r-line-wrap">
                  <div className="bc-r-line" />
                  <span className="bc-r-plane">✈</span>
                  <div className="bc-r-line" />
                </div>
              )}
            </div>
            <div className="bc-r-airport" style={{ textAlign: 'right' }}>
              <div className="bc-r-iata">{destination}</div>
              <div className="bc-r-city">({lastLeg.destination_city || destination})</div>
            </div>
          </div>

          {/* LEGS */}
          <div className="bc-legs">
            {legs.map((leg, lIdx) => (
              <div key={lIdx} className="bc-leg-card">
                <div className="bc-leg-top">
                  <span className="bc-leg-badge">
                    {legs.length > 1 ? `LEG ${lIdx + 1} (${leg.origin || ''}→${leg.destination || ''})` : 'FLIGHT'}
                  </span>
                  <span className="bc-leg-bid">#{leg.booking_id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div>
                    <div className="bc-leg-fno">
                      {leg.flight_no || leg.flight_number || 'N/A'}
                      <span style={{ fontSize: '10px', color: '#5a4a30', fontWeight: '400', marginLeft: '6px' }}>
                        {leg.airline || ''} {leg.aircraft || ''}
                      </span>
                    </div>
                    <div className="bc-leg-al">
                      Departs: {formatDate(leg.departure_time)} &nbsp;·&nbsp; Arrives: {formatDate(leg.arrival_time)}
                    </div>
                  </div>
                  {leg.gate && <div className="bc-gate-pill">Gate {leg.gate}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* TEAR LINE */}
          <div className="bc-tear">
            <div className="bc-tear-l" />
            <div className="bc-tear-r" />
          </div>

          {/* STUB */}
          <div className="bc-stub">
            <div>
              <div className="bc-sf-lbl">Seat</div>
              <div className="bc-sf-val navy">{seat}</div>
            </div>
            <div>
              <div className="bc-sf-lbl">Class</div>
              <div className="bc-sf-val">{classType}</div>
            </div>
            <div>
              <div className="bc-sf-lbl">Type</div>
              <div className="bc-sf-val">ADULT</div>
            </div>
            <div>
              <div className="bc-sf-lbl">Status</div>
              <div className="bc-sf-val green">Confirmed</div>
            </div>
            <Barcode seed={bookingRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
    MAIN COMPONENT
   ══════════════════════════════════════ */
const BookingConfirmation = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const ticketRef = useRef(null);

  // আপনার নতুন রিসিভ করা ডাইনামিক ডেটা (flightClass সহ)
  const { bookingIds, passengersData, selectedSeats, totalPrice, flightClass } = location.state || {};

  /* inject CSS */
  useEffect(() => {
    if (document.getElementById('bc-style')) return;
    const tag = document.createElement('style');
    tag.id = 'bc-style';
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => { const el = document.getElementById('bc-style'); if (el) el.remove(); };
  }, []);

  /* no data guard */
  if (!bookingIds || bookingIds.length === 0 || !passengersData) {
    return (
      <div className="bc-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h2 style={{ color: 'var(--text-color)', margin: 0 }}>No booking data found</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Please complete the booking process first.</p>
        <button onClick={() => navigate('/')} style={{ padding: '12px 28px', background: 'linear-gradient(135deg,var(--primary-color),var(--primary-hover))', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
          Go Home
        </button>
      </div>
    );
  }

  /* PDF download */
  const downloadPDF = () => {
    const input = ticketRef.current;
    html2canvas(input, { scale: 2, backgroundColor: '#0b111e' }).then((canvas) => {
      const imgData   = canvas.toDataURL('image/png');
      const pdf       = new jsPDF('p', 'mm', 'a4');
      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Booking_Confirmation.pdf');
    });
  };

  /* group booking entries per passenger */
  const getPassengerBookings = (pIdx) =>
    bookingIds.filter((_, bIdx) =>
      bookingIds.length === passengersData.length
        ? bIdx === pIdx
        : Math.floor(bIdx / 2) === pIdx
    );

  const now    = new Date();
  const paidOn = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const paidAt = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bc-page">
      <div className="bc-inner">

        {/* SUCCESS HEADER */}
        <div className="bc-suc">
          <div><div className="bc-suc-icon">✓</div></div>
          <h1>Booking Confirmed!</h1>
          <p>Your tickets have been booked successfully. Check your email for confirmation.</p>
        </div>

        {/* BOARDING PASSES */}
        <div ref={ticketRef} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {passengersData.map((passenger, pIdx) => (
            <BoardingPass
              key={pIdx}
              passenger={passenger}
              bookingEntries={getPassengerBookings(pIdx)}
              seatNumber={selectedSeats?.[pIdx]}
              pIdx={pIdx}
              defaultClass={flightClass}
            />
          ))}
        </div>

        {/* PAYMENT SUMMARY */}
        <div className="bc-pay" style={{ marginTop: '18px' }}>
          <div>
            <div className="bc-pay-lbl">Total Amount Paid</div>
            <div className="bc-pay-amt">USD ${totalPrice?.toFixed(2) || '0.00'}</div>
            <div className="bc-pay-sub">Paid on {paidOn} at {paidAt}</div>
          </div>
          <div className="bc-pay-ok">✓ Payment Successful</div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="bc-btn-row">
          <button className="bc-btn-pdf" onClick={downloadPDF}>
            📥 Download Tickets (PDF)
          </button>
          <button className="bc-btn-dash" onClick={() => navigate('/dashboard')}>
            📋 Go to Dashboard
          </button>
          
          {/* আপনার নতুন ম্যাপ লজিকসহ আপডেট হওয়া বাটন */}
          <button className="bc-btn-more" onClick={() => {
  navigate('/checkin', {
    state: {
      bookingIds: bookingIds.map(b => ({
        booking_id:  b.booking_id,
        flight_id:   b.flight_id ? Number(b.flight_id) : null,
        flight_no:   b.flight_no   || b.flight_number || '',
        airline:     b.airline     || '',
        origin:      b.origin      || '',
        destination: b.destination || '',
        seat_class:  b.seat_class  || flightClass || 'Economy',
        seat:        b.seat        || selectedSeats?.[0] || '',
      })),
      passengersData,
      selectedSeats,
      totalPrice,
    }
  });
}}>
  ✈ Proceed to Check-in
</button>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmation;