import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Bot, X, Send, Sparkles, Clock, TrendingDown, Calendar, Compass, DollarSign, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CARDS = [
  {
    id: 'ai', title: 'Plan with AI', sub: 'Get travel questions answered',
    tag: 'New', accent: '#6366f1', glow: 'rgba(99,102,241,0.4)',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ai-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity=".18"/>
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#ai-bg)"/>
        <circle cx="32" cy="32" r="29" stroke="rgba(99,102,241,0.25)" strokeWidth="1"/>
        <rect x="16" y="20" width="32" height="24" rx="5" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.2"/>
        <rect x="20" y="24" width="24" height="3" rx="1.5" fill="#334155" opacity=".5"/>
        <circle cx="24" cy="34" r="2.5" fill="#6366f1"/>
        <circle cx="32" cy="34" r="2.5" fill="#818cf8" opacity=".7"/>
        <circle cx="40" cy="34" r="2.5" fill="#a5b4fc" opacity=".4"/>
        <path d="M32 20 L32 14" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="32" cy="12" r="3.5" fill="#4f46e5" stroke="#6366f1" strokeWidth="1"/>
        <path d="M26 20 L32 14 L38 20" stroke="#6366f1" strokeWidth="1" fill="none"/>
        <path d="M20 44 L32 48 L44 44" stroke="rgba(99,102,241,0.35)" strokeWidth="1" fill="none"/>
        <text x="32" y="58" textAnchor="middle" fontSize="7" fill="#6366f1" fontFamily="monospace" opacity=".8" fontWeight="bold">AI</text>
      </svg>
    ),
  },
  {
    id: 'time', title: 'Best Time', sub: 'Know when prices drop',
    tag: 'Tip', accent: '#f59e0b', glow: 'rgba(245,158,11,0.4)',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="time-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d97706" stopOpacity=".15"/>
            <stop offset="100%" stopColor="#d97706" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#time-bg)"/>
        <circle cx="32" cy="32" r="29" stroke="rgba(245,158,11,0.2)" strokeWidth="1"/>
        <circle cx="32" cy="32" r="18" stroke="#f59e0b" strokeWidth="1.5" fill="rgba(245,158,11,0.04)"/>
        <line x1="32" y1="18" x2="32" y2="22" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="32" y1="42" x2="32" y2="46" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
        <line x1="18" y1="32" x2="22" y2="32" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
        <line x1="42" y1="32" x2="46" y2="32" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
        <line x1="32" y1="22" x2="32" y2="32" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
        <line x1="32" y1="32" x2="39" y2="37" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="32" cy="32" r="2.5" fill="#f59e0b"/>
        <rect x="8" y="18" width="10" height="6" rx="2" fill="#14532d" stroke="#22c55e" strokeWidth=".8"/>
        <text x="13" y="22.5" textAnchor="middle" fontSize="4" fill="#4ade80" fontFamily="sans-serif" fontWeight="bold">LOW</text>
        <rect x="46" y="24" width="10" height="6" rx="2" fill="#7f1d1d" stroke="#ef4444" strokeWidth=".8"/>
        <text x="51" y="28.5" textAnchor="middle" fontSize="4" fill="#f87171" fontFamily="sans-serif" fontWeight="bold">HIGH</text>
      </svg>
    ),
  },
  {
    id: 'explore', title: 'Explore', sub: 'Destinations on your budget',
    tag: 'Deals', accent: '#10b981', glow: 'rgba(16,185,129,0.4)',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="exp-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#059669" stopOpacity=".14"/>
            <stop offset="100%" stopColor="#059669" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#exp-bg)"/>
        <circle cx="32" cy="32" r="29" stroke="rgba(16,185,129,0.2)" strokeWidth="1"/>
        <circle cx="32" cy="30" r="16" stroke="#10b981" strokeWidth="1" opacity=".35"/>
        <circle cx="32" cy="30" r="16" stroke="#10b981" strokeWidth=".5" strokeDasharray="2 4" opacity=".5"/>
        <ellipse cx="28" cy="27" rx="7" ry="5" fill="#065f46" opacity=".85"/>
        <ellipse cx="37" cy="25" rx="6" ry="7" fill="#065f46" opacity=".75"/>
        <ellipse cx="30" cy="36" rx="5" ry="4" fill="#047857" opacity=".6"/>
        <circle cx="23" cy="25" r="2.5" fill="#fbbf24"/>
        <circle cx="39" cy="20" r="2.5" fill="#fbbf24"/>
        <circle cx="31" cy="35" r="2.5" fill="#fbbf24"/>
        <circle cx="44" cy="38" r="9" fill="none" stroke="#c2410c" strokeWidth="2.5" opacity=".9"/>
        <line x1="51" y1="45" x2="57" y2="51" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="48" cy="16" r="5.5" fill="#065f46"/>
        <text x="48" y="18.5" textAnchor="middle" fontSize="7" fill="#4ade80" fontWeight="bold">$</text>
      </svg>
    ),
  },
  {
    id: 'trips', title: 'My Trips', sub: 'All your plans in one place',
    tag: 'Pro', accent: '#3b82f6', glow: 'rgba(59,130,246,0.4)',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="trip-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity=".12"/>
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#trip-bg)"/>
        <circle cx="32" cy="32" r="29" stroke="rgba(59,130,246,0.2)" strokeWidth="1"/>
        <rect x="12" y="20" width="40" height="26" rx="4" fill="#0f1c35" stroke="#1e3a5f" strokeWidth="1.2"/>
        <rect x="12" y="20" width="40" height="7" rx="4" fill="#1e3a5f"/>
        <rect x="16" y="23" width="4" height="4" rx="1" fill="#3b82f6" opacity=".6"/>
        <rect x="22" y="24" width="12" height="2" rx="1" fill="#334155" opacity=".7"/>
        <path d="M18 36 Q26 28 34 31 Q42 34 50 28" stroke="#3b82f6" strokeWidth="1.8" strokeDasharray="3,2" fill="none" opacity=".85"/>
        <circle cx="18" cy="36" r="2.5" fill="#ef4444"/>
        <circle cx="18" cy="36" r="1" fill="#fff"/>
        <circle cx="50" cy="28" r="2.5" fill="#22c55e"/>
        <circle cx="50" cy="28" r="1" fill="#fff"/>
        <rect x="29" y="29" width="8" height="5" rx="1.5" fill="#c2410c"/>
        <g transform="translate(44,42) rotate(-30)">
          <path d="M0,2 L12,2 Q14,2 14,4 Q14,6 12,6 L0,6 Z" fill="#dbeafe" opacity=".9"/>
          <path d="M8,0 L12,2 L8,3 Z" fill="#93c5fd"/>
        </g>
      </svg>
    ),
  },
  {
    id: 'alerts', title: 'Price Alerts', sub: 'Know when prices change',
    tag: 'Live', accent: '#ec4899', glow: 'rgba(236,72,153,0.4)',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="alert-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#db2777" stopOpacity=".12"/>
            <stop offset="100%" stopColor="#db2777" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#alert-bg)"/>
        <circle cx="32" cy="32" r="29" stroke="rgba(236,72,153,0.2)" strokeWidth="1"/>
        <rect x="22" y="18" width="20" height="30" rx="4" fill="#1e3a5f" stroke="#ec4899" strokeWidth="1.2"/>
        <rect x="25" y="21" width="14" height="20" rx="2" fill="#0f172a"/>
        <rect x="27" y="24" width="10" height="2" rx="1" fill="#334155"/>
        <rect x="27" y="28" width="6" height="2" rx="1" fill="#ec4899"/>
        <rect x="27" y="32" width="8" height="2" rx="1" fill="#334155"/>
        <rect x="29" y="50" width="6" height="2" rx="1" fill="#c2410c"/>
        <g transform="translate(12,10) rotate(-12)">
          <rect x="0" y="0" width="14" height="12" rx="3" fill="#ea580c" stroke="#c2410c" strokeWidth=".8"/>
          <path d="M7,3 L7,9 M4,6 L10,6" stroke="#fef3c7" strokeWidth="1.4" strokeLinecap="round"/>
        </g>
        <polygon points="50,16 52,19.5 56,19.5 53,22 54,26 50,23.5 46,26 47,22 44,19.5 48,19.5" fill="#fbbf24" opacity=".9"/>
        <polygon points="48,40 49.5,43 52.5,43 50,45 51,48 48,46 45,48 46,45 43.5,43 46.5,43" fill="#3b82f6" opacity=".7"/>
        <polygon points="14,44 15.5,47 18.5,47 16,49 17,52 14,50 11,52 12,49 9.5,47 12.5,47" fill="#ef4444" opacity=".55"/>
      </svg>
    ),
  },
  {
    id: 'tracker', title: 'Flight Tracker', sub: 'See real-time delays',
    tag: 'Real-time', accent: '#0ea5e9', glow: 'rgba(14,165,233,0.4)',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="track-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity=".12"/>
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#track-bg)"/>
        <circle cx="32" cy="32" r="29" stroke="rgba(14,165,233,0.2)" strokeWidth="1"/>
        <rect x="12" y="28" width="40" height="24" rx="5" fill="#1e3a5f" stroke="#0ea5e9" strokeWidth="1.2" transform="rotate(-3 32 40)"/>
        <rect x="14" y="30" width="36" height="20" rx="4" fill="#0ea5e9" transform="rotate(-3 32 40)"/>
        <path d="M18 40 Q26 36 34 38 Q42 40 48 36" fill="none" stroke="rgba(2,132,199,0.6)" strokeWidth="2" transform="rotate(-3 33 38)"/>
        <g transform="translate(16,10) rotate(-8)">
          <path d="M0,12 L30,12 Q32,12 32,10 L32,8 Q32,6 30,6 L8,6 L5,3 L2,3 L5,6 L5,10 Q0,10 0,12 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth=".7"/>
          <path d="M32,10 L38,5 L38,3 Q38,1 35,1 L32,5 L32,10 Z" fill="#ea580c"/>
          <circle cx="8" cy="9" r="1.8" fill="#ef4444"/>
          <rect x="14" y="8" width="12" height="2" rx="1" fill="#94a3b8" opacity=".7"/>
        </g>
        <circle cx="48" cy="17" r="7" fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.3)" strokeWidth=".8"/>
        <text x="48" y="22" textAnchor="middle" fontSize="10" opacity=".85">☁</text>
        <g transform="translate(44,46)">
          <rect x="0" y="0" width="16" height="12" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth=".8"/>
          <circle cx="8" cy="6" r="3.5" fill="#0ea5e9"/>
          <circle cx="8" cy="6" r="1.5" fill="#fff"/>
        </g>
      </svg>
    ),
  },
];

const TAG_COLORS = {
  New: '#6366f1', Tip: '#f59e0b', Deals: '#10b981',
  Pro: '#3b82f6', Live: '#ec4899', 'Real-time': '#0ea5e9',
};

const initialAiMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Hello! I am your AI Travel Planner. Where are you planning to go next, and for how many days?',
    timestamp: new Date()
  }
];

export default function TravelProsSection() {
  const navigate    = useNavigate();
  const gridRef     = useRef(null);
  const modalEndRef = useRef(null);
  const [active,    setActive]    = useState(null);
  const [visible,   setVisible]   = useState(false);
  const [canLeft,   setCanLeft]   = useState(false);
  const [canRight,  setCanRight]  = useState(true);

  // ── ১. Plan with AI State ──
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState(initialAiMessages);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // ── ২. Best Time State ──
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [routeInput, setRouteInput] = useState('');
  const [timeResult, setTimeResult] = useState(null);
  const [isTimeLoading, setIsTimeLoading] = useState(false);

  // ── ৩. 🧭 Explore Budget State ──
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [originInput, setOriginInput] = useState('');
  const [daysInput, setDaysInput] = useState('7');
  const [exploreResults, setExploreResults] = useState([]);
  const [isExploreLoading, setIsExploreLoading] = useState(false);
  const [selectedPlaceIdx, setSelectedPlaceIdx] = useState(null);

  // ── ৪. Leaflet Map Refs ──
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersLayer = useRef(null);
  const markerRefs = useRef([]);

  /* reveal on scroll */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (gridRef.current) obs.observe(gridRef.current);
    return () => obs.disconnect();
  }, []);

  /* scroll state */
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const upd = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };
    el.addEventListener('scroll', upd);
    upd();
    return () => el.removeEventListener('scroll', upd);
  }, []);

  /* auto scroll down chat */
  useEffect(() => {
    if (isAiOpen) {
      modalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiLoading, isAiOpen]);

  const scroll = (dir) => gridRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  // ── Leaflet Map Engine Init ──
  useEffect(() => {
    if (!isExploreOpen) return;

    const timer = setTimeout(() => {
      if (!mapRef.current || leafletMap.current) return;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [23.6850, 90.3563],
        zoom: 6,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      markersLayer.current = L.layerGroup().addTo(map);
      leafletMap.current = map;
    }, 150);

    return () => {
      clearTimeout(timer);
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markersLayer.current = null;
      }
    };
  }, [isExploreOpen]);

  // ── 🧭 Explore Budget API Call & Reverse Geocoding ──
  const handleExploreBudget = async (e) => {
    e.preventDefault();
    if (!budgetInput.trim() || !originInput.trim() || isExploreLoading) return;

    setIsExploreLoading(true);
    setExploreResults([]);
    setSelectedPlaceIdx(null);
    markerRefs.current = [];
    if (markersLayer.current) markersLayer.current.clearLayers();

    try {
      const response = await fetch('http://localhost:5000/explore-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          budget: budgetInput.trim(),
          origin: originInput.trim(),
          days: daysInput.trim()
        })
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      
      // Geocoding the coordinates instantly upon arrival
      const computedResults = [];
      const bounds = [];

      for (let i = 0; i < data.length; i++) {
        const place = data[i];
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place.destination)}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'TravelApp/1.0' } }
          );
          const geoData = await geoRes.json();
          
          let lat = 23.6850, lng = 90.3563; // Default fallbacks
          if (geoData && geoData[0]) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
            bounds.push([lat, lng]);
          }

          // Custom Marker Icon Injector
          const customIcon = L.divIcon({
            className: '',
            html: `
              <div style="
                background: #10b981;
                border: 2px solid #fff;
                border-radius: 50% 50% 50% 0;
                width: 30px; height: 30px;
                transform: rotate(-45deg);
                box-shadow: 0 4px 12px rgba(16,185,129,0.4);
                display: flex; align-items: center; justify-content: center;
              ">
                <span style="transform: rotate(45deg); font-size: 12px;">📍</span>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -32],
          });

          const marker = L.marker([lat, lng], { icon: customIcon });
          marker.bindPopup(`
            <div style="font-family:'DM Sans',sans-serif; min-width:160px; color:#1e293b;">
              <strong style="font-size:14px;color:#0f172a;">${place.destination}</strong><br/>
              <span style="font-size:12px;color:#475569;">Estimate: ${place.totalEstimate}</span>
            </div>
          `);

          if (markersLayer.current) {
            marker.addTo(markersLayer.current);
          }

          computedResults.push({ ...place, lat, lng, marker });
        } catch (err) {
          computedResults.push({ ...place, lat: null, lng: null, marker: null });
        }
      }

      setExploreResults(computedResults);

      if (bounds.length > 0 && leafletMap.current) {
        leafletMap.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
      }

    } catch (error) {
      console.error("Explore Places API Error:", error);
      alert("Error: Could not find any destination matching the criteria.");
    } finally {
      setIsExploreLoading(false);
    }
  };

  // ── Interactive Map Fly To Trigger ──
  const handlePlaceCardClick = (idx, place) => {
    setSelectedPlaceIdx(idx);
    if (!leafletMap.current || !place.lat || !place.lng) return;

    // Smooth panning and zoom shift
    leafletMap.current.flyTo([place.lat, place.lng], 11, {
      animate: true,
      duration: 1.5
    });

    if (place.marker) {
      setTimeout(() => {
        place.marker.openPopup();
      }, 1200);
    }
  };

  // ── AI Message Engine ──
  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isAiLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAiLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...aiMessages, userMsg].map(m => ({ role: m.role, content: m.text }))
        })
      });
      const data = await response.json();

      setAiMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.response || 'I could not generate a response right now.',
        timestamp: new Date()
      }]);
    } catch (error) {
      setAiMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: 'Sorry, I could not reach the AI planner right now. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ── Price Trends Engine ──
  const handleCheckBestTime = async (e) => {
    e.preventDefault();
    if (!routeInput.trim() || isTimeLoading) return;

    setIsTimeLoading(true);
    setTimeResult(null);

    try {
      const response = await fetch('http://localhost:5000/best-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: routeInput.trim() })
      });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setTimeResult(data);
    } catch (error) {
      console.error("Best Time API Error:", error);
      alert("Error: Could not retrieve the details.");
    } finally {
      setIsTimeLoading(false);
    }
  };

  return (
    <section className="tps-section">
      {/* Header */}
      <div className="tps-header">
        <div className="tps-header-left">
          <span className="tps-eyebrow">Tools &amp; Features</span>
          <h2 className="tps-title">For travel pros</h2>
        </div>
        <div className="tps-nav-row">
          <button
            className={`tps-nav-btn${!canLeft ? ' tps-nav-btn--disabled' : ''}`}
            onClick={() => scroll(-1)} disabled={!canLeft} aria-label="Previous"
          ><FaChevronLeft size={12} /></button>
          <button
            className={`tps-nav-btn${!canRight ? ' tps-nav-btn--disabled' : ''}`}
            onClick={() => scroll(1)} disabled={!canRight} aria-label="Next"
          ><FaChevronRight size={12} /></button>
        </div>
      </div>

      {/* Primary Carousel Dashboard Grid */}
      <div className="tps-grid" ref={gridRef}>
        {CARDS.map((card, i) => (
          <div
            key={card.id}
            className={`tps-card${visible ? ' tps-card--visible' : ''}${active === card.id ? ' tps-card--active' : ''}`}
            style={{ '--accent': card.accent, '--glow': card.glow, '--delay': `${i * 90}ms` }}
            onClick={() => {
              if (card.id === 'ai') setIsAiOpen(true); 
              else if (card.id === 'time') setIsTimeOpen(true); 
              else if (card.id === 'explore') setIsExploreOpen(true); 
              else if (card.id === 'trips') navigate('/my-trips');
            }}
            onMouseEnter={() => setActive(card.id)}
            onMouseLeave={() => setActive(null)}
          >
            <div className="tps-card-border" />
            <div className="tps-card-glow" />
            <div className="tps-particles">
              {[0,1,2,3].map(pi => (
                <span key={pi} className="tps-particle" style={{ '--pi': pi }} />
              ))}
            </div>
            <div className="tps-card-tag" style={{ '--tag-c': TAG_COLORS[card.tag] || card.accent }}>
              {card.tag}
            </div>
            <div className="tps-card-body">
              <div className="tps-icon-wrap">{card.icon}</div>
              <div className="tps-text">
                <h3 className="tps-card-title">{card.title}</h3>
                <p className="tps-card-sub">{card.sub}</p>
              </div>
            </div>
            <div className="tps-card-shimmer" />
          </div>
        ))}
      </div>

      {/* ── 🚀 MODAL 1: Plan with AI ── */}
      {isAiOpen && (
        <div className="tps-ai-modal-overlay" onClick={() => setIsAiOpen(false)}>
          <div className="tps-ai-modal-window" onClick={(e) => e.stopPropagation()}>
            <header className="tps-ai-modal-header">
              <div className="tps-ai-modal-title">
                <Bot size={20} />
                <h3>AI Travel Planner</h3>
              </div>
              <button className="tps-close-modal-btn" onClick={() => setIsAiOpen(false)}>
                <X size={18} />
              </button>
            </header>
            <div className="tps-ai-modal-chat-body">
              {aiMessages.map((msg) => (
                <div key={msg.id} className={`tps-modal-chat-bubble ${msg.role}`}>
                  <p>{msg.text}</p>
                </div>
              ))}
              {isAiLoading && (
                <div className="tps-modal-chat-bubble assistant tps-typing">
                  <span className="tps-dot">.</span><span className="tps-dot">.</span><span className="tps-dot">.</span>
                </div>
              )}
              <div ref={modalEndRef} />
            </div>
            <form className="tps-ai-modal-input-form" onSubmit={handleSendAiMessage}>
              <div className="tps-ai-input-wrap">
                <Sparkles size={16} className="tps-input-sparkle" />
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask any travel plan (e.g., 3 days plan for Sylhet)..."
                />
              </div>
              <button type="submit" className="tps-ai-send-btn" disabled={!inputValue.trim() || isAiLoading}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── ⏰ MODAL 2: Best Time to Book Window ── */}
      {isTimeOpen && (
        <div className="tps-ai-modal-overlay" onClick={() => setIsTimeOpen(false)}>
          <div className="tps-ai-modal-window" style={{ borderColor: '#f59e0b' }} onClick={(e) => e.stopPropagation()}>
            <header className="tps-ai-modal-header" style={{ background: 'linear-gradient(to right, #78350f, #1e1b4b)' }}>
              <div className="tps-ai-modal-title" style={{ color: '#f59e0b' }}>
                <Clock size={20} />
                <h3>Price Prediction &amp; Best Time</h3>
              </div>
              <button className="tps-close-modal-btn" onClick={() => setIsTimeOpen(false)}>
                <X size={18} />
              </button>
            </header>
            <div className="tps-ai-modal-chat-body" style={{ padding: '24px' }}>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                Enter your destination route to calculate historical price trends and ideal booking frames.
              </p>
              <form onSubmit={handleCheckBestTime} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                  type="text"
                  value={routeInput}
                  onChange={(e) => setRouteInput(e.target.value)}
                  placeholder="e.g., Dhaka to Cox's Bazar"
                  style={{
                    flex: 1, background: '#0f172a', border: '1px solid #334155',
                    color: '#fff', padding: '10px 14px', borderRadius: '6px', outline: 'none'
                  }}
                />
                <button 
                  type="submit" 
                  style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold', padding: '0 16px', borderRadius: '6px', cursor: 'pointer' }}
                  disabled={isTimeLoading}
                >
                  {isTimeLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </form>
              {timeResult && (
                <div style={{ background: '#0f1c35', border: '1px solid rgba(245,158,11,0.2)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80' }}>
                      <TrendingDown size={18} />
                      <span style={{ fontSize: '14px' }}>Potential Savings: <strong>{timeResult.savingPercent || timeResult.saving_percent || '24%'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }}>
                      <Calendar size={18} />
                      <span style={{ fontSize: '14px' }}>Best Month: <strong>{timeResult.bestMonth || timeResult.best_month || 'September'}</strong></span>
                    </div>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                    {timeResult.advice || timeResult.Advice}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 🧭 MODAL 3: Explore Budget (Split View UI Image Match) ── */}
      {isExploreOpen && (
        <div className="tps-ai-modal-overlay" onClick={() => setIsExploreOpen(false)}>
          <div className="tps-split-modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="tps-split-close-btn" onClick={() => setIsExploreOpen(false)}>
              <X size={18} />
            </button>

            <div className="tps-split-layout">
              {/* LEFT SIDEBAR PANEL */}
              <div className="tps-split-sidebar">
                <div className="tps-panel-header">
                  <div className="tps-panel-icon-shield">
                    <Compass size={22} />
                  </div>
                  <div>
                    <h3>Explore Destinations</h3>
                    <p>Unlock structured spots syncing your real budget metrics.</p>
                  </div>
                </div>

                <form onSubmit={handleExploreBudget} className="tps-panel-form">
                  <div className="tps-form-grid-inputs">
                    <div className="tps-field">
                      <label>Departure Point</label>
                      <input 
                        type="text" value={originInput}
                        onChange={(e) => setOriginInput(e.target.value)}
                        placeholder="e.g., Dhaka" required
                      />
                    </div>
                    <div className="tps-field">
                      <label>Trip Length</label>
                      <input 
                        type="number" value={daysInput}
                        onChange={(e) => setDaysInput(e.target.value)}
                        placeholder="Days" min="1" required
                      />
                    </div>
                  </div>

                  <div className="tps-field">
                    <label>Your Capital Boundary</label>
                    <div className="tps-input-icon-group">
                      <DollarSign size={16} className="tps-inline-ic" />
                      <input 
                        type="text" value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        placeholder="e.g., $800 or 50000 BDT" required
                      />
                    </div>
                  </div>

                  <button type="submit" className="tps-panel-submit-btn" disabled={isExploreLoading}>
                    {isExploreLoading ? 'Mapping Choices...' : 'Find Destinations'}
                  </button>
                </form>

                {/* Left Side: Dynamic List Cards */}
                <div className="tps-split-results-feed">
                  {exploreResults.map((place, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handlePlaceCardClick(idx, place)}
                      className={`tps-feed-card ${selectedPlaceIdx === idx ? 'active-selection' : ''}`}
                    >
                      <div className="tps-feed-card-header">
                        <h4>{place.destination}</h4>
                        <span className="tps-feed-cost-tag">{place.totalEstimate}</span>
                      </div>
                      <p className="tps-feed-desc">{place.highlight}</p>
                      
                      <div className="tps-feed-badge-row">
                        <span className="tps-badge transport">✈️ {place.flightCost}</span>
                        <span className="tps-badge hotel">🏨 {place.hotelCost}</span>
                        <span className="tps-badge food">🍔 {place.foodActivities}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT VIEWPORT PANEL: Live Map System */}
              <div className="tps-split-map-viewport">
                <div className="tps-viewport-banner-label">
                  <MapPin size={14} /> Interactive Spatial Viewport
                </div>
                <div ref={mapRef} className="tps-viewport-leaflet-canvas" />
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}