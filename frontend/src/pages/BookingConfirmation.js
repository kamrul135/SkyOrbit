import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/* ── inject global CSS once ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Courier+Prime:wght@400;700&family=Lato:wght@300;400;700;900&display=swap');

.bc-page{
  min-height:100vh;
  background:#0b111e;
  background-image:radial-gradient(ellipse at 20% 50%,rgba(30,58,95,0.28),transparent 60%);
  padding:36px 20px;
  font-family:'Lato',sans-serif;
}
.bc-inner{ max-width:780px; margin:0 auto; }

/* SUCCESS HEADER */
.bc-suc{ text-align:center; margin-bottom:24px; }
.bc-suc-icon{
  width:60px; height:60px; border-radius:50%;
  background:rgba(222,255,154,0.1);
  border:1.5px solid rgba(222,255,154,0.35);
  display:inline-flex; align-items:center; justify-content:center;
  font-size:28px; color:#deff9a; margin-bottom:12px;
  box-shadow:0 0 24px rgba(222,255,154,0.1);
  animation:bc-pop .5s cubic-bezier(.175,.885,.32,1.275);
}
@keyframes bc-pop{ from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
.bc-suc h1{
  font-family:'IM Fell English',serif;
  font-size:26px; color:#deff9a; margin:0 0 6px; font-weight:400;
}
.bc-suc p{ color:#64748b; font-size:13px; margin:0; }

/* ═══ TICKET CARD ═══ */
.bc-ticket{
  background:#f0e6cc;
  border-radius:14px; overflow:hidden;
  margin-bottom:18px;
  border:1px solid rgba(184,146,42,0.3);
  box-shadow:0 18px 50px rgba(0,0,0,0.5);
  animation:bc-up .5s ease both;
}
@keyframes bc-up{ from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

/* TOP DARK HEADER */
.bc-t-header{
  background:linear-gradient(135deg,#1a2d4a,#0f1e35);
  padding:12px 18px;
  display:flex; justify-content:space-between; align-items:center;
}
.bc-conf-lbl{
  font-size:9px; color:#64748b; letter-spacing:2.5px;
  text-transform:uppercase; font-family:'Courier Prime',monospace; margin-bottom:3px;
}
.bc-conf-num{
  font-family:'Courier Prime',monospace;
  font-size:12px; font-weight:700; color:#deff9a; letter-spacing:.5px;
}
.bc-qr-wrap{ display:flex; flex-direction:column; align-items:center; gap:3px; }
.bc-qr-grid{
  display:grid; grid-template-columns:repeat(7,1fr);
  width:48px; height:48px;
  background:#f0e6cc; padding:3px;
  border-radius:3px; border:1px solid rgba(184,146,42,0.3);
}
.bc-qr-lbl{ font-size:7.5px; color:#64748b; letter-spacing:1.5px; font-family:'Courier Prime',monospace; }

/* BODY: LEFT + RIGHT */
.bc-t-body{ display:flex; }

/* LEFT PASSENGER PANEL */
.bc-t-left{
  width:200px; flex-shrink:0;
  background:#e8d9b8;
  border-right:1px dashed rgba(184,146,42,0.45);
  padding:16px 14px;
  display:flex; flex-direction:column; gap:12px;
}
.bc-compass{
  width:56px; height:56px; border-radius:50%;
  border:2px solid rgba(184,146,42,0.5);
  background:rgba(255,255,255,0.4);
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 2px;
}
.bc-pax-section{}
.bc-pax-lbl{
  font-size:8.5px; color:#5a4a30; letter-spacing:2px;
  text-transform:uppercase; font-family:'Courier Prime',monospace;
  border-bottom:1px solid rgba(184,146,42,0.3);
  padding-bottom:4px; margin-bottom:8px;
}
.bc-pax-name{
  font-family:'IM Fell English',serif;
  font-size:15px; color:#2a1f0e;
  text-transform:uppercase; line-height:1.2; margin-bottom:8px;
}
.bc-pf-lbl{ font-size:8px; color:#5a4a30; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:1px; }
.bc-pf-val{ font-family:'Courier Prime',monospace; font-size:11px; color:#2a1f0e; font-weight:700; margin-bottom:6px; }

.bc-seat-block{
  background:rgba(255,255,255,0.5);
  border:1px solid rgba(184,146,42,0.3);
  border-radius:8px; padding:10px 12px; text-align:center;
}
.bc-seat-num{
  font-family:'IM Fell English',serif;
  font-size:30px; color:#0f1e35; line-height:1;
}
.bc-seat-meta{
  display:flex; justify-content:center; gap:8px; margin-top:4px;
  font-size:9px; color:#5a4a30; letter-spacing:1px;
  text-transform:uppercase; font-family:'Courier Prime',monospace;
}

/* RIGHT PANEL */
.bc-t-right{ flex:1; display:flex; flex-direction:column; }

/* ROUTE BAR */
.bc-route-bar{
  background:linear-gradient(135deg,#1e3a5f,#0f1e35);
  padding:14px 18px;
  display:flex; align-items:center;
}
.bc-r-airport{ text-align:center; min-width:64px; }
.bc-r-iata{
  font-family:'IM Fell English',serif;
  font-size:32px; color:#fff; line-height:1; letter-spacing:2px;
}
.bc-r-city{ font-size:9px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-top:2px; }
.bc-r-mid{
  flex:1; display:flex; flex-direction:column;
  align-items:center; gap:3px; padding:0 10px;
}
.bc-r-line-wrap{ width:100%; display:flex; align-items:center; gap:3px; }
.bc-r-line{ flex:1; height:1px; background:rgba(201,184,150,0.35); }
.bc-r-plane{ font-size:15px; color:#94a3b8; }
.bc-r-via{
  font-size:8.5px; color:#64748b;
  letter-spacing:1.5px; font-family:'Courier Prime',monospace;
}

/* LEGS */
.bc-legs{ padding:12px 16px; display:flex; flex-direction:column; gap:8px; flex:1; }
.bc-leg-card{
  background:rgba(255,255,255,0.5);
  border:1px solid rgba(184,146,42,0.28);
  border-radius:8px; padding:10px 12px;
}
.bc-leg-top{
  display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;
}
.bc-leg-badge{
  font-size:8px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
  font-family:'Courier Prime',monospace; color:#1a2d4a;
  background:rgba(184,146,42,0.15); border:1px solid rgba(184,146,42,0.3);
  border-radius:3px; padding:2px 6px;
}
.bc-leg-bid{ font-size:9px; color:#b8922a; font-family:'Courier Prime',monospace; }
.bc-leg-fno{ font-size:14px; font-weight:700; color:#2a1f0e; font-family:'Courier Prime',monospace; }
.bc-leg-al{ font-size:10px; color:#5a4a30; margin-top:2px; }
.bc-gate-pill{
  font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
  background:#0f1e35; color:#deff9a;
  border-radius:4px; padding:2px 7px;
  font-family:'Courier Prime',monospace; margin-left:auto; flex-shrink:0;
}

/* TEAR LINE */
.bc-tear{
  position:relative; height:18px; background:#e8d9b8;
  display:flex; align-items:center; justify-content:space-between; overflow:visible;
}
.bc-tear::before{
  content:''; position:absolute; left:12px; right:12px; top:50%; height:0;
  border-top:1.5px dashed rgba(184,146,42,0.4);
}
.bc-tear-l, .bc-tear-r{
  width:20px; height:20px; border-radius:50%;
  background:#0b111e; flex-shrink:0; position:relative; z-index:1;
}
.bc-tear-l{ margin-left:-10px; }
.bc-tear-r{ margin-right:-10px; }

/* STUB */
.bc-stub{
  background:#ddd0a8; padding:10px 16px;
  display:flex; align-items:center; gap:14px; flex-wrap:wrap;
}
.bc-sf-lbl{ font-size:7.5px; color:#5a4a30; letter-spacing:2px; text-transform:uppercase; font-family:'Courier Prime',monospace; margin-bottom:1px; }
.bc-sf-val{ font-family:'Courier Prime',monospace; font-size:12px; font-weight:700; color:#2a1f0e; }
.bc-sf-val.navy{ color:#0f1e35; font-size:15px; }
.bc-sf-val.green{ color:#2d7a3a; }
.bc-barcode{ display:flex; gap:2px; align-items:flex-end; height:36px; margin-left:auto; }
.bc-bar{ width:2px; border-radius:1px; background:#2a1f0e; }

/* PAYMENT */
.bc-pay{
  background:#111827;
  border:1px solid rgba(201,184,150,0.18);
  border-radius:12px; padding:18px 22px;
  display:flex; justify-content:space-between; align-items:center;
  flex-wrap:wrap; gap:14px; margin-bottom:16px;
}
.bc-pay-lbl{ font-size:10px; color:#64748b; letter-spacing:2px; text-transform:uppercase; margin-bottom:3px; }
.bc-pay-amt{ font-family:'IM Fell English',serif; font-size:26px; color:#deff9a; font-weight:400; }
.bc-pay-sub{ font-size:11px; color:#475569; margin-top:3px; }
.bc-pay-ok{
  font-size:13px; font-weight:700; color:#22c55e;
  background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.35);
  border-radius:8px; padding:8px 16px;
}

/* BUTTONS */
.bc-btn-row{ display:flex; gap:10px; flex-wrap:wrap; }
.bc-btn-row button{
  flex:1; min-width:150px; padding:13px 10px;
  border-radius:9px; font-size:13px; font-weight:700;
  cursor:pointer; font-family:'Lato',sans-serif; border:none;
  display:flex; align-items:center; justify-content:center; gap:6px;
}
.bc-btn-pdf{ background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; }
.bc-btn-dash{ background:linear-gradient(135deg,#16a34a,#15803d); color:#fff; }
.bc-btn-more{ background:transparent !important; color:#64748b; border:1px solid #1e293b !important; }
`;

/* ── QR grid generator ── */
const QRGrid = ({ seed }) => {
  const cells = Array.from({ length: 49 }, (_, i) => {
    const r = Math.floor(i / 7), c = i % 7;
    const corner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2) || (r > 4 && c > 4);
    const rand = ((i * 31 + seed) % 4) === 0;
    return (
      <div key={i} style={{
        background: (corner || rand) ? '#2a1f0e' : 'transparent',
        borderRadius: corner ? '1px' : '0',
      }} />
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

/* ── Compass Rose SVG ── */
const CompassRose = () => (
  <svg width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" stroke="#b8922a" strokeWidth="0.8" opacity="0.5"/>
    <circle cx="20" cy="20" r="12" stroke="#b8922a" strokeWidth="0.5" opacity="0.35"/>
    <line x1="20" y1="2" x2="20" y2="38" stroke="#b8922a" strokeWidth="0.5" opacity="0.4"/>
    <line x1="2" y1="20" x2="38" y2="20" stroke="#b8922a" strokeWidth="0.5" opacity="0.4"/>
    <line x1="5.86" y1="5.86" x2="34.14" y2="34.14" stroke="#b8922a" strokeWidth="0.3" opacity="0.3"/>
    <line x1="34.14" y1="5.86" x2="5.86" y2="34.14" stroke="#b8922a" strokeWidth="0.3" opacity="0.3"/>
    <polygon points="20,3 22,18 20,22 18,18" fill="#1a2d4a"/>
    <polygon points="20,37 22,22 20,18 18,22" fill="#b8922a" opacity="0.7"/>
    <polygon points="3,20 18,18 22,20 18,22" fill="#b8922a" opacity="0.7"/>
    <polygon points="37,20 22,18 18,20 22,22" fill="#b8922a" opacity="0.5"/>
    <circle cx="20" cy="20" r="2.5" fill="#1a2d4a"/>
    <text x="20" y="13" textAnchor="middle" fontSize="5" fill="#1a2d4a" fontFamily="Lato,sans-serif" fontWeight="700">N</text>
    <text x="20" y="30.5" textAnchor="middle" fontSize="4.5" fill="#5a4a30" fontFamily="Lato,sans-serif">S</text>
    <text x="8" y="21.5" textAnchor="middle" fontSize="4.5" fill="#5a4a30" fontFamily="Lato,sans-serif">W</text>
    <text x="33" y="21.5" textAnchor="middle" fontSize="4.5" fill="#5a4a30" fontFamily="Lato,sans-serif">E</text>
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
      <div style={{ minHeight: '100vh', background: '#0b111e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h2 style={{ color: '#fff', margin: 0 }}>No booking data found</h2>
        <p style={{ color: '#94a3b8', margin: 0 }}>Please complete the booking process first.</p>
        <button onClick={() => navigate('/')} style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
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
          <button className="bc-btn-more" onClick={() => navigate('/checkin', {
            state: {
              bookingIds: bookingIds.map(b => ({
                ...b,
                seat_class: b.seat_class || flightClass || 'Economy',
              })),
              passengersData,
              selectedSeats,
              totalPrice,
            }
          })}>
            ✈ Proceed to Check-in
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmation;