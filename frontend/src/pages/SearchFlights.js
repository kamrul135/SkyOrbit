import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../components/axiosInstance";
import axios from 'axios'; 
import './SearchFlights.css';
import {
    FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt,
    FaUser, FaExchangeAlt, FaSearch, FaClock, FaTimes,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import TravelProsSection from '../components/TravelProsSection';
import '../components/TravelProsSection.css';

// নিচে আপনার বাকি SearchFlights কম্পোনেন্টের কোড বসবে...

// ডুপ্লিকেট রিমুভ করে ইউনিক সিটি লিস্ট রাখা হয়েছে
const CITIES = [
    { code: 'JFK', label: 'New York (JFK)', city: 'New York'   },
    { code: 'LHR', label: 'London (LHR)',   city: 'London'     },
    { code: 'CDG', label: 'Paris (CDG)',    city: 'Paris'      },
    { code: 'DXB', label: 'Dubai (DXB)',    city: 'Dubai'      },
    { code: 'PEK', label: 'Beijing (PEK)',  city: 'Beijing'    },
    { code: 'HND', label: 'Tokyo (HND)',    city: 'Tokyo'      },
    { code: 'SYD', label: 'Sydney (SYD)',   city: 'Sydney'     },
    { code: 'SIN', label: 'Singapore (SIN)',city: 'Singapore'  },
    { code: 'FRA', label: 'Frankfurt (FRA)',city: 'Frankfurt'  },
    { code: 'DAC', label: 'Dhaka (DAC)',    city: 'Dhaka'      },
    { code: 'PVG', label: 'Shanghai (PVG)', city: 'Shanghai'   },
    { code: 'BKK', label: 'Bangkok (BKK)',  city: 'Bangkok'    },
    { code: 'IST', label: 'Istanbul (IST)', city: 'Istanbul'   },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WDAYS  = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const getCityName = (code) => CITIES.find(c => c.code === code)?.city || code;
const toDateStr   = (d)    => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const toMonthStr  = (d)    => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;

const getSearchKey = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return `recentSearches_${user?.id || user?.user_id || 'guest'}`;
};

const buildCalendarDays = (year, month) => {
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
};

const SearchFlights = () => {
    const navigate = useNavigate();

    const [tripType,    setTripType]    = useState('oneWay');
    const [origin,      setOrigin]      = useState('');
    const [dest,        setDest]        = useState('');
    const [startDate,   setStartDate]   = useState('');
    const [endDate,     setEndDate]     = useState('');
    const [adults,      setAdults]      = useState(1);
    const [children,    setChildren]    = useState(0);
    const [infants,     setInfants]     = useState(0);
    const [flightClass, setFlightClass] = useState('Economy');
    const passengers = adults + children;

    const [recentSearches,  setRecentSearches]  = useState([]);
    const [showPaxDropdown, setShowPaxDropdown] = useState(false);
    const [showCalendar,    setShowCalendar]    = useState(false);
    const [calTarget,       setCalTarget]       = useState('start');
    const [calMonth,        setCalMonth]        = useState(new Date());
    const [availableDates,  setAvailableDates]  = useState({});
    const [calLoading,      setCalLoading]      = useState(false);

    // AI চ্যাটবট ওপেন করার জন্য স্টেট
    const [showChatbot,     setShowChatbot]     = useState(false);

    const calRef = useRef(null);
    const paxRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (calRef.current && !calRef.current.contains(e.target)) setShowCalendar(false);
            if (paxRef.current && !paxRef.current.contains(e.target)) setShowPaxDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(getSearchKey()) || '[]');
        setRecentSearches(saved);
    }, []);

    useEffect(() => {
        if (!origin || !dest) { setAvailableDates({}); return; }
        setCalLoading(true);
        // Standard axios use
        axiosInstance.get(`http://localhost:5000/available-dates?origin=${origin}&dest=${dest}&month=${toMonthStr(calMonth)}`)
            .then(res => setAvailableDates(res.data || {}))
            .catch(() => setAvailableDates({}))
            .finally(() => setCalLoading(false));
    }, [origin, dest, calMonth]);

    const openCalendar = (target) => {
        setCalTarget(target);
        setShowCalendar(true);
        setShowPaxDropdown(false);
    };

    const handleDayClick = (day) => {
        if (!day) return;
        const ds    = toDateStr(day);
        const today = new Date(); today.setHours(0,0,0,0);
        if (day < today) return;
        const hasFlts = availableDates[ds];
        if (origin && dest && !hasFlts) return;
        if (calTarget === 'start') {
            setStartDate(ds);
            if (tripType === 'roundTrip') { setCalTarget('end'); }
            else { setShowCalendar(false); }
        } else {
            if (startDate && ds < startDate) return;
            setEndDate(ds);
            setShowCalendar(false);
        }
    };

    const saveRecentSearch = (data) => {
        const key      = getSearchKey();
        const saved    = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = saved.filter(s => !(s.origin===data.origin && s.dest===data.dest && s.date===data.date));
        const updated  = [data, ...filtered].slice(0, 4);
        localStorage.setItem(key, JSON.stringify(updated));
        setRecentSearches(updated);
    };

    const removeRecent = (index, e) => {
        e.stopPropagation();
        const key     = getSearchKey();
        const saved   = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = saved.filter((_, i) => i !== index);
        localStorage.setItem(key, JSON.stringify(updated));
        setRecentSearches(updated);
    };

    const handleSwap = () => { const t = origin; setOrigin(dest); setDest(t); };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!origin || !dest || !startDate) { alert('Please fill in all required fields.'); return; }
        setShowPaxDropdown(false);
        setShowCalendar(false);
        saveRecentSearch({
            origin, dest, date: startDate, passengers, adults, children, infants,
            class: flightClass, trip_type: tripType,
            label: `${getCityName(origin)} → ${getCityName(dest)}`,
            ...(tripType === 'roundTrip' && endDate ? { end_date: endDate } : {})
        });
        const params = new URLSearchParams({
            origin, dest, start_date: startDate,
            passengers, class: flightClass, trip_type: tripType,
            ...(tripType === 'roundTrip' && endDate ? { end_date: endDate } : {})
        });
        navigate(`/results?${params.toString()}`);
    };

    const handleRecentClick = (s) => {
        const params = new URLSearchParams({
            origin: s.origin, dest: s.dest, start_date: s.date,
            passengers: s.passengers, class: s.class,
            trip_type: s.trip_type || 'oneWay',
            ...(s.end_date ? { end_date: s.end_date } : {})
        });
        navigate(`/results?${params.toString()}`);
    };

    // AI কার্ডে ক্লিক হ্যান্ডলার ফাংশন
    const handlePlanWithAIClick = () => {
        setShowChatbot(true); 
        // আপনি চাইলে এখানে চ্যাটবট পেজে নেভিগেটও করতে পারেন, যেমন: navigate('/ai-planner');
    };

    const today   = new Date(); today.setHours(0,0,0,0);
    const calDays = buildCalendarDays(calMonth.getFullYear(), calMonth.getMonth());

    const CalendarPanel = () => (
        <div className="flight-calendar" ref={calRef}>
            <div className="cal-header">
                <button type="button" className="cal-nav-btn"
                    onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth()-1))}>
                    <FaChevronLeft />
                </button>
                <div className="cal-month-label">
                    {MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}
                    {calLoading && <span className="cal-spinner" />}
                </div>
                <button type="button" className="cal-nav-btn"
                    onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth()+1))}>
                    <FaChevronRight />
                </button>
            </div>

            {tripType === 'roundTrip' && (
                <div className="cal-selecting-label">
                    {calTarget === 'start' ? '✈ Select departure date' : '↩ Select return date'}
                </div>
            )}
            {(!origin || !dest) && (
                <div className="cal-hint">💡 Select origin & destination first to see available flight dates</div>
            )}

            <div className="cal-day-headers">
                {WDAYS.map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="cal-grid">
                {calDays.map((day, idx) => {
                    if (!day) return <div key={idx} className="cal-cell cal-empty" />;
                    const ds         = toDateStr(day);
                    const isPast     = day < today;
                    const hasFlights = availableDates[ds];
                    const isStart    = startDate === ds;
                    const isEnd      = endDate === ds;
                    const isInRange  = tripType==='roundTrip' && startDate && endDate && ds>startDate && ds<endDate;
                    const noFlight   = (origin && dest) && !hasFlights && !isPast;
                    const blocked    = isPast || noFlight;

                    let cls = 'cal-cell';
                    if (isPast)              cls += ' cal-past';
                    else if (isStart||isEnd) cls += ' cal-selected';
                    else if (isInRange)      cls += ' cal-in-range';
                    else if (hasFlights)     cls += ' cal-available';
                    else if (noFlight)       cls += ' cal-no-flight';

                    return (
                        <div key={idx} className={cls} onClick={() => !blocked && handleDayClick(day)}>
                            <span className="cal-day-num">{day.getDate()}</span>
                            {hasFlights && !isPast && <span className="cal-dot" />}
                        </div>
                    );
                })}
            </div>
            <div className="cal-legend">
                <span className="cal-legend-item"><span className="cal-legend-dot available"/>Available</span>
                <span className="cal-legend-item"><span className="cal-legend-dot none"/>No flights</span>
                <span className="cal-legend-item"><span className="cal-legend-dot selected"/>Selected</span>
            </div>
        </div>
    );

    return (
        <div className="search-layout-container">

            {/* Hero */}
            <div className="sf-hero-section"
                style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/airport.jpeg)` }}>
                <div className="sf-hero-overlay" />
                <div className="sf-hero-content">
                    <p className="sf-hero-tagline">✈ Discover the World</p>
                    <h1 className="sf-hero-title">Where do you want<br /><span>to fly next?</span></h1>
                    <p className="sf-hero-subtitle">Search hundreds of flights and find the best deals for your journey.</p>
                    <div className="hero-stats">
                        <div className="hero-stat"><strong>500+</strong><span>Routes</span></div>
                        <div className="hero-stat"><strong>50+</strong><span>Airlines</span></div>
                        <div className="hero-stat"><strong>9</strong><span>Cities</span></div>
                        <div className="hero-stat"><strong>24/7</strong><span>Support</span></div>
                    </div>
                </div>
            </div>

            {/* Search Panel */}
            <div className="search-hero-panel">
                <div className="trip-type-tabs">
                    <button type="button" className={`trip-tab-btn ${tripType==='oneWay'?'active':''}`} onClick={()=>setTripType('oneWay')}>✈ One Way</button>
                    <button type="button" className={`trip-tab-btn ${tripType==='roundTrip'?'active':''}`} onClick={()=>setTripType('roundTrip')}>🔄 Round Trip</button>
                </div>
                <form onSubmit={handleSearch} className="horizontal-search-form">
                    <div className={`form-fields-grid ${tripType==='roundTrip'?'round-trip':''}`}>
                        <div className="custom-input-group">
                            <FaPlaneDeparture className="field-icon" />
                            <div className="input-wrapper">
                                <label>From</label>
                                <select value={origin} onChange={e=>setOrigin(e.target.value)} required>
                                    <option value="" disabled hidden>Select Origin</option>
                                    {CITIES.map(c=><option key={c.code} value={c.code}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <button type="button" className="route-swap-btn" onClick={handleSwap}><FaExchangeAlt /></button>
                        <div className="custom-input-group">
                            <FaPlaneArrival className="field-icon" />
                            <div className="input-wrapper">
                                <label>To</label>
                                <select value={dest} onChange={e=>setDest(e.target.value)} required>
                                    <option value="" disabled hidden>Select Destination</option>
                                    {CITIES.map(c=><option key={c.code} value={c.code}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="custom-input-group cal-trigger-group">
                            <FaCalendarAlt className="field-icon" />
                            <div className="input-wrapper">
                                <label>Departure</label>
                                <button type="button" className="cal-trigger-btn" onClick={()=>openCalendar('start')}>
                                    {startDate ? new Date(startDate+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : <span className="cal-placeholder">Select date</span>}
                                </button>
                            </div>
                            {showCalendar && calTarget==='start' && <CalendarPanel />}
                        </div>
                        {tripType==='roundTrip' && (
                            <div className="custom-input-group cal-trigger-group animated-field">
                                <FaCalendarAlt className="field-icon" />
                                <div className="input-wrapper">
                                    <label>Return</label>
                                    <button type="button" className="cal-trigger-btn" onClick={()=>openCalendar('end')}>
                                        {endDate ? new Date(endDate+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : <span className="cal-placeholder">Select date</span>}
                                    </button>
                                </div>
                                {showCalendar && calTarget==='end' && <CalendarPanel />}
                            </div>
                        )}
                        <div className="custom-input-group" ref={paxRef}>
                            <FaUser className="field-icon" />
                            <div className="input-wrapper">
                                <label>Travelers & Class</label>
                                <button type="button" className="pax-trigger-btn"
                                    onClick={()=>{setShowPaxDropdown(p=>!p); setShowCalendar(false);}}>
                                    <span>
                                        {adults} adult{adults!==1?'s':''}
                                        {children>0?`, ${children} child${children!==1?'ren':''}`:''}{infants>0?`, ${infants} infant${infants!==1?'s':''}`:''}{' · '}{flightClass}
                                    </span>
                                    <span className={`pax-trigger-arrow${showPaxDropdown?' open':''}`}>▼</span>
                                </button>
                            </div>
                            {showPaxDropdown && (
                                <div className="pax-dropdown">
                                    <p className="pax-dropdown-hint">Select the exact number of passengers to view the best prices</p>
                                    {[
                                        {label:'Adults',sub:'12+ years old',val:adults,setVal:setAdults,min:1},
                                        {label:'Children',sub:'2–11 years old',val:children,setVal:setChildren,min:0},
                                        {label:'Infants on lap',sub:'Under 2 years old',val:infants,setVal:setInfants,min:0},
                                    ].map(({label,sub,val,setVal,min})=>(
                                        <div key={label} className="pax-row">
                                            <div className="pax-label-group">
                                                <span className="pax-label">{label}</span>
                                                <span className="pax-sublabel">{sub}</span>
                                            </div>
                                            <div className="pax-counter">
                                                <button type="button" className="pax-btn pax-btn-minus" onClick={()=>setVal(v=>Math.max(min,v-1))} disabled={val<=min}>−</button>
                                                <span className="pax-count">{val}</span>
                                                <button type="button" className="pax-btn pax-btn-plus" onClick={()=>setVal(v=>v+1)}>+</button>
                                            </div>
                                        </div>
                                    ))}
                                    <select className="pax-class-select" value={flightClass} onChange={e=>setFlightClass(e.target.value)}>
                                        <option value="Economy">Economy</option>
                                        <option value="Business">Business</option>
                                        <option value="First Class">First Class</option>
                                    </select>
                                    <button type="button" className="pax-done-btn" onClick={()=>setShowPaxDropdown(false)}>🔍 Done</button>
                                </div>
                            )}
                        </div>
                        <button type="submit" className="search-submit-btn"><FaSearch /> Search Flights</button>
                    </div>
                </form>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
                <div className="recent-searches-section">
                    <p className="popular-routes-title">
                        <FaClock style={{marginRight:'6px',opacity:0.6}} /> Recent Searches
                    </p>
                    <div className="recent-searches-grid">
                        {recentSearches.map((s,i)=>(
                            <div key={i} className="recent-search-card" onClick={()=>handleRecentClick(s)}>
                                <div className="recent-search-main">
                                    <span className="recent-route">
                                        <span className="recent-code">{s.origin}</span>
                                        <span className="recent-arrow"> → </span>
                                        <span className="recent-code">{s.dest}</span>
                                    </span>
                                    <span className="recent-label">{s.label}</span>
                                </div>
                                <div className="recent-search-meta">
                                    <span>{new Date(s.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span>
                                    <span>·</span><span>{s.passengers} pax</span>
                                    <span>·</span><span>{s.class}</span>
                                </div>
                                <button className="recent-remove-btn" onClick={e=>removeRecent(i,e)} title="Remove"><FaTimes /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TravelProsSection এ onPlanWithAIClick ফাংশনটি প্রপ্স আকারে পাঠানো হলো */}
            <TravelProsSection onPlanWithAIClick={handlePlanWithAIClick} />

            {/* চ্যাটবট বা এআই পপআপ উইন্ডো (টেস্ট করার জন্য এখানে স্ট্রাকচার দেওয়া হলো) */}
            {showChatbot && (
                <div className="ai-chatbot-modal" style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#fff', border: '1px solid #ccc', padding: '20px', zIndex: 1000, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0 }}>SkyOrbit AI Travel Assistant 🤖</h4>
                        <button onClick={() => setShowChatbot(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FaTimes /></button>
                    </div>
                    <p style={{ fontSize: '14px', color: '#555' }}>How can I help with your travel plans today?</p>
                    {/* এখানে আপনার আসল চ্যাটবটের ইন্টারফেস/কম্পোনেন্ট বসাতে পারেন */}
                </div>
            )}

            {/* ── FOOTER JSX ── */}
            <footer className="sf-footer">
                {/* Top: Logo + Tagline */}
                <div className="sf-footer-top">
                    <div className="sf-footer-logo-row">
                        <div className="sf-footer-logo-icon">
                            <svg viewBox="0 0 32 32" width="32" height="32">
                                <circle cx="16" cy="16" r="15" fill="none" stroke="rgba(96,165,250,0.4)" strokeWidth="1"/>
                                <circle cx="16" cy="16" r="10" fill="none" stroke="rgba(96,165,250,0.2)" strokeWidth="1"/>
                                <text x="16" y="21" textAnchor="middle" fontSize="14" fill="#60a5fa">✈</text>
                            </svg>
                        </div>
                        <div>
                            <div className="sf-footer-brand-name">SKYORBIT</div>
                            <div className="sf-footer-brand-sub">AIRLINE &amp; TRAVEL SOLUTIONS</div>
                        </div>
                    </div>
                    <p className="sf-footer-tagline-text">
                        Your trusted partner for seamless travel experiences. Discover the world with comfort and style.
                    </p>
                </div>

                {/* 4 Columns */}
                <div className="sf-footer-inner">
                    <div className="sf-footer-col">
                        <h4 className="sf-footer-col-title">🏢 Company</h4>
                        <ul className="sf-footer-links">
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Press &amp; Media</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Partners</a></li>
                        </ul>
                    </div>

                    <div className="sf-footer-col">
                        <h4 className="sf-footer-col-title">✈ Services</h4>
                        <ul className="sf-footer-links">
                            <li><a href="#">Flight Search</a></li>
                            <li><a href="#">Seat Selection</a></li>
                            <li><a href="#">Group Booking</a></li>
                            <li><a href="#">Charter Flights</a></li>
                            <li><a href="#">Baggage Info</a></li>
                        </ul>
                    </div>

                    <div className="sf-footer-col">
                        <h4 className="sf-footer-col-title">🗺 Resources</h4>
                        <ul className="sf-footer-links">
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Support Center</a></li>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Refund Policy</a></li>
                            <li><a href="#">Flight Status</a></li>
                        </ul>
                    </div>

                    <div className="sf-footer-col">
                        <h4 className="sf-footer-col-title">📩 Newsletter</h4>
                        <p className="sf-footer-subscribe-desc">
                            Subscribe to get exclusive deals, travel tips &amp; flight updates
                        </p>
                        <div className="sf-subscribe-form">
                            <input type="email" className="sf-subscribe-input" placeholder="Enter your email" />
                            <button type="button" className="sf-subscribe-btn">Subscribe ✈</button>
                        </div>
                        <p className="sf-footer-no-spam">No spam, unsubscribe anytime</p>
                        <div className="sf-footer-follow-label">Follow Us</div>
                        <div className="sf-footer-socials">
                            <a href="#" className="sf-social-btn" aria-label="Facebook">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                                </svg>
                            </a>
                            <a href="#" className="sf-social-btn" aria-label="Twitter">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                                </svg>
                            </a>
                            <a href="#" className="sf-social-btn" aria-label="Instagram">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                                    <circle cx="12" cy="12" r="4"/>
                                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                                </svg>
                            </a>
                            <a href="#" className="sf-social-btn" aria-label="LinkedIn">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                                    <circle cx="4" cy="4" r="2"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="sf-footer-divider" />
                <div className="sf-footer-bottom">
                    <span className="sf-footer-copy">© {new Date().getFullYear()} SkyOrbit. All rights reserved.</span>
                    <div className="sf-footer-legal">
                        <a href="#">Terms of Service</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Cookie Policy</a>
                        <a href="#">Sitemap</a>
                    </div>
                    <div className="sf-footer-tagline-bottom">Fly Smarter, Travel Further ✈</div>
                </div>
            </footer>
        </div>
    );
};

export default SearchFlights;