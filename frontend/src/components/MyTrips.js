import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import './MyTrips.css';

const MyTrips = () => {
  const [userId] = useState(localStorage.getItem('user_id') || 1);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);
  const [costSummary, setCostSummary] = useState({ total_trips: 0, total_spent: 0, upcoming_cost: 0, bookmarked: 0 });
  
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, bookmarked
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // ১. ড্যাশবোর্ড ডেটা এবং সামারি লোড করা
  const fetchTripsData = async () => {
    setLoading(true);
    try {
      // ব্যাকএন্ডের /trips/summary থেকে সামারি আনা
      const summaryRes = await fetch(`http://localhost:5000/trips/summary?user_id=${userId}`);
      const summaryData = await summaryRes.json();
      if (!summaryData.error) {
        setCostSummary(summaryData);
      } else {
        setCostSummary({ total_trips: 0, total_spent: 0, upcoming_cost: 0, bookmarked: 0 });
      }

      // /trips থেকে আপকামিং ও পাস্ট ট্রিপের ডেটা আনা
      const tripsRes = await fetch(`http://localhost:5000/trips?user_id=${userId}`);
      const tripsData = await tripsRes.json();
      
      setUpcomingTrips(tripsData.upcoming || []);
      setPastTrips(tripsData.past || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setCostSummary({ total_trips: 0, total_spent: 0, upcoming_cost: 0, bookmarked: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsData();
  }, [userId]);

  // ২. বুকমার্ক টগল করা (PATCH /trips/:id/bookmark)
  const handleToggleBookmark = async (tripId) => {
    try {
      const response = await fetch(`http://localhost:5000/trips/${tripId}/bookmark?user_id=${userId}`, {
        method: 'PATCH'
      });
      if (response.ok) {
        fetchTripsData(); // ডেটা রিফ্রেশ করা
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  // ৩. ট্রিপ ডিলিট করা (DELETE /trips/:id)
  const handleDeleteTrip = async (tripId) => {
    if (window.confirm("Are you sure you want to delete this trip from history?")) {
      try {
        const response = await fetch(`http://localhost:5000/trips/${tripId}?user_id=${userId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        alert(data.message || "Trip deleted");
        fetchTripsData();
        setSelectedTrip(null);
      } catch (error) {
        alert("Failed to delete the trip.");
      }
    }
  };

  // বুকমার্কড ফিল্টার্ড লিস্ট তৈরি
  const bookmarkedTrips = [...upcomingTrips, ...pastTrips].filter(t => t.bookmarked);
  const activeTripsList = activeTab === 'upcoming' ? upcomingTrips : activeTab === 'past' ? pastTrips : bookmarkedTrips;

  return (
    <div className="my-trips-container">
      <div className="my-trips-wrapper">
        
        <h1 className="my-trips-header">My Trips</h1>
        <p className="my-trips-subheader">Manage your journeys, track travel plans, and review cost analysis.</p>

        {/* 📊 Cost & Trip Summaries (toFixed ক্র্যাশ প্রটেকশনসহ) */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="icon-box-trips"><Calendar size={22} /></div>
            <div>
              <p className="card-title">Total Trips</p>
              <h3 className="card-value">{costSummary ? costSummary.total_trips : 0}</h3>
            </div>
          </div>

          <div className="summary-card">
            <div className="icon-box-spent"><DollarSign size={22} /></div>
            <div>
              <p className="card-title">Total Past Spent</p>
              <h3 className="card-value">
                ${costSummary && costSummary.total_spent ? costSummary.total_spent.toFixed(2) : "0.00"}
              </h3>
            </div>
          </div>

          <div className="summary-card">
            <div className="icon-box-bookmark"><Bookmark size={22} /></div>
            <div>
              <p className="card-title">Saved/Bookmarked</p>
              <h3 className="card-value">{costSummary ? costSummary.bookmarked : 0}</h3>
            </div>
          </div>
        </div>

        {/* 🔄 Tab Bar */}
        <div className="tabs-container">
          <button onClick={() => setActiveTab('upcoming')} className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}>
            Upcoming ({upcomingTrips.length})
          </button>
          <button onClick={() => setActiveTab('past')} className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}>
            Past History ({pastTrips.length})
          </button>
          <button onClick={() => setActiveTab('bookmarked')} className={`tab-btn ${activeTab === 'bookmarked' ? 'active' : ''}`}>
            Saved ({bookmarkedTrips.length})
          </button>
        </div>

        {/* ✈️ Trips Grid Display */}
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading trip dashboard...</p>
        ) : activeTripsList.length === 0 ? (
          <div className="empty-state">No trips found in this section.</div>
        ) : (
          <div className="trips-list">
            {activeTripsList.map((trip) => {
              return (
                <div key={trip.id} className="trip-card">
                  
                  <div className="route-info">
                    <div className="route-title">
                      <span>{trip.origin}</span>
                      <ArrowRight size={16} style={{ color: '#38bdf8' }} />
                      <span>{trip.destination}</span>
                    </div>
                    <p className="route-sub">{trip.airline || 'N/A'} • {trip.flight_number}</p>
                  </div>

                  <div className="schedule-info">
                    <Clock size={18} style={{ color: '#94a3b8' }} />
                    <div>
                      <p className="time-text">{trip.departure_date}</p>
                      <p className="price-text">Class: <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{trip.seat_class || 'Economy'}</span></p>
                    </div>
                  </div>

                  <div className="status-price-box">
                    <span className="status-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                      {trip.status || 'upcoming'}
                    </span>
                    <div className="trip-price">
                      ${trip.total_cost ? parseFloat(trip.total_cost).toFixed(2) : trip.price ? parseFloat(trip.price).toFixed(2) : "0.00"}
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button onClick={() => handleToggleBookmark(trip.id)} className="bookmark-btn">
                      {trip.bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                    <button onClick={() => setSelectedTrip(trip)} className="details-btn">
                      Details
                    </button>
                    <button onClick={() => handleDeleteTrip(trip.id)} className="delete-btn" style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* 🔍 Details Popup Modal */}
        {selectedTrip && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-header">Trip Overview</h2>
              
              <div className="modal-rows">
                <div className="modal-row">
                  <span className="modal-label">Flight / Airline:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedTrip.airline || 'N/A'} ({selectedTrip.flight_number})</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Route:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedTrip.origin} ➔ {selectedTrip.destination}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Departure Date:</span>
                  <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{selectedTrip.departure_date}</span>
                </div>
                {selectedTrip.return_date && (
                  <div className="modal-row">
                    <span className="modal-label">Return Date:</span>
                    <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{selectedTrip.return_date}</span>
                  </div>
                )}
                <div className="modal-row">
                  <span className="modal-label">Travelers:</span>
                  <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{selectedTrip.travelers} Person(s)</span>
                </div>
                <div className="modal-row" style={{ borderTop: '1px dashed #334155', paddingTop: '12px' }}>
                  <span className="modal-label">Total Cost:</span>
                  <span style={{ fontWeight: 'bold', color: '#34d399', fontSize: '18px' }}>
                    ${selectedTrip.total_cost ? parseFloat(selectedTrip.total_cost).toFixed(2) : "0.00"} {selectedTrip.currency || 'USD'}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={() => setSelectedTrip(null)} className="close-btn">Close</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyTrips;